import admin from 'firebase-admin';
import { NextResponse } from 'next/server';
import { getAdminApp } from '@/lib/firebase/admin';
import { classifyVerifyTokenError, parseBearerToken } from '@/lib/server/api-auth';
import { checkRateLimit } from '@/lib/server/rate-limit';
import { emitAuditLog } from '@/lib/server/audit-log';
import { createTurnstileRequestBinding, verifyTurnstileProofToken } from '@/lib/security/turnstile';
import {
  isLegacyStaffBridgeEnabledServer,
  isLegacyStaffCompatClaim,
  resolveStaffEmailDomain,
} from '@/lib/security/claims-governance';
import {
  buildSessionRoles,
  createSessionToken,
  getSessionTtlSeconds,
  isSessionRuntimeBypassed,
  resolveSessionSecret,
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from '@/lib/security/session-token';

type SessionStatus = {
  ok: boolean;
  authenticated: boolean;
  expiresAtEpochSeconds?: number;
  roles?: string[];
};

const TURNSTILE_PROOF_COOKIE_NAME = 'turnstile_verified';
const REQUIRE_TURNSTILE_PROOF_FOR_SESSION =
  String(process.env.STUDYNAVI_SESSION_REQUIRE_TURNSTILE_PROOF || 'true').trim().toLowerCase() !== 'false';
const STAFF_EMAIL_DOMAIN = resolveStaffEmailDomain();

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function isLegacyStaffCompat(decoded: admin.auth.DecodedIdToken): boolean {
  if (!isLegacyStaffBridgeEnabledServer()) return false;
  return isLegacyStaffCompatClaim({
    email: typeof decoded.email === 'string' ? decoded.email : '',
    emailVerified: decoded.email_verified === true,
    legacyClaim: decoded.legacy_staff_email_fallback,
    staffDomain: STAFF_EMAIL_DOMAIN,
  });
}

function cookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAgeSeconds,
  };
}

function getRequestHostname(request: Request): string {
  const forwardedHost = String(request.headers.get('x-forwarded-host') || '').trim();
  const rawHost = forwardedHost
    ? forwardedHost.split(',')[0].trim().toLowerCase()
    : String(request.headers.get('host') || '').trim().toLowerCase();
  return rawHost.split(':')[0].trim();
}

function readCookieValue(request: Request, cookieName: string): string {
  const rawCookie = String(request.headers.get('cookie') || '');
  const segments = rawCookie.split(';').map((item) => item.trim());
  const segment = segments.find((item) => item.startsWith(`${cookieName}=`));
  if (!segment) return '';
  const rawValue = segment.slice(`${cookieName}=`.length);
  try {
    return decodeURIComponent(rawValue);
  } catch {
    return rawValue;
  }
}

export async function POST(request: Request) {
  const sessionSecret = resolveSessionSecret();
  if (!sessionSecret) {
    return jsonError('Session service unavailable.', 503);
  }

  if (isSessionRuntimeBypassed()) {
    return NextResponse.json({ ok: true, bypassed: true });
  }

  const loginSource = String(request.headers.get('x-studynavi-login-source') || 'manual').trim().toLowerCase();
  if (REQUIRE_TURNSTILE_PROOF_FOR_SESSION && loginSource !== 'pathfinder-sso') {
    const turnstileSecret = String(process.env.TURNSTILE_SECRET_KEY || '').trim();
    const turnstileProof = readCookieValue(request, TURNSTILE_PROOF_COOKIE_NAME);
    const requestHostname = getRequestHostname(request);
    const turnstileBinding = createTurnstileRequestBinding(request);
    const turnstileVerified = turnstileSecret
      && turnstileProof
      && requestHostname
      && verifyTurnstileProofToken(turnstileSecret, turnstileProof, {
        fingerprint: turnstileBinding,
        hostname: requestHostname,
      });
    if (!turnstileVerified) {
      return NextResponse.json({ error: 'Captcha proof is required.' }, { status: 403 });
    }
  }

  const bearerToken = parseBearerToken(request);
  if (!bearerToken) {
    return jsonError('Authentication required.', 401);
  }
  if (bearerToken.split('.').length !== 3) {
    return jsonError('Invalid authentication token.', 401);
  }

  const app = getAdminApp();
  if (!app) {
    return jsonError('Authentication service unavailable.', 503);
  }

  try {
    const decoded = await admin.auth(app).verifyIdToken(bearerToken);
    const identity = `uid:${decoded.uid}`;
    const rate = await checkRateLimit({
      scope: 'api.auth.session.create',
      identity,
      limit: 40,
      windowMs: 5 * 60 * 1000,
    });
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too many session attempts. Please retry shortly.' },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } },
      );
    }

    const roles = buildSessionRoles({
      admin: decoded.admin === true,
      staff: decoded.staff === true || isLegacyStaffCompat(decoded),
      support: decoded.support === true,
    });
    const ttlSeconds = getSessionTtlSeconds();
    const sessionToken = await createSessionToken(sessionSecret, {
      uid: decoded.uid,
      roles,
      ttlSeconds,
    });

    const response = NextResponse.json({
      ok: true,
      expiresInSeconds: ttlSeconds,
      roles,
    });
    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, cookieOptions(ttlSeconds));

    void emitAuditLog({
      event: 'auth.session.create',
      outcome: 'success',
      actor: {
        uid: decoded.uid,
        email: typeof decoded.email === 'string' ? decoded.email : null,
        roles,
        isAdmin: roles.includes('admin'),
        isStaff: roles.includes('admin') || roles.includes('staff') || roles.includes('support'),
      },
      metadata: {
        provider: 'firebase-id-token',
        loginSource,
      },
    });

    return response;
  } catch (error) {
    const status = classifyVerifyTokenError(error);
    if (status === 401) {
      return jsonError('Invalid authentication token.', 401);
    }
    console.error('[runtime-alert][api.auth.session.create]', error);
    return jsonError('Authentication service unavailable.', 503);
  }
}

export async function DELETE(request: Request) {
  const response = new NextResponse(null, { status: 204 });
  response.cookies.set(SESSION_COOKIE_NAME, '', { ...cookieOptions(0), maxAge: 0 });

  const sessionSecret = resolveSessionSecret();
  if (sessionSecret) {
    const token = readCookieValue(request, SESSION_COOKIE_NAME);
    if (token) {
      const payload = await verifySessionToken(sessionSecret, token);
      if (payload) {
        void emitAuditLog({
          event: 'auth.session.delete',
          outcome: 'success',
          actor: {
            uid: payload.uid,
            roles: payload.roles,
            isAdmin: payload.roles.includes('admin'),
            isStaff: payload.roles.some((item) => item === 'admin' || item === 'staff' || item === 'support'),
          },
        });
      }
    }
  }

  return response;
}

export async function GET(request: Request) {
  const sessionSecret = resolveSessionSecret();
  if (!sessionSecret) {
    return NextResponse.json<SessionStatus>({ ok: true, authenticated: false });
  }

  const token = readCookieValue(request, SESSION_COOKIE_NAME);
  if (!token) {
    return NextResponse.json<SessionStatus>({ ok: true, authenticated: false });
  }

  const payload = await verifySessionToken(sessionSecret, token);
  if (!payload) {
    return NextResponse.json<SessionStatus>({ ok: true, authenticated: false });
  }
  return NextResponse.json<SessionStatus>({
    ok: true,
    authenticated: true,
    expiresAtEpochSeconds: payload.exp,
    roles: payload.roles,
  });
}
