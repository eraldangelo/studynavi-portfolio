import type { User } from 'firebase/auth';

type SessionCreateResponse = {
  ok?: boolean;
  error?: string;
};

async function establishSession(user: User, loginSource: 'manual' | 'pathfinder-sso'): Promise<boolean> {
  if (process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_E2E_AUTH_BYPASS === 'true') {
    return true;
  }

  const idToken = await user.getIdToken();
  if (!idToken) return false;

  const response = await fetch('/api/auth/session', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
      'x-studynavi-login-source': loginSource,
    },
    body: JSON.stringify({}),
    credentials: 'same-origin',
  });
  if (response.ok) return true;

  let payload: SessionCreateResponse | null = null;
  try {
    payload = (await response.json()) as SessionCreateResponse;
  } catch {
    payload = null;
  }
  const message = payload?.error || `Session create failed (${response.status})`;
  throw Object.assign(new Error(message), { code: 'auth/session-cookie-failed' });
}

export async function establishServerSessionFromUser(user: User): Promise<boolean> {
  return establishSession(user, 'manual');
}

export async function establishServerSessionFromUserWithSource(
  user: User,
  loginSource: 'manual' | 'pathfinder-sso',
): Promise<boolean> {
  return establishSession(user, loginSource);
}

export async function clearServerSession(): Promise<void> {
  try {
    await fetch('/api/auth/session', {
      method: 'DELETE',
      credentials: 'same-origin',
      keepalive: true,
    });
  } catch {
    // Best-effort cleanup; never block sign-out UX.
  }
}
