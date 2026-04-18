import crypto from 'crypto';
import { getAdminDb } from '@/lib/firebase/admin';

type AuditOutcome = 'success' | 'forbidden' | 'denied' | 'failed';

export type AuditActor = {
  uid?: string | null;
  email?: string | null;
  roles?: string[];
  isAdmin?: boolean;
  isStaff?: boolean;
};

export type AuditLogInput = {
  event: string;
  outcome: AuditOutcome;
  actor?: AuditActor;
  target?: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
};

const AUDIT_COLLECTION = '__auditLogs';
const AUDIT_SINK = String(process.env.STUDYNAVI_AUDIT_SINK || 'console').trim().toLowerCase();
const MAX_METADATA_LENGTH = 2_000;

function clipValue(value: unknown): unknown {
  if (typeof value === 'string') return value.slice(0, MAX_METADATA_LENGTH);
  if (typeof value === 'number' || typeof value === 'boolean' || value === null) return value;
  if (Array.isArray(value)) return value.slice(0, 40).map((item) => clipValue(item));
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).slice(0, 60);
    const next: Record<string, unknown> = {};
    entries.forEach(([key, item]) => {
      next[key] = clipValue(item);
    });
    return next;
  }
  return undefined;
}

function sanitizeMetadata(metadata: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!metadata || typeof metadata !== 'object') return {};
  const blockedKeys = new Set([
    'authorization',
    'password',
    'token',
    'idToken',
    'accessToken',
    'refreshToken',
    'secret',
    'openaiApiKey',
  ]);

  const result: Record<string, unknown> = {};
  Object.entries(metadata).forEach(([key, value]) => {
    if (blockedKeys.has(key)) return;
    result[key] = clipValue(value);
  });
  return result;
}

function normalizeRoles(roles: string[] | undefined): string[] {
  if (!Array.isArray(roles)) return [];
  return Array.from(new Set(
    roles
      .map((item) => String(item || '').trim().toLowerCase())
      .filter(Boolean),
  ));
}

export async function emitAuditLog(input: AuditLogInput): Promise<void> {
  const record = {
    tag: 'audit',
    event: input.event,
    outcome: input.outcome,
    target: input.target || null,
    requestId: input.requestId || null,
    actor: {
      uid: String(input.actor?.uid || '').trim() || null,
      email: String(input.actor?.email || '').trim().toLowerCase() || null,
      roles: normalizeRoles(input.actor?.roles),
      isAdmin: input.actor?.isAdmin === true,
      isStaff: input.actor?.isStaff === true,
    },
    metadata: sanitizeMetadata(input.metadata),
    timestamp: new Date().toISOString(),
  };

  console.info('[audit]', JSON.stringify(record));

  if (AUDIT_SINK !== 'firestore') return;
  const db = getAdminDb();
  if (!db) return;

  try {
    await db.collection(AUDIT_COLLECTION).doc(crypto.randomUUID()).set({
      ...record,
      createdAt: new Date(),
    });
  } catch (error) {
    console.warn('[audit] failed to write firestore sink', error);
  }
}
