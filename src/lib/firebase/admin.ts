import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

let initialized = false;

const parseServiceAccount = () => {
  const env = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!env) return null;
  try {
    return JSON.parse(env);
  } catch (e) {
    return null;
  }
};

const getBucketName = () =>
  process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || undefined;

const googleCredPathExists = (p?: string | null) => {
  if (!p) return false;
  try {
    return fs.existsSync(path.resolve(p));
  } catch (e) {
    return false;
  }
};

export const isAdminConfigured = () => {
  // service account JSON in env OR a GOOGLE_APPLICATION_CREDENTIALS path that actually exists
  return Boolean(parseServiceAccount() || googleCredPathExists(process.env.GOOGLE_APPLICATION_CREDENTIALS));
};

const initAdmin = () => {
  // If the SDK is already initialised in this process, skip.
  if (admin.apps && admin.apps.length) {
    initialized = true;
    return;
  }
  const serviceAccount = parseServiceAccount();
  const bucketName = getBucketName();

  try {
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as any),
        storageBucket: bucketName,
      });
      initialized = true;
      return;
    }

    if (googleCredPathExists(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
      // Let firebase-admin pick up application default credentials
      admin.initializeApp({ storageBucket: bucketName });
      initialized = true;
      return;
    }

    // Not configured for admin use in this environment — do not initialize
    console.warn('[firebase-admin] Admin SDK not initialized: no service account or valid GOOGLE_APPLICATION_CREDENTIALS found.');
  } catch (err) {
    // Ignore duplicate-app error which can occur during hot-reload/dev servers.
    // Log other errors so they can be investigated.
    const errorInfo =
      err && typeof err === 'object' && 'errorInfo' in err
        ? (err as { errorInfo?: { code?: string } }).errorInfo
        : undefined;

    if (errorInfo?.code === 'app/duplicate-app') {
      initialized = true;
      return;
    }

    console.warn('[firebase-admin] Failed to initialize admin SDK:', err);
  }
};

export const getAdminApp = () => {
  if (!initialized) initAdmin();
  return admin.apps.length ? admin.app() : null;
};

export const getAdminDb = () => {
  const app = getAdminApp();
  return app ? admin.firestore(app) : null;
};

export const getAdminStorage = () => {
  const app = getAdminApp();
  return app ? admin.storage(app) : null;
};
