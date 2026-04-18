import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { getToken } from 'firebase/app-check';
import { auth, firebaseApp, firebaseAppCheck } from './client';
const APPCHECK_TOKEN_CACHE_DB_NAME = 'firebase-app-check-database';

const isAppCheckTokenInvalidAuthError = (error: unknown): boolean => {
  const candidate = error as { code?: unknown } | null;
  const code = String(candidate?.code || '').trim().toLowerCase();
  return code === 'auth/firebase-app-check-token-is-invalid' || code === 'auth/app-check-token-invalid';
};

const refreshAppCheckToken = async (): Promise<boolean> => {
  if (!firebaseApp || !firebaseAppCheck) return false;
  try {
    await getToken(firebaseAppCheck, true);
    return true;
  } catch {
    return false;
  }
};
const clearAppCheckTokenCache = async () => {
  if (typeof indexedDB === 'undefined') return;
  await new Promise<void>((resolve) => {
    try {
      const request = indexedDB.deleteDatabase(APPCHECK_TOKEN_CACHE_DB_NAME);
      const done = () => resolve();
      request.onsuccess = done;
      request.onerror = done;
      request.onblocked = done;
    } catch {
      resolve();
    }
  });
};

export async function signIn(email: string, password: string) {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    if (!isAppCheckTokenInvalidAuthError(error)) {
      throw error;
    }
    await clearAppCheckTokenCache();
    const refreshed = await refreshAppCheckToken();
    if (!refreshed) {
      throw error;
    }
    return signInWithEmailAndPassword(auth, email, password);
  }
}

export function signOut() {
  return firebaseSignOut(auth);
}
