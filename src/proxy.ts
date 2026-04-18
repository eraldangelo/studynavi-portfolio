import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  isSessionRuntimeBypassed,
  resolveSessionSecret,
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from '@/lib/security/session-token';
import { sanitizeInternalRedirectTarget } from '@/lib/security/redirect';

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'SAMEORIGIN',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), xr-spatial-tracking=()',
};

const BASE_CSP_DIRECTIVES = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'production' ? '' : " 'unsafe-eval'"} https://challenges.cloudflare.com https://www.google.com https://www.gstatic.com https://www.recaptcha.net https://maps.googleapis.com https://maps.gstatic.com`,
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://firebasestorage.googleapis.com https://studynavi.example.com https://placehold.co https://images.unsplash.com https://picsum.photos https://upload.wikimedia.org https://maps.googleapis.com https://maps.gstatic.com https://cdnjs.cloudflare.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://firebasestorage.googleapis.com https://firebaseinstallations.googleapis.com https://firebaseappcheck.googleapis.com https://content-firebaseappcheck.googleapis.com https://www.google.com https://www.recaptcha.net https://www.gstatic.com https://maps.googleapis.com https://maps.gstatic.com https://api.exchangerate-api.com",
  "frame-src 'self' blob: https://challenges.cloudflare.com https://www.google.com https://www.recaptcha.net",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  'upgrade-insecure-requests',
];

const STRICT_REPORT_ONLY_CSP_DIRECTIVES = [
  ...BASE_CSP_DIRECTIVES.filter((directive) => !directive.startsWith('script-src') && !directive.startsWith('style-src')),
  "script-src 'self' https://challenges.cloudflare.com https://www.google.com https://www.gstatic.com https://www.recaptcha.net https://maps.googleapis.com https://maps.gstatic.com",
  "script-src-attr 'none'",
  "style-src 'self' https://fonts.googleapis.com",
];

const BASE_CSP_HEADER = BASE_CSP_DIRECTIVES.join('; ');
const STRICT_REPORT_ONLY_CSP_HEADER = STRICT_REPORT_ONLY_CSP_DIRECTIVES.join('; ');

const HSTS_HEADER_VALUE = 'max-age=31536000; includeSubDomains; preload';
const CSP_REPORT_ENDPOINT = '/api/csp-report';

function isStrictCspReportOnlyEnabled(): boolean {
  const raw = String(process.env.CSP_ENABLE_STRICT_REPORT_ONLY || '').trim().toLowerCase();
  return process.env.NODE_ENV === 'production' ? raw !== 'false' : raw === 'true';
}

function isStrictCspEnforceEnabled(): boolean {
  return String(process.env.CSP_ENABLE_STRICT_ENFORCE || '').trim().toLowerCase() === 'true';
}

function isProtectedPath(pathname: string): boolean {
  if (!pathname || pathname === '/login') return false;
  if (pathname.startsWith('/_next/')) return false;
  if (pathname.startsWith('/api/')) return false;
  return true;
}

function applySecurityHeaders(request: NextRequest, response: NextResponse): NextResponse {
  const baseCspWithReporting = `${BASE_CSP_HEADER}; report-uri ${CSP_REPORT_ENDPOINT}`;
  const strictReportOnlyCspWithReporting = `${STRICT_REPORT_ONLY_CSP_HEADER}; report-uri ${CSP_REPORT_ENDPOINT}`;
  const strictEnforce = isStrictCspEnforceEnabled();
  const strictReportOnly = isStrictCspReportOnlyEnabled();

  response.headers.set(
    'Content-Security-Policy',
    strictEnforce ? strictReportOnlyCspWithReporting : baseCspWithReporting,
  );
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => response.headers.set(key, value));
  response.headers.set('Report-To', JSON.stringify({
    group: 'csp-endpoint',
    max_age: 10886400,
    endpoints: [{ url: CSP_REPORT_ENDPOINT }],
  }));

  if (strictReportOnly && !strictEnforce) {
    response.headers.set('Content-Security-Policy-Report-Only', strictReportOnlyCspWithReporting);
  }

  if (process.env.NODE_ENV === 'production' && request.nextUrl.protocol === 'https:') {
    response.headers.set('Strict-Transport-Security', HSTS_HEADER_VALUE);
  }

  if (isProtectedPath(request.nextUrl.pathname)) {
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return response;
}

function buildCurrentRelativeUrl(request: NextRequest): string {
  const relative = `${request.nextUrl.pathname}${request.nextUrl.search || ''}`;
  return sanitizeInternalRedirectTarget(relative, '/');
}

function buildLoginRedirectResponse(request: NextRequest): NextResponse {
  const nextTarget = buildCurrentRelativeUrl(request);
  const loginUrl = new URL(`/login?next=${encodeURIComponent(nextTarget)}`, request.url);
  return applySecurityHeaders(request, NextResponse.redirect(loginUrl));
}

function normalizePostLoginTarget(rawTarget: string | null): string {
  const sanitized = sanitizeInternalRedirectTarget(rawTarget, '/');
  if (sanitized === '/login' || sanitized.startsWith('/login?')) return '/';
  return sanitized;
}

export async function proxy(request: NextRequest) {
  if (!isSessionRuntimeBypassed()) {
    const pathname = request.nextUrl.pathname;
    const sessionSecret = resolveSessionSecret();
    const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value || '';

    const sessionPayload = sessionSecret && sessionToken
      ? await verifySessionToken(sessionSecret, sessionToken)
      : null;

    if (isProtectedPath(pathname) && !sessionPayload) {
      return buildLoginRedirectResponse(request);
    }

    if (pathname === '/login' && sessionPayload) {
      const target = normalizePostLoginTarget(request.nextUrl.searchParams.get('next'));
      if (target) {
        return applySecurityHeaders(request, NextResponse.redirect(new URL(target, request.url)));
      }
    }
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
  return applySecurityHeaders(request, response);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
