import { NextResponse } from 'next/server';
import { authenticateApiRequest, requireStaff } from '@/lib/server/api-auth';
import { checkRateLimit } from '@/lib/server/rate-limit';
import { JsonBodyError, readJsonBody } from '@/lib/server/json-body';
import { emitAuditLog } from '@/lib/server/audit-log';

type RuntimeAlertPayload = {
  source?: unknown;
  message?: unknown;
  context?: unknown;
};

const MAX_TEXT = 300;
const MAX_CONTEXT_CHARS = 1_000;
const MAX_RUNTIME_ALERT_REQUEST_BYTES = 8 * 1024;
const DEFAULT_ALLOWED_SOURCE_PREFIXES = ['pdf.'];

function getAllowedSourcePrefixes(): string[] {
  const fromEnv = String(process.env.RUNTIME_ALERT_ALLOWED_SOURCES || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return fromEnv.length > 0 ? fromEnv : DEFAULT_ALLOWED_SOURCE_PREFIXES;
}

function safeText(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, MAX_TEXT);
}

function safeContext(value: unknown): string | undefined {
  if (!value || typeof value !== 'object') return undefined;
  try {
    return JSON.stringify(value).slice(0, MAX_CONTEXT_CHARS);
  } catch {
    return undefined;
  }
}

export async function POST(req: Request) {
  try {
    const authResult = await authenticateApiRequest(req);
    if (authResult.response) return authResult.response;
    const actor = authResult.actor;
    if (!actor) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }
    const forbidden = requireStaff(actor);
    if (forbidden) {
      void emitAuditLog({
        event: 'runtime-alert.ingest',
        outcome: 'forbidden',
        actor: { uid: actor.uid, email: actor.email, isAdmin: actor.isAdmin, isStaff: actor.isStaff },
        target: 'api.runtime-alert',
      });
      return forbidden;
    }

    const rate = await checkRateLimit({
      scope: 'api.runtime-alert',
      identity: `uid:${actor.uid}`,
      limit: 80,
      windowMs: 5 * 60 * 1000,
    });
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too many runtime alerts. Please retry shortly.' },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } },
      );
    }

    const payload = await readJsonBody<RuntimeAlertPayload>(req, MAX_RUNTIME_ALERT_REQUEST_BYTES);
    const source = safeText(payload.source).toLowerCase() || 'unknown-source';
    const message = safeText(payload.message) || 'unknown-message';
    const context = safeContext(payload.context);
    const allowedPrefixes = getAllowedSourcePrefixes();
    const sourceAllowed = allowedPrefixes.some((prefix) => source.startsWith(prefix));
    if (!sourceAllowed) {
      return NextResponse.json({ error: 'Invalid alert source.' }, { status: 400 });
    }

    const logPayload = {
      tag: 'runtime-alert',
      actorUid: actor.uid,
      source,
      message,
      context,
      timestamp: new Date().toISOString(),
    };
    console.error('[runtime-alert]', JSON.stringify(logPayload));
    void emitAuditLog({
      event: 'runtime-alert.ingest',
      outcome: 'success',
      actor: {
        uid: actor.uid,
        email: actor.email,
        isAdmin: actor.isAdmin,
        isStaff: actor.isStaff,
      },
      target: 'api.runtime-alert',
      metadata: {
        source,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof JsonBodyError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[runtime-alert] invalid payload', error);
    return NextResponse.json({ error: 'Failed to ingest runtime alert.' }, { status: 500 });
  }
}
