'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { signInWithCustomToken } from 'firebase/auth';
import { useAuth } from '@/contexts/auth-context';
import { auth } from '@/lib/firebase/client';
import { sanitizeInternalRedirectTarget } from '@/lib/security/redirect';
import { establishServerSessionFromUserWithSource } from '@/lib/firebase/server-session';
import { extractSsoTokenFromLocation } from '@/lib/security/sso-contract';
import { LoginFormCard } from './LoginFormCard';
type TurnstileWidgetId = string | number;
type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      action?: string;
      theme?: 'auto' | 'light' | 'dark';
      callback?: (token: string) => void;
      'expired-callback'?: () => void;
      'error-callback'?: (errorCode?: string) => void;
    },
  ) => TurnstileWidgetId;
  reset?: (widgetId?: TurnstileWidgetId) => void;
  remove?: (widgetId: TurnstileWidgetId) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}
const normalizeAuthErrorCode = (rawError: unknown): string => {
  const candidate = rawError as { code?: unknown; message?: unknown } | null;
  const fromCode = String(candidate?.code || '').trim().toLowerCase().replace(/[.)\]]+$/, '');
  if (fromCode) return fromCode;
  const message = String(candidate?.message || '');
  const bracketMatch = message.match(/\((auth\/[a-z0-9-]+)\.?\)/i);
  if (bracketMatch?.[1]) return bracketMatch[1].trim().toLowerCase();
  const inlineMatch = message.match(/\b(auth\/[a-z0-9-]+)\b/i);
  if (inlineMatch?.[1]) return inlineMatch[1].trim().toLowerCase();
  return '';
};
export default function LoginClient() {
  const { user, loading, signIn, signOut } = useAuth();
  const router = useRouter();
  const sp = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [signingIn, setSigningIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileScriptReady, setTurnstileScriptReady] = useState(false);
  const [turnstileClientError, setTurnstileClientError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileVerified, setTurnstileVerified] = useState(false);
  const [isSsoSigningIn, setIsSsoSigningIn] = useState(false);
  const hasAttemptedSsoRef = useRef(false);
  const hasHandledAuthenticatedRedirectRef = useRef(false);
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetIdRef = useRef<TurnstileWidgetId | null>(null);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const hasTurnstileKey = Boolean(turnstileSiteKey && turnstileSiteKey !== 'your_site_key');
  const isTurnstileTestKey = /^([123])x0{20}[A-Z]{2}$/i.test(String(turnstileSiteKey || '').trim());
  const turnstileAction = String(process.env.NEXT_PUBLIC_TURNSTILE_EXPECTED_ACTION || (isTurnstileTestKey ? 'test' : 'login')).trim().toLowerCase();
  const resetTurnstileState = () => {
    setTurnstileVerified(false);
    setTurnstileToken('');
  };
  useEffect(() => {
    if (
      !turnstileScriptReady
      || !hasTurnstileKey
      || !turnstileSiteKey
      || !turnstileContainerRef.current
      || typeof window === 'undefined'
      || !window.turnstile
      || turnstileWidgetIdRef.current !== null
    ) {
      return;
    }
    turnstileWidgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
      sitekey: turnstileSiteKey,
      action: turnstileAction,
      theme: 'light',
      callback: (token: string) => {
        if (token && token.trim().length > 0) {
          setTurnstileToken(token.trim());
          setTurnstileVerified(true);
          setTurnstileClientError(null);
        }
      },
      'expired-callback': () => {
        resetTurnstileState();
        setTurnstileClientError('Captcha expired. Please retry.');
      },
      'error-callback': (errorCode?: string) => {
        resetTurnstileState();
        if (errorCode?.startsWith('110200')) {
          setTurnstileClientError(
            'Turnstile domain is not authorized for this site key. Add this domain to allowed hostnames in Cloudflare.',
          );
          return;
        }
        setTurnstileClientError(`Turnstile failed to load (${errorCode ?? 'unknown error'}).`);
      },
    });
  }, [turnstileScriptReady, hasTurnstileKey, turnstileSiteKey, turnstileAction]);
  useEffect(() => {
    if (loading || !user || hasHandledAuthenticatedRedirectRef.current) return;
    hasHandledAuthenticatedRedirectRef.current = true;
    void (async () => {
      try {
        const source = String(sp.get('source') || '').trim().toLowerCase();
        const loginSource = source === 'pathfinder' ? 'pathfinder-sso' : 'manual';
        await establishServerSessionFromUserWithSource(user, loginSource);
        const next = sanitizeInternalRedirectTarget(sp.get('next'), '/');
        router.replace(next);
      } catch (error) {
        console.error('[login] failed to establish server session before redirect', error);
        setError('Unable to establish secure session. Please refresh and sign in again.');
        hasHandledAuthenticatedRedirectRef.current = false;
        await signOut().catch(() => {});
      }
    })();
  }, [user, loading, router, signOut, sp]);
  useEffect(() => {
    if (typeof window === 'undefined' || loading || user || isSsoSigningIn || hasAttemptedSsoRef.current) {
      return;
    }
    const extraction = extractSsoTokenFromLocation(window.location.href);
    const ssoToken = extraction.ssoToken;
    if (!ssoToken) return;
    hasAttemptedSsoRef.current = true;
    window.history.replaceState({}, '', extraction.cleanRelativeUrl);
    setIsSsoSigningIn(true);
    setError('');
    signInWithCustomToken(auth, ssoToken)
      .catch((err) => {
        console.error('[login] SSO sign in failed:', err);
        setError('Automatic StudyNavi sign-in failed. Please sign in manually.');
      })
      .finally(() => {
        setIsSsoSigningIn(false);
      });
  }, [isSsoSigningIn, loading, sp, user]);
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!hasTurnstileKey) {
      setError('Turnstile site key is missing or invalid.');
      return;
    }
    if (!turnstileVerified || !turnstileToken) {
      setError('Please complete the captcha before signing in.');
      return;
    }
    setSigningIn(true);
    try {
      const verifyRes = await fetch('/api/turnstile/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: turnstileToken, action: turnstileAction }),
        credentials: 'include',
      });
      const verifyData = await verifyRes.json().catch(() => ({}));
      if (!verifyRes.ok || !verifyData?.ok) {
        const debugErrorCodes = Array.isArray(verifyData?.debug?.errorCodes)
          ? verifyData.debug.errorCodes.map((item: unknown) => String(item || '').trim()).filter(Boolean)
          : [];
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[login] turnstile verify failed', {
            status: verifyRes.status,
            message: verifyData?.message,
            debug: verifyData?.debug,
          });
        }
        const baseMessage = verifyData?.message || 'Captcha verification failed. Please retry.';
        if (process.env.NODE_ENV !== 'production' && debugErrorCodes.length > 0) {
          setError(`${baseMessage} [${debugErrorCodes.join(', ')}]`);
        } else {
          setError(baseMessage);
        }
        resetTurnstileState();
        if (window.turnstile && turnstileWidgetIdRef.current !== null) {
          window.turnstile.reset?.(turnstileWidgetIdRef.current);
        }
        return;
      }
      await signIn(email, password);
    } catch (err: unknown) {
      const errorCode = normalizeAuthErrorCode(err);
      if (
        errorCode
        && errorCode !== 'auth/invalid-credential'
        && errorCode !== 'auth/user-not-found'
        && errorCode !== 'auth/wrong-password'
      ) {
        console.error('[login] sign in failed:', errorCode, err);
      }
      if (errorCode === 'auth/firebase-app-check-token-is-invalid' || errorCode === 'auth/app-check-token-invalid') {
        setError('Security verification expired. Please refresh the page and try again.');
      } else if (errorCode === 'auth/session-cookie-failed') {
        setError('Unable to establish secure session. Please try again.');
      } else if (errorCode === 'auth/too-many-requests') {
        setError('Too many sign-in attempts. Please wait and retry.');
      } else if (errorCode === 'auth/api-key-not-valid' || errorCode === 'auth/invalid-api-key') {
        setError('Login configuration is invalid. Please contact support.');
      } else {
        setError('Invalid email or password. Please try again.');
      }
      resetTurnstileState();
      if (window.turnstile && turnstileWidgetIdRef.current !== null) {
        window.turnstile.reset?.(turnstileWidgetIdRef.current);
      }
    } finally {
      setSigningIn(false);
    }
  };
  const canSubmit = hasTurnstileKey && turnstileVerified && !turnstileClientError;
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        async
        defer
        onLoad={() => setTurnstileScriptReady(true)}
        onReady={() => setTurnstileScriptReady(true)}
      />
      <LoginFormCard
        email={email}
        password={password}
        showPassword={showPassword}
        signingIn={signingIn}
        error={error}
        isSsoSigningIn={isSsoSigningIn}
        hasTurnstileKey={hasTurnstileKey}
        turnstileClientError={turnstileClientError}
        canSubmit={canSubmit}
        turnstileContainerRef={turnstileContainerRef}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onTogglePassword={() => setShowPassword((value) => !value)}
        onSubmit={handleSignIn}
      />
    </div>
  );
}
