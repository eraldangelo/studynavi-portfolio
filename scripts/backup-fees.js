const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const DOC_IDS = ['australia', 'canada', 'ireland', 'new-zealand'];

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const index = trimmed.indexOf('=');
    const key = trimmed.slice(0, index).trim();
    if (!key || process.env[key]) continue;
    let value = trimmed.slice(index + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function parseServiceAccountFromEnv() {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) return null;
  try {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (error) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is not valid JSON.');
  }
}

function initializeAdmin() {
  if (admin.apps.length > 0) return admin.app();

  const bucketName =
    process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || undefined;
  const serviceAccount = parseServiceAccountFromEnv();

  if (serviceAccount) {
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: bucketName,
    });
  }

  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credPath && fs.existsSync(path.resolve(credPath))) {
    return admin.initializeApp({ storageBucket: bucketName });
  }

  const fallbackCandidates = ['key.json', 'key.kson', 'service-account.json'];
  for (const candidate of fallbackCandidates) {
    const fullPath = path.join(process.cwd(), candidate);
    if (fs.existsSync(fullPath)) {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = fullPath;
      return admin.initializeApp({ storageBucket: bucketName });
    }
  }

  const sdkJson = fs
    .readdirSync(process.cwd())
    .find((name) => /^firebase-adminsdk-.*\.json$/i.test(name));
  if (sdkJson) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(process.cwd(), sdkJson);
    return admin.initializeApp({ storageBucket: bucketName });
  }

  throw new Error(
    'Firebase Admin credentials not configured. Set FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS.',
  );
}

function getOutputPath() {
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-');
  const dir = path.join(process.cwd(), 'backups', 'fees');
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, `fees-backup-${stamp}.json`);
}

async function readFeesDocs(db) {
  const data = {};
  for (const docId of DOC_IDS) {
    const snap = await db.collection('fees').doc(docId).get();
    data[docId] = snap.exists ? snap.data() : null;
  }
  return data;
}

async function main() {
  try {
    loadEnvLocal();
    initializeAdmin();
    const db = admin.firestore();
    const docs = await readFeesDocs(db);

    const payload = {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || null,
      createdAt: new Date().toISOString(),
      collection: 'fees',
      docs,
    };

    const outputPath = getOutputPath();
    fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    console.log(`Fees backup written: ${outputPath}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Fees backup failed: ${message}`);
    process.exit(1);
  }
}

void main();
