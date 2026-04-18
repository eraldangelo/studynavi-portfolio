import { NextResponse } from 'next/server';
import { safeServerFetch } from '@/lib/server/safe-fetch';
import { checkRateLimit } from '@/lib/server/rate-limit';
import { getClientFingerprint, getClientIp } from '@/lib/chat/api/request';
import { JsonBodyError } from '@/lib/server/json-body';
import {
  createTurnstileRequestBinding,
  isTurnstileActionAllowed,
  isTurnstileHostnameAllowed,
  parseAllowedHostnames,
  verifyTurnstileProofToken,
} from '@/lib/security/turnstile';
import {
  buildVerifiedResponse,
  getCookieValue,
  getRequestHostname,
  getTurnstileErrorCodes,
  isCloudflareTestSecretKey,
  isCloudflareTestSiteKey,
  isCrossSiteRequest,
  isFreshChallengeTimestamp,
  parseVerifyPayload,
  TURNSTILE_COOKIE,
  type TurnstileResponse,
} from './helpers';

const isDev = process.env.NODE_ENV !== 'production';

function getDebugPayload<T extends Record<string, unknown>>(payload: T): T | undefined {
  return isDev ? payload : undefined;
}

export async function POST(req: Request) {
  try {
    const rateLimitIdentity = getClientFingerprint(req);
    const turnstileBinding = createTurnstileRequestBinding(req);
    const rate = await checkRateLimit({
      scope: 'api.turnstile.verify',
      identity: rateLimitIdentity,
      limit: 20,
      windowMs: 5 * 60 * 1000,
    });
    if (!rate.allowed) {
      return NextResponse.json(
        { ok: false, message: 'Too many verification attempts. Please retry shortly.' },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } },
      );
    }

    const secret = String(process.env.TURNSTILE_SECRET_KEY || '').trim();
    if (!secret) {
      return NextResponse.json({ ok: false, message: 'Server misconfiguration.' }, { status: 500 });
    }

    const siteKey = String(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '').trim();
    const isTestKeyMode = process.env.NODE_ENV !== 'production'
      && isCloudflareTestSiteKey(siteKey)
      && isCloudflareTestSecretKey(secret);
    const allowedHostnames = parseAllowedHostnames(process.env.TURNSTILE_ALLOWED_HOSTNAMES);
    const requestHostname = getRequestHostname(req);
    if (isCrossSiteRequest(req, requestHostname, allowedHostnames)) {
      return NextResponse.json({ ok: false, message: 'Invalid captcha request origin.' }, { status: 403 });
    }

    const existingProof = getCookieValue(req, TURNSTILE_COOKIE);
    if (
      existingProof
      && verifyTurnstileProofToken(secret, existingProof, {
        fingerprint: turnstileBinding,
        hostname: requestHostname,
      })
    ) {
      return buildVerifiedResponse(secret, turnstileBinding, requestHostname, true);
    }

    const { token, action } = await parseVerifyPayload(req);
    if (!token) {
      return NextResponse.json({ ok: false, message: 'Captcha verification required.' }, { status: 400 });
    }

    let verification: TurnstileResponse;
    try {
      const clientIp = getClientIp(req);
      const params = new URLSearchParams({ secret, response: token });
      if (clientIp && clientIp !== 'unknown') {
        params.set('remoteip', clientIp);
      }
      const verifyResponse = await safeServerFetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params,
        },
        { timeoutMs: 4_500, retries: 1, retryDelayMs: 200 },
      );
      verification = (await verifyResponse.json()) as TurnstileResponse;
    } catch (error) {
      console.error('[turnstile] verify upstream timeout/network error', error);
      return NextResponse.json(
        { ok: false, message: 'Captcha verification service is temporarily unavailable.' },
        { status: 503 },
      );
    }

    if (!verification?.success) {
      const errorCodes = getTurnstileErrorCodes(verification);
      const primaryError = errorCodes[0] || 'unknown';
      const isSecretConfigError =
        primaryError === 'invalid-input-secret' || primaryError === 'missing-input-secret';
      const isProviderError = primaryError === 'internal-error';
      if (isDev) {
        console.warn('[turnstile] verification failed', {
          errorCodes,
          requestHostname,
          requestAction: action,
        });
      }
      return NextResponse.json(
        {
          ok: false,
          message: isSecretConfigError
            ? 'Turnstile server key is invalid or missing. Check TURNSTILE_SECRET_KEY and restart the server.'
            : isProviderError
              ? 'Captcha verification service is temporarily unavailable.'
              : 'Captcha verification failed.',
          debug: getDebugPayload({ errorCodes, requestHostname, requestAction: action }),
        },
        { status: isSecretConfigError ? 500 : isProviderError ? 503 : 403 },
      );
    }

    const hostnameAllowed = isTurnstileHostnameAllowed({
      allowedHostnames,
      responseHostname: verification.hostname,
      requestHostname,
    });
    if (!hostnameAllowed && !isTestKeyMode) {
      if (isDev) {
        console.warn('[turnstile] hostname validation failed', {
          requestHostname,
          responseHostname: verification.hostname,
          allowedHostnames,
        });
      }
      return NextResponse.json(
        {
          ok: false,
          message: 'Captcha hostname validation failed.',
          debug: getDebugPayload({
            requestHostname,
            responseHostname: verification.hostname,
            allowedHostnames,
          }),
        },
        { status: 403 },
      );
    }
    if (!hostnameAllowed && isTestKeyMode && isDev) {
      console.warn('[turnstile] hostname mismatch bypassed in local test-key mode', {
        requestHostname,
        responseHostname: verification.hostname,
      });
    }

    const fallbackExpectedAction = isCloudflareTestSiteKey(siteKey) ? '' : 'login';
    const configuredExpectedAction = String(
      process.env.TURNSTILE_EXPECTED_ACTION || fallbackExpectedAction,
    ).trim().toLowerCase();
    const responseAction = String(verification.action || '').trim().toLowerCase();
    const effectiveExpectedAction = isTestKeyMode && (!configuredExpectedAction || configuredExpectedAction === 'test')
      ? responseAction
      : configuredExpectedAction;
    if (effectiveExpectedAction && !action) {
      return NextResponse.json({ ok: false, message: 'Captcha action is required.' }, { status: 400 });
    }
    if (effectiveExpectedAction && action && action !== effectiveExpectedAction) {
      if (!isTestKeyMode) {
        return NextResponse.json(
          {
            ok: false,
            message: 'Captcha action mismatch.',
            debug: getDebugPayload({
              expectedAction: effectiveExpectedAction,
              requestAction: action,
              responseAction,
              testKeyMode: isTestKeyMode,
            }),
          },
          { status: 403 },
        );
      }
      if (isDev) {
        console.warn('[turnstile] action mismatch bypassed in local test-key mode', {
          expectedAction: effectiveExpectedAction,
          requestAction: action,
          responseAction,
        });
      }
    }

    const expectedAction = effectiveExpectedAction || action;
    const actionAllowed = isTurnstileActionAllowed({
      expectedAction,
      responseAction: verification.action,
    });
    if (!actionAllowed) {
      if (!isTestKeyMode) {
        if (isDev) {
          console.warn('[turnstile] action validation failed', {
            expectedAction,
            requestAction: action,
            responseAction: verification.action,
          });
        }
        return NextResponse.json(
          {
            ok: false,
            message: 'Captcha action validation failed.',
            debug: getDebugPayload({
              expectedAction,
              requestAction: action,
              responseAction: verification.action,
            }),
          },
          { status: 403 },
        );
      }
      if (isDev) {
        console.warn('[turnstile] action validation bypassed in local test-key mode', {
          expectedAction,
          requestAction: action,
          responseAction: verification.action,
        });
      }
    }

    if (!isFreshChallengeTimestamp(verification.challenge_ts)) {
      return NextResponse.json({ ok: false, message: 'Captcha challenge expired.' }, { status: 403 });
    }
    return buildVerifiedResponse(secret, turnstileBinding, requestHostname, false);
  } catch (error) {
    if (error instanceof JsonBodyError) {
      return NextResponse.json({ ok: false, message: error.message }, { status: error.status });
    }
    console.error('[runtime-alert][api.turnstile.verify]', error);
    return NextResponse.json({ ok: false, message: 'Captcha verification failed.' }, { status: 500 });
  }
}
