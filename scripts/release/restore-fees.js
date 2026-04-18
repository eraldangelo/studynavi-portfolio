const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const DOC_IDS = ['australia', 'canada', 'ireland', 'new-zealand'];

function parseArgs() {
  const args = process.argv.slice(2);
  const getValue = (flag) => {
    const index = args.indexOf(flag);
    if (index < 0) return '';
    return String(args[index + 1] || '').trim();
  };
  return {
    file: getValue('--file'),
    apply: args.includes('--apply'),
  };
}

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const splitAt = trimmed.indexOf('=');
    const key = trimmed.slice(0, splitAt).trim();
    if (!key || process.env[key]) continue;
    let value = trimmed.slice(splitAt + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function parseServiceAccountFromEnv() {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) return null;
  try {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is not valid JSON.');
  }
}

function initializeAdmin() {
  if (admin.apps.length > 0) return;
  const bucketName =
    process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || undefined;
  const serviceAccount = parseServiceAccountFromEnv();
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: bucketName,
    });
    return;
  }
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credentialsPath && fs.existsSync(path.resolve(credentialsPath))) {
    admin.initializeApp({ storageBucket: bucketName });
    return;
  }
  throw new Error('Firebase Admin credentials not configured.');
}

function readBackup(backupPath) {
  if (!backupPath) throw new Error('Missing --file <backup-path>');
  const fullPath = path.resolve(backupPath);
  if (!fs.existsSync(fullPath)) throw new Error(`Backup file not found: ${fullPath}`);
  const raw = fs.readFileSync(fullPath, 'utf8');
  const json = JSON.parse(raw);
  if (!json || typeof json !== 'object' || typeof json.docs !== 'object') {
    throw new Error('Invalid backup format: expected top-level "docs" object.');
  }
  return { fullPath, docs: json.docs };
}

async function main() {
  const { file, apply } = parseArgs();
  loadEnvLocal();
  const backup = readBackup(file);

  console.log(`Loaded backup: ${backup.fullPath}`);
  DOC_IDS.forEach((docId) => {
    const exists = Object.prototype.hasOwnProperty.call(backup.docs, docId);
    console.log(`- ${docId}: ${exists ? 'present' : 'missing'}`);
  });

  if (!apply) {
    console.log('Dry run only. Re-run with --apply to write documents.');
    return;
  }

  initializeAdmin();
  const db = admin.firestore();

  for (const docId of DOC_IDS) {
    if (!Object.prototype.hasOwnProperty.call(backup.docs, docId)) {
      throw new Error(`Backup is missing required fees doc: ${docId}`);
    }
    await db.collection('fees').doc(docId).set(backup.docs[docId], { merge: false });
  }

  console.log('Fees restore complete.');
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Fees restore failed: ${message}`);
  process.exit(1);
});
