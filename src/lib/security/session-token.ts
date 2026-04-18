const SESSION_VERSION = 1;

export const SESSION_COOKIE_NAME = '__studynavi_session';

export type SessionRole = 'admin' | 'staff' | 'support' | 'user';

export type SessionPayload = {
  v: number;
  uid: string;
  roles: SessionRole[];
  iat: number;
  exp: number;
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const start = bytes.byteOffset;
  const end = bytes.byteOffset + bytes.byteLength;
  return bytes.buffer.slice(start, end) as ArrayBuffer;
}

function toBase64Url(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64url');
  }
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value: string): Uint8Array | null {
  try {
    if (typeof Buffer !== 'undefined') {
      return new Uint8Array(Buffer.from(value, 'base64url'));
    }
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4 || 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch {
    return null;
  }
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

function uniqueRoles(roles: SessionRole[]): SessionRole[] {
  return Array.from(new Set(roles.filter(Boolean)));
}

export function resolveSessionSecret(): string {
  return String(process.env.STUDYNAVI_SESSION_SECRET || '').trim();
}

export function getSessionTtlSeconds(): number {
  const fallback = 12 * 60 * 60;
  const parsed = Number.parseInt(String(process.env.STUDYNAVI_SESSION_TTL_SECONDS || ''), 10);
  if (!Number.isFinite(parsed) || parsed < 300) return fallback;
  return Math.min(parsed, 7 * 24 * 60 * 60);
}

export function isSessionRuntimeBypassed(): boolean {
  const bypassEnabled = String(process.env.NEXT_PUBLIC_E2E_AUTH_BYPASS || '').trim().toLowerCase() === 'true';
  return process.env.NODE_ENV !== 'production' && bypassEnabled;
}

export async function createSessionToken(
  secret: string,
  input: { uid: string; roles: SessionRole[]; nowMs?: number; ttlSeconds?: number },
): Promise<string> {
  const nowMs = input.nowMs ?? Date.now();
  const ttlSeconds = input.ttlSeconds ?? getSessionTtlSeconds();
  const payload: SessionPayload = {
    v: SESSION_VERSION,
    uid: input.uid,
    roles: uniqueRoles(input.roles),
    iat: Math.floor(nowMs / 1000),
    exp: Math.floor(nowMs / 1000) + ttlSeconds,
  };
  const payloadBytes = encoder.encode(JSON.stringify(payload));
  const payloadBase64 = toBase64Url(payloadBytes);

  const key = await importHmacKey(secret);
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    toArrayBuffer(encoder.encode(payloadBase64)),
  );
  const signatureBase64 = toBase64Url(new Uint8Array(signatureBuffer));
  return `${payloadBase64}.${signatureBase64}`;
}

export async function verifySessionToken(
  secret: string,
  token: string,
  nowMs = Date.now(),
): Promise<SessionPayload | null> {
  const parts = String(token || '').split('.');
  if (parts.length !== 2) return null;
  const [payloadBase64, signatureBase64] = parts;
  if (!payloadBase64 || !signatureBase64) return null;

  const key = await importHmacKey(secret);
  const signatureBytes = fromBase64Url(signatureBase64);
  if (!signatureBytes) return null;

  const verified = await crypto.subtle.verify(
    'HMAC',
    key,
    toArrayBuffer(signatureBytes),
    toArrayBuffer(encoder.encode(payloadBase64)),
  );
  if (!verified) return null;

  const payloadBytes = fromBase64Url(payloadBase64);
  if (!payloadBytes) return null;

  let payload: SessionPayload;
  try {
    payload = JSON.parse(decoder.decode(payloadBytes)) as SessionPayload;
  } catch {
    return null;
  }

  const nowSeconds = Math.floor(nowMs / 1000);
  if (payload.v !== SESSION_VERSION) return null;
  if (!payload.uid || !Array.isArray(payload.roles)) return null;
  if (!Number.isFinite(payload.exp) || payload.exp <= nowSeconds) return null;
  if (!Number.isFinite(payload.iat) || payload.iat > nowSeconds + 60) return null;

  return {
    ...payload,
    roles: uniqueRoles(payload.roles as SessionRole[]),
  };
}

export function buildSessionRoles(input: {
  admin?: boolean;
  staff?: boolean;
  support?: boolean;
}): SessionRole[] {
  const roles: SessionRole[] = [];
  if (input.admin) roles.push('admin');
  if (input.staff) roles.push('staff');
  if (input.support) roles.push('support');
  if (roles.length === 0) roles.push('user');
  return uniqueRoles(roles);
}
