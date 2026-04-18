/**
 * Chat Corrections API
 * GET: list all saved corrections (staff only)
 * POST: add/update a correction (staff only)
 * DELETE: remove a correction by topic (staff only)
 */

import { NextResponse } from 'next/server';
import { loadCorrections, saveCorrection } from '@/lib/chat';
import { getAdminDb } from '@/lib/firebase/admin';
import { authenticateApiRequest, requireStaff, type ApiActor } from '@/lib/server/api-auth';
import { checkRateLimit } from '@/lib/server/rate-limit';
import { JsonBodyError, readJsonBody } from '@/lib/server/json-body';
import { emitAuditLog } from '@/lib/server/audit-log';

const MAX_CORRECTIONS_REQUEST_BYTES = 8 * 1024;
const REQUIRE_EXPLICIT_STAFF_CLAIM_FOR_CORRECTIONS_MUTATIONS =
  String(process.env.STUDYNAVI_REQUIRE_STAFF_CLAIM_FOR_CORRECTIONS || 'true').trim().toLowerCase() !== 'false';

async function authorize(request: Request) {
  const authResult = await authenticateApiRequest(request);
  if (authResult.response) return authResult;

  const actor = authResult.actor;
  if (!actor) {
    return {
      actor: null,
      response: NextResponse.json({ error: 'Authentication required.' }, { status: 401 }),
    };
  }

  const forbidden = requireStaff(actor);
  if (forbidden) {
    return { actor: null, response: forbidden };
  }

  const rate = await checkRateLimit({
    scope: 'api.chat.corrections',
    identity: `uid:${actor.uid}`,
    limit: 60,
    windowMs: 5 * 60 * 1000,
  });
  if (!rate.allowed) {
    return {
      actor: null,
      response: NextResponse.json(
        { error: 'Too many requests. Please try again shortly.' },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } },
      ),
    };
  }

  return { actor, response: null };
}

function requireCorrectionMutationPrivilege(actor: ApiActor): NextResponse | null {
  if (!REQUIRE_EXPLICIT_STAFF_CLAIM_FOR_CORRECTIONS_MUTATIONS) return null;
  if (actor.isAdmin || actor.isStaffByClaim) return null;
  return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
}

function logCorrectionAudit(event: string, actor: ApiActor, detail: Record<string, unknown>) {
  const roles = [
    actor.isAdmin ? 'admin' : '',
    actor.isStaffByClaim ? 'staff' : '',
    actor.isStaffByEmailFallback ? 'legacy_staff_compat' : '',
  ].filter(Boolean);
  void emitAuditLog({
    event,
    outcome: 'success',
    actor: {
      uid: actor.uid,
      email: actor.email,
      roles,
      isAdmin: actor.isAdmin,
      isStaff: actor.isStaff,
    },
    target: 'chat-corrections',
    metadata: detail,
  });
}

export async function GET(request: Request) {
  try {
    const authResult = await authorize(request);
    if (authResult.response) return authResult.response;

    const corrections = await loadCorrections();
    return NextResponse.json({ corrections, count: corrections.length });
  } catch (error) {
    console.error('[runtime-alert][api.chat.corrections.get]', error);
    return NextResponse.json({ error: 'Failed to load corrections.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await authorize(request);
    if (authResult.response) return authResult.response;
    const actor = authResult.actor;
    if (!actor) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

    const forbidden = requireCorrectionMutationPrivilege(actor);
    if (forbidden) {
      void emitAuditLog({
        event: 'chat.corrections.upsert',
        outcome: 'forbidden',
        actor: { uid: actor.uid, email: actor.email, isAdmin: actor.isAdmin, isStaff: actor.isStaff },
        target: 'chat-corrections',
      });
      return forbidden;
    }

    const body = await readJsonBody<Record<string, unknown>>(request, MAX_CORRECTIONS_REQUEST_BYTES);
    const { topic, wrongAnswer, correctedAnswer } = body || {};

    if (!topic || !wrongAnswer || !correctedAnswer) {
      return NextResponse.json(
        { error: 'Missing required fields: topic, wrongAnswer, correctedAnswer' },
        { status: 400 },
      );
    }

    const saved = await saveCorrection({
      topic: String(topic).toLowerCase().replace(/\s+/g, '-').substring(0, 80),
      wrongAnswer: String(wrongAnswer).substring(0, 300),
      correctedAnswer: String(correctedAnswer).substring(0, 300),
    });

    if (!saved) {
      return NextResponse.json(
        { error: 'Failed to save correction. Firestore may not be configured.' },
        { status: 500 },
      );
    }

    logCorrectionAudit('correction-upsert', actor, {
      topic: String(topic).toLowerCase().replace(/\s+/g, '-').substring(0, 80),
      saved,
    });

    return NextResponse.json({ success: true, topic });
  } catch (error) {
    if (error instanceof JsonBodyError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[runtime-alert][api.chat.corrections.post]', error);
    return NextResponse.json({ error: 'Failed to save correction.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authResult = await authorize(request);
    if (authResult.response) return authResult.response;
    const actor = authResult.actor;
    if (!actor) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

    const forbidden = requireCorrectionMutationPrivilege(actor);
    if (forbidden) {
      void emitAuditLog({
        event: 'chat.corrections.delete',
        outcome: 'forbidden',
        actor: { uid: actor.uid, email: actor.email, isAdmin: actor.isAdmin, isStaff: actor.isStaff },
        target: 'chat-corrections',
      });
      return forbidden;
    }

    const body = await readJsonBody<Record<string, unknown>>(request, MAX_CORRECTIONS_REQUEST_BYTES);
    const topic = String(body?.topic || '').trim();
    if (!topic) {
      return NextResponse.json({ error: 'Missing required field: topic' }, { status: 400 });
    }

    const db = getAdminDb();
    if (!db) {
      return NextResponse.json({ error: 'Firestore admin not available.' }, { status: 500 });
    }

    const snapshot = await db.collection('chat-corrections').where('topic', '==', topic).get();
    if (snapshot.empty) {
      return NextResponse.json({ error: `No correction found with topic "${topic}".` }, { status: 404 });
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    logCorrectionAudit('correction-delete', actor, { topic, deletedCount: snapshot.docs.length });

    return NextResponse.json({ success: true, deleted: topic });
  } catch (error) {
    if (error instanceof JsonBodyError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[runtime-alert][api.chat.corrections.delete]', error);
    return NextResponse.json({ error: 'Failed to delete correction.' }, { status: 500 });
  }
}
