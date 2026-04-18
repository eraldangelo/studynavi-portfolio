import admin from 'firebase-admin';
import { NextResponse } from 'next/server';
import { getAdminApp } from '@/lib/firebase/admin';
import { isE2EAuthBypassEnabled } from '@/lib/env/runtime-flags';
import { SESSION_COOKIE_NAME, resolveSessionSecret, verifySessionToken } from '@/lib/security/session-token';
import {
  isLegacyStaffBridgeEnabledServer,
  isLegacyStaffCompatClaim,
  resolveStaffEmailDomain,
} from '@/lib/security/claims-governance';

type DecodedToken = admin.auth.DecodedIdToken;

export type ApiActor = {
  uid: string;
  email: string;
  isAdmin: boolean;
  isStaffByClaim: boolean;
  isStaffByEmailFallback: boolean;
  isStaff: boolean;
};

type AuthResult =
  | { actor: ApiActor; response: null }
  | { actor: null; response: NextResponse };

type FirebaseErrorLike = {
  code?: string;
  errorInfo?: { code?: string };
};
type DecodedClaimsInput = {
  uid: string;
  email?: unknown;
  email_verified?: unknown;
  admin?: unknown;
  staff?: unknown;
  support?: unknown;
  legacy_staff_email_fallback?: unknown;
};

const STAFF_EMAIL_DOMAIN = resolveStaffEmailDomain();

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function parseBearerToken(request: Request): string {
  const value = request.headers.get('authorization') || '';
  const [scheme, token] = value.split(/\s+/, 2);
  if (!scheme || !token) return '';
  if (scheme.toLowerCase() !== 'bearer') return '';
  return token.trim();
}

function isLikelyJwt(value: string): boolean {
  return value.split('.').length === 3;
}

function isLegacyStaffByBridge(token: DecodedClaimsInput): boolean {
  if (!isLegacyStaffBridgeEnabledServer()) return false;
  return isLegacyStaffCompatClaim({
    email: typeof token.email === 'string' ? token.email : '',
    emailVerified: token.email_verified === true,
    legacyClaim: token.legacy_staff_email_fallback,
    staffDomain: STAFF_EMAIL_DOMAIN,
  });
}

function parseCookieValue(request: Request, cookieName: string): string {
  const rawCookieHeader = String(request.headers.get('cookie') || '');
  if (!rawCookieHeader) return '';

  const segments = rawCookieHeader.split(';');
  for (const segment of segments) {
    const trimmed = segment.trim();
    if (!trimmed) continue;
    const separator = trimmed.indexOf('=');
    if (separator <= 0) continue;
    const key = trimmed.slice(0, separator).trim();
    if (key !== cookieName) continue;
    try {
      return decodeURIComponent(trimmed.slice(separator + 1).trim());
    } catch {
      return trimmed.slice(separator + 1).trim();
    }
  }
  return '';
}

export function deriveApiActorFromClaims(token: DecodedClaimsInput): ApiActor {
  const email = typeof token.email === 'string' ? token.email : '';
  const isAdmin = token.admin === true;
  const isStaffByClaim = token.staff === true || token.support === true;
  const isStaffByEmailFallback = isLegacyStaffByBridge(token as DecodedToken);
  const isStaff = isAdmin || isStaffByClaim || isStaffByEmailFallback;
  return {
    uid: token.uid,
    email,
    isAdmin,
    isStaffByClaim,
    isStaffByEmailFallback,
    isStaff,
  };
}

function actorFromToken(token: DecodedToken): ApiActor {
  return deriveApiActorFromClaims({
    uid: token.uid,
    email: token.email,
    email_verified: token.email_verified,
    admin: token.admin,
    staff: token.staff,
    support: token.support,
    legacy_staff_email_fallback: token.legacy_staff_email_fallback,
  });
}

function actorFromE2EHeaders(request: Request): ApiActor | null {
  if (!isE2EAuthBypassEnabled()) return null;
  const uid = String(request.headers.get('x-e2e-auth-uid') || '').trim();
  if (!uid) return null;

  const role = String(request.headers.get('x-e2e-auth-role') || 'user').trim().toLowerCase();
  const email =
    String(request.headers.get('x-e2e-auth-email') || '').trim()
    || (role === 'admin' || role === 'staff' || role === 'support' ? `tester@${STAFF_EMAIL_DOMAIN}` : 'tester@example.test');

  return {
    uid,
    email,
    isAdmin: role === 'admin',
    isStaffByClaim: role === 'admin' || role === 'staff' || role === 'support',
    isStaffByEmailFallback: false,
    isStaff: role === 'admin' || role === 'staff' || role === 'support',
  };
}

function actorFromSessionRoles(payload: { uid: string; roles: string[] }): ApiActor {
  const roleSet = new Set(payload.roles.map((item) => String(item || '').trim().toLowerCase()));
  const isAdmin = roleSet.has('admin');
  const isStaffByClaim = roleSet.has('staff') || roleSet.has('support');
  const isStaff = isAdmin || isStaffByClaim;
  return {
    uid: payload.uid,
    email: '',
    isAdmin,
    isStaffByClaim,
    isStaffByEmailFallback: false,
    isStaff,
  };
}

async function actorFromSessionCookie(request: Request): Promise<ApiActor | null> {
  if (isE2EAuthBypassEnabled()) return null;
  const secret = resolveSessionSecret();
  if (!secret) return null;
  const sessionToken = parseCookieValue(request, SESSION_COOKIE_NAME);
  if (!sessionToken) return null;
  const payload = await verifySessionToken(secret, sessionToken);
  if (!payload) return null;
  return actorFromSessionRoles({ uid: payload.uid, roles: payload.roles });
}

export function classifyVerifyTokenError(error: unknown): 401 | 503 {
  const candidate = error as FirebaseErrorLike | null;
  const code = String(candidate?.errorInfo?.code || candidate?.code || '').trim().toLowerCase();
  const invalidTokenCodes = new Set([
    'auth/argument-error',
    'auth/invalid-id-token',
    'auth/id-token-expired',
    'auth/id-token-revoked',
    'auth/user-disabled',
    'auth/user-not-found',
    'auth/invalid-session-cookie',
  ]);
  if (invalidTokenCodes.has(code)) return 401;
  return 503;
}

export async function authenticateApiRequest(request: Request): Promise<AuthResult> {
  const e2eActor = actorFromE2EHeaders(request);
  if (e2eActor) {
    return { actor: e2eActor, response: null };
  }

  const bearerToken = parseBearerToken(request);
  if (!bearerToken) {
    const sessionActor = await actorFromSessionCookie(request);
    if (sessionActor) {
      return { actor: sessionActor, response: null };
    }
    return { actor: null, response: jsonError('Authentication required.', 401) };
  }
  if (!isLikelyJwt(bearerToken)) {
    return { actor: null, response: jsonError('Invalid authentication token.', 401) };
  }

  const app = getAdminApp();
  if (!app) {
    return { actor: null, response: jsonError('Authentication service unavailable.', 503) };
  }

  try {
    const decoded = await admin.auth(app).verifyIdToken(bearerToken);
    return { actor: actorFromToken(decoded), response: null };
  } catch (error) {
    if (classifyVerifyTokenError(error) === 401) {
      return { actor: null, response: jsonError('Invalid authentication token.', 401) };
    }
    return { actor: null, response: jsonError('Authentication service unavailable.', 503) };
  }
}

export function requireStaff(actor: ApiActor): NextResponse | null {
  if (actor.isStaff || actor.isAdmin) return null;
  return jsonError('Forbidden.', 403);
}
