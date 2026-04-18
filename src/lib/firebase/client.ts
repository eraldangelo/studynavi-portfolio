import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaEnterpriseProvider, type AppCheck } from 'firebase/app-check';

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const appCheckSiteKey = String(process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY || '').trim();
const appCheckDebugToken = String(process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN || '').trim();
const APPCHECK_DEBUG_LOCALHOST_SITE_KEY = 'debug-localhost-site-key';

let appCheckActivated = false;
let appCheckWarningLogged = false;
let firebaseAppCheck: AppCheck | null = null;

// Optional warnings (do not crash runtime) - SAFE in Next.js
if (!apiKey) console.warn('[firebase] Missing env var: NEXT_PUBLIC_FIREBASE_API_KEY');
if (!authDomain) console.warn('[firebase] Missing env var: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
if (!projectId) console.warn('[firebase] Missing env var: NEXT_PUBLIC_FIREBASE_PROJECT_ID');

const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  // Helpful client-side debug log to verify which Firebase project and bucket
  // the running app is using. Remove this after debugging.
  console.log('Firebase client config:', {
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    apiKey: firebaseConfig.apiKey ? '***present***' : '***missing***',
  });
}

// Initialize Firebase if client config is present. If not present (e.g. missing
// NEXT_PUBLIC_ env vars) we avoid calling getAuth/getFirestore which throws
// with 'invalid-api-key' during prerender/runtime and instead export
// lightweight placeholders that surface a helpful error when used.
const firebaseApp = firebaseConfig.apiKey
  ? (!getApps().length ? initializeApp(firebaseConfig) : getApp())
  : null;

const activateAppCheck = () => {
  if (typeof window === 'undefined') return;
  if (appCheckActivated) return;
  if (!firebaseApp) return;
  if (!appCheckSiteKey) return;

  if (process.env.NODE_ENV === 'production' && appCheckDebugToken && !appCheckWarningLogged) {
    appCheckWarningLogged = true;
    console.error('[firebase] NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN is blocked in production.');
  }
  if (process.env.NODE_ENV !== 'production' && appCheckDebugToken) {
    (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN =
      appCheckDebugToken.toLowerCase() === 'true' ? true : appCheckDebugToken;
  }

  const provider = appCheckSiteKey === APPCHECK_DEBUG_LOCALHOST_SITE_KEY
    ? APPCHECK_DEBUG_LOCALHOST_SITE_KEY
    : new ReCaptchaEnterpriseProvider(appCheckSiteKey);

  try {
    firebaseAppCheck = initializeAppCheck(firebaseApp, {
      provider: provider as any,
      isTokenAutoRefreshEnabled: true,
    });
    appCheckActivated = true;
  } catch (error) {
    if (!appCheckWarningLogged) {
      appCheckWarningLogged = true;
      console.warn('[firebase] Failed to initialize App Check.', error);
    }
  }
};

if (firebaseApp) {
  activateAppCheck();
}

function makeMissing(name: string) {
  return new Proxy({}, {
    get() {
      throw new Error(`Firebase client not configured: ${name} is unavailable. Ensure NEXT_PUBLIC_FIREBASE_API_KEY and related NEXT_PUBLIC_* vars are set and restart the dev server.`);
    },
    apply() {
      throw new Error(`Firebase client not configured: ${name} is unavailable. Ensure NEXT_PUBLIC_FIREBASE_API_KEY and related NEXT_PUBLIC_* vars are set and restart the dev server.`);
    },
  });
}

export const auth = firebaseApp ? getAuth(firebaseApp) : (makeMissing('auth') as any);
export const db = firebaseApp ? getFirestore(firebaseApp) : (makeMissing('db') as any);
export const storage = firebaseApp ? getStorage(firebaseApp) : (makeMissing('storage') as any);
export { firebaseApp, firebaseAppCheck };
