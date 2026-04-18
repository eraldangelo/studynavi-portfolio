import crypto from 'crypto';

const SAFE_HOSTNAME = /^[a-z0-9.-]+$/i;

function normalizeHostname(value: string): string {
  return value.trim().toLowerCase().replace(/^\.+|\.+$/g, '');
}

export function parseAllowedHostnames(raw: string | undefined): string[] {
  return String(raw || '')
    .split(',')
    .map((value) => normalizeHostname(value))
    .filter((value) => value && SAFE_HOSTNAME.test(value));
}

export function isTurnstileHostnameAllowed(params: {
  allowedHostnames: string[];
  responseHostname: unknown;
  requestHostname: string;
}): boolean {
  const expected = new Set(
    [params.requestHostname, ...params.allowedHostnames]
      .map((item) => normalizeHostname(item))
      .filter(Boolean),
  );
  if (expected.size === 0) return true;

  const responseHostname = normalizeHostname(String(params.responseHostname || ''));
  if (!responseHostname) return false;
  if (expected.has(responseHostname)) return true;
  return false;
}

export function isTurnstileActionAllowed(params: {
  expectedAction: string;
  responseAction: unknown;
}): boolean {
  const expected = String(params.expectedAction || '').trim().toLowerCase();
  if (!expected) return true;
  const responseAction = String(params.responseAction || '').trim().toLowerCase();
  if (!responseAction) return false;
  return expected === responseAction;
}

type TurnstileProofPayload = {
  exp: number;
  nonce: string;
  host: string;
  bind: string;
};

type TurnstileProofContext = {
  fingerprint: string;
  hostname: string;
  ttlSeconds: number;
  nowMs?: number;
};

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function normalizeHeader(value: string, maxLength = 240): string {
  return String(value || '').trim().toLowerCase().slice(0, maxLength);
}

export function createTurnstileRequestBinding(request: Request): string {
  // Keep this binding stable across managed proxy hops (Cloud Run / App Hosting)
  // by relying on browser-sourced headers instead of edge-assigned IPs.
  const userAgent = normalizeHeader(request.headers.get('user-agent') || '');
  const acceptLanguage = normalizeHeader(
    String(request.headers.get('accept-language') || '').split(',')[0] || '',
    64,
  );
  const platform = normalizeHeader(
    String(request.headers.get('sec-ch-ua-platform') || '').replace(/["']/g, ''),
    64,
  );
  return sha256(`${userAgent}|${acceptLanguage}|${platform}`);
}

function createSignature(secret: string, payloadBase64: string): string {
  return crypto.createHmac('sha256', secret).update(payloadBase64).digest('base64url');
}

export function createTurnstileProofToken(secret: string, context: TurnstileProofContext): string {
  const nowMs = context.nowMs ?? Date.now();
  const payload: TurnstileProofPayload = {
    exp: Math.floor(nowMs / 1000) + Math.max(1, context.ttlSeconds),
    nonce: crypto.randomUUID(),
    host: normalizeHostname(context.hostname),
    bind: sha256(`${context.fingerprint}|${normalizeHostname(context.hostname)}`),
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = createSignature(secret, payloadBase64);
  return `${payloadBase64}.${signature}`;
}

export function verifyTurnstileProofToken(
  secret: string,
  token: string,
  context: Omit<TurnstileProofContext, 'ttlSeconds'>,
): boolean {
  const parts = String(token || '').split('.');
  if (parts.length !== 2) return false;
  const [payloadBase64, signature] = parts;
  if (!payloadBase64 || !signature) return false;

  const expectedSignature = createSignature(secret, payloadBase64);
  if (signature.length !== expectedSignature.length) return false;
  const validSignature = crypto.timingSafeEqual(
    Buffer.from(signature, 'utf8'),
    Buffer.from(expectedSignature, 'utf8'),
  );
  if (!validSignature) return false;

  let payload: TurnstileProofPayload;
  try {
    payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8')) as TurnstileProofPayload;
  } catch {
    return false;
  }

  const nowMs = context.nowMs ?? Date.now();
  if (!Number.isFinite(payload.exp) || payload.exp <= Math.floor(nowMs / 1000)) return false;

  const normalizedHost = normalizeHostname(context.hostname);
  if (!payload.host || normalizeHostname(payload.host) !== normalizedHost) return false;

  const expectedBinding = sha256(`${context.fingerprint}|${normalizedHost}`);
  return payload.bind === expectedBinding;
}
