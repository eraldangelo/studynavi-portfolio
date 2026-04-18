import crypto from 'crypto';
import admin from 'firebase-admin';
import { getAdminDb } from '@/lib/firebase/admin';

type CheckInput = {
  scope: string;
  identity: string;
  limit: number;
  windowMs: number;
  nowMs?: number;
  useInMemoryOnly?: boolean;
};

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
  remaining: number;
};

const COLLECTION = '__rateLimits';
const FALLBACK = new Map<string, { count: number; resetAt: number }>();
const MAX_FALLBACK_ENTRIES = 5_000;
let lastFallbackCleanupMs = 0;

function hash(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function getRetryAfterSeconds(nowMs: number, windowStartMs: number, windowMs: number) {
  const resetAt = windowStartMs + windowMs;
  return Math.max(1, Math.ceil((resetAt - nowMs) / 1000));
}

function checkInMemory(input: CheckInput): RateLimitResult {
  const nowMs = input.nowMs ?? Date.now();
  if (nowMs - lastFallbackCleanupMs > 60_000 || FALLBACK.size > MAX_FALLBACK_ENTRIES) {
    for (const [key, value] of FALLBACK.entries()) {
      if (value.resetAt <= nowMs) {
        FALLBACK.delete(key);
      }
    }
    if (FALLBACK.size > MAX_FALLBACK_ENTRIES) {
      const overflow = FALLBACK.size - MAX_FALLBACK_ENTRIES;
      let removed = 0;
      for (const key of FALLBACK.keys()) {
        FALLBACK.delete(key);
        removed += 1;
        if (removed >= overflow) break;
      }
    }
    lastFallbackCleanupMs = nowMs;
  }

  const windowStartMs = Math.floor(nowMs / input.windowMs) * input.windowMs;
  const key = `${input.scope}:${input.identity}:${windowStartMs}`;
  const existing = FALLBACK.get(key);
  const retryAfterSeconds = getRetryAfterSeconds(nowMs, windowStartMs, input.windowMs);

  if (!existing) {
    FALLBACK.set(key, { count: 1, resetAt: windowStartMs + input.windowMs });
    return { allowed: true, retryAfterSeconds, remaining: Math.max(0, input.limit - 1) };
  }
  if (existing.count >= input.limit) {
    return { allowed: false, retryAfterSeconds, remaining: 0 };
  }

  existing.count += 1;
  return {
    allowed: true,
    retryAfterSeconds,
    remaining: Math.max(0, input.limit - existing.count),
  };
}

export async function checkRateLimit(input: CheckInput): Promise<RateLimitResult> {
  if (input.limit < 1 || input.windowMs < 1) {
    return { allowed: true, retryAfterSeconds: 1, remaining: 0 };
  }

  if (input.useInMemoryOnly) {
    return checkInMemory(input);
  }

  const db = getAdminDb();
  if (!db) {
    return checkInMemory(input);
  }

  const nowMs = input.nowMs ?? Date.now();
  const windowStartMs = Math.floor(nowMs / input.windowMs) * input.windowMs;
  const windowEndMs = windowStartMs + input.windowMs;
  const retryAfterSeconds = getRetryAfterSeconds(nowMs, windowStartMs, input.windowMs);
  const identityHash = hash(`${input.scope}:${input.identity}`);
  const docId = hash(`${identityHash}:${windowStartMs}`);
  const docRef = db.collection(COLLECTION).doc(docId);

  try {
    let result: RateLimitResult = {
      allowed: false,
      retryAfterSeconds,
      remaining: 0,
    };

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(docRef);
      const current = snap.exists ? Number(snap.get('count') || 0) : 0;

      if (current >= input.limit) {
        result = { allowed: false, retryAfterSeconds, remaining: 0 };
        return;
      }

      const nextCount = current + 1;
      const expiresAt = admin.firestore.Timestamp.fromDate(new Date(windowEndMs + 24 * 60 * 60 * 1000));
      tx.set(
        docRef,
        {
          scope: input.scope,
          identityHash,
          count: nextCount,
          windowStartMs,
          windowEndMs,
          expiresAt,
          createdAt: snap.exists ? snap.get('createdAt') : admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      result = {
        allowed: true,
        retryAfterSeconds,
        remaining: Math.max(0, input.limit - nextCount),
      };
    });

    return result;
  } catch {
    return checkInMemory(input);
  }
}
