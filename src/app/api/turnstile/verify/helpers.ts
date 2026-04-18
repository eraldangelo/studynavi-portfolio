import { NextResponse } from 'next/server';
import { JsonBodyError, readJsonBody } from '@/lib/server/json-body';
import { createTurnstileProofToken } from '@/lib/security/turnstile';

export type VerifyRequest = {
  token?: string;
  action?: string;
  'cf-turnstile-response'?: string;
};

export type TurnstileResponse = {
  success?: boolean;
  action?: string;
  hostname?: string;
  challenge_ts?: string;
  'error-codes'?: string[];
};

export const TURNSTILE_COOKIE = 'turnstile_verified';
export const TURNSTILE_MAX_AGE_SECONDS = 60 * 5;
const TURNSTILE_MAX_REQUEST_BYTES = 8 * 1024;

function getHeaderHostname(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    return parsed.hostname.trim().toLowerCase();
  } catch {
    return '';
  }
}

function contentLengthExceedsLimit(req: Request, maxBytes: number): boolean {
  const rawLength = String(req.headers.get('content-length') || '').trim();
  if (!rawLength) return false;
  const parsed = Number.parseInt(rawLength, 10);
  return Number.isFinite(parsed) && parsed > maxBytes;
}

export function getRequestHostname(req: Request): string {
  const forwardedHost = String(req.headers.get('x-forwarded-host') || '').trim();
  const raw = forwardedHost
    ? forwardedHost.split(',')[0].trim().toLowerCase()
    : String(req.headers.get('host') || '').trim().toLowerCase();
  return raw.split(':')[0].trim();
}

export function getCookieValue(req: Request, name: string): string {
  const raw = String(req.headers.get('cookie') || '');
  if (!raw) return '';
  const cookiePairs = raw.split(';').map((part) => part.trim()).filter(Boolean);
  for (const pair of cookiePairs) {
    const idx = pair.indexOf('=');
    if (idx < 1) continue;
    const key = pair.slice(0, idx).trim();
    if (key !== name) continue;
    return decodeURIComponent(pair.slice(idx + 1).trim());
  }
  return '';
}

export function isCrossSiteRequest(req: Request, requestHostname: string, allowedHostnames: string[]): boolean {
  const expectedHosts = new Set(
    [requestHostname, ...allowedHostnames]
      .map((item) => String(item || '').trim().toLowerCase())
      .filter(Boolean),
  );
  if (expectedHosts.size === 0) return false;

  const originHost = getHeaderHostname(String(req.headers.get('origin') || ''));
  if (originHost && !expectedHosts.has(originHost)) return true;

  const refererHost = getHeaderHostname(String(req.headers.get('referer') || ''));
  if (refererHost && !expectedHosts.has(refererHost)) return true;

  const fetchSite = String(req.headers.get('sec-fetch-site') || '').trim().toLowerCase();
  if (fetchSite && !['same-origin', 'same-site', 'none'].includes(fetchSite)) return true;

  return false;
}

export function isFreshChallengeTimestamp(value: unknown): boolean {
  const raw = String(value || '').trim();
  if (!raw) return true;
  const parsed = Date.parse(raw);
  if (!Number.isFinite(parsed)) return false;
  const ageMs = Date.now() - parsed;
  return ageMs >= 0 && ageMs <= TURNSTILE_MAX_AGE_SECONDS * 1000;
}

export function getTurnstileErrorCodes(response: TurnstileResponse | null | undefined): string[] {
  if (!Array.isArray(response?.['error-codes'])) return [];
  return response['error-codes']
    .map((item) => String(item || '').trim().toLowerCase())
    .filter(Boolean);
}

export function isCloudflareTestSiteKey(siteKey: string): boolean {
  return /^(1x00000000000000000000AA|2x00000000000000000000AB|1x00000000000000000000BB|2x00000000000000000000BB|3x00000000000000000000FF)$/
    .test(siteKey.trim());
}

export function isCloudflareTestSecretKey(secretKey: string): boolean {
  return /^(1x0000000000000000000000000000000AA|2x0000000000000000000000000000000AA|3x0000000000000000000000000000000AA)$/
    .test(secretKey.trim());
}

export async function parseVerifyPayload(req: Request): Promise<{ token: string; action: string }> {
  if (contentLengthExceedsLimit(req, TURNSTILE_MAX_REQUEST_BYTES)) {
    throw new JsonBodyError('Request payload is too large.', 413);
  }

  const contentType = String(req.headers.get('content-type') || '').toLowerCase();
  if (contentType.includes('application/json')) {
    const body = await readJsonBody<VerifyRequest>(req, TURNSTILE_MAX_REQUEST_BYTES);
    const token =
      typeof body?.token === 'string'
        ? body.token
        : typeof body?.['cf-turnstile-response'] === 'string'
          ? body['cf-turnstile-response']
          : '';
    const action = typeof body?.action === 'string' ? body.action : '';
    return { token: token.trim(), action: action.trim().toLowerCase() };
  }

  if (contentType.includes('form')) {
    try {
      const formData = await req.formData();
      const raw = formData.get('cf-turnstile-response') ?? formData.get('token');
      const token = typeof raw === 'string' ? raw.trim() : '';
      const rawAction = formData.get('action');
      const action = typeof rawAction === 'string' ? rawAction.trim().toLowerCase() : '';
      return { token, action };
    } catch {
      throw new JsonBodyError('Invalid captcha request payload.', 400);
    }
  }

  throw new JsonBodyError('Unsupported request content type.', 415);
}

export function buildVerifiedResponse(
  secret: string,
  fingerprint: string,
  hostname: string,
  reusedProof: boolean,
): NextResponse {
  const response = NextResponse.json({ ok: true, reusedProof });
  response.cookies.set(TURNSTILE_COOKIE, createTurnstileProofToken(secret, {
    fingerprint,
    hostname,
    ttlSeconds: TURNSTILE_MAX_AGE_SECONDS,
  }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: TURNSTILE_MAX_AGE_SECONDS,
  });
  return response;
}
