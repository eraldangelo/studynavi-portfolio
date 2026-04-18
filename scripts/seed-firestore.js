#!/usr/bin/env node
/**
 * Seed Firestore `fees/australia` with visaFeesAUD and optional OSHC sample values.
 *
 * Usage:
 * 1) Place a Firebase service account JSON file on your machine.
 * 2) Run:
 *    node scripts/seed-firestore.js /path/to/serviceAccountKey.json
 *
 * OR set env var: SERVICE_ACCOUNT=/path/to/serviceAccountKey.json
 */

const path = require('path');
const fs = require('fs');

const svcPath = process.argv[2] || process.env.SERVICE_ACCOUNT || process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!svcPath) {
  console.error('Service account JSON required as argv or SERVICE_ACCOUNT env var.');
  process.exit(1);
}

if (!fs.existsSync(svcPath)) {
  console.error('Service account file not found:', svcPath);
  process.exit(1);
}

const admin = require('firebase-admin');

const serviceAccount = require(path.resolve(svcPath));

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const db = admin.firestore();

async function seed() {
  const docRef = db.doc('fees/australia');

  const seed = {
    // keep existing OSHC maps untouched (merge: true)
    visaFeesAUD: {
      studentVisaFee: 2000,
      dependentVisaFeeSpouse18Plus: 1225,
      dependentVisaFeeChildUnder18: 400,
    }
  };

  try {
    await docRef.set(seed, { merge: true });
    console.log('Seeded fees/australia with visaFeesAUD:');
    console.log(JSON.stringify(seed.visaFeesAUD, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed Firestore:', err);
    process.exit(1);
  }
}

seed();
