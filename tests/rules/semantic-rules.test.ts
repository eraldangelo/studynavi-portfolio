import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';

const PROJECT_ID = 'demo-studynavi';

function toPromise(task: { then: (resolve: (value: unknown) => void, reject: (reason?: unknown) => void) => unknown }): Promise<unknown> {
  return new Promise((resolve, reject) => {
    task.then(resolve, reject);
  });
}
const createdAtServerTime = () => firebase.firestore.FieldValue.serverTimestamp();

function buildStrictRules(rulesText: string): string {
  return rulesText.replace(/\|\|\s*isLegacyStaffCompat\(\);/g, ';');
}

async function seedBaseData(testEnv: RulesTestEnvironment) {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await db.collection('reports').doc('owner-report').set({
      name: 'Owner',
      email: 'owner@example.com',
      issue: 'Sample issue',
      screenshotUrl: null,
      status: 'Submitted',
      createdByUid: 'owner-uid',
      createdByEmail: null,
      createdAt: createdAtServerTime(),
    });
    await db.collection('fees').doc('australia').set({
      visaFeesAUD: { studentVisaFee: 1600 },
    });
  });
}

async function run() {
  const firestoreRules = fs.readFileSync(path.join(process.cwd(), 'firebase', 'firestore.rules'), 'utf8');
  const storageRules = fs.readFileSync(path.join(process.cwd(), 'firebase', 'storage.rules'), 'utf8');

  const testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules: firestoreRules },
    storage: { rules: storageRules },
  });

  try {
    await seedBaseData(testEnv);

    const ownerCtx = testEnv.authenticatedContext('owner-uid');
    const ownerWithEmailCtx = testEnv.authenticatedContext('owner-uid-email', {
      email: 'owner@example.com',
      email_verified: true,
    });
    const otherCtx = testEnv.authenticatedContext('other-uid', { email: 'other@example.com' });
    const staffCtx = testEnv.authenticatedContext('staff-uid', { staff: true, email: 'staff@example.com' });
    const supportCtx = testEnv.authenticatedContext('support-uid', { support: true, email: 'support@example.com' });
    const legacyCompatCtx = testEnv.authenticatedContext('legacy-uid', {
      email: 'legacy@example.com',
      email_verified: true,
      legacy_staff_email_fallback: true,
    });
    const adminCtx = testEnv.authenticatedContext('admin-uid', { admin: true, email: 'admin@example.com' });
    const anonCtx = testEnv.unauthenticatedContext();

    const ownerDb = ownerCtx.firestore();
    const ownerWithEmailDb = ownerWithEmailCtx.firestore();
    const otherDb = otherCtx.firestore();
    const staffDb = staffCtx.firestore();
    const supportDb = supportCtx.firestore();
    const legacyCompatDb = legacyCompatCtx.firestore();
    const adminDb = adminCtx.firestore();
    const anonDb = anonCtx.firestore();

    // reports create: valid owner create
    await assertSucceeds(ownerDb.collection('reports').doc('report-valid').set({
      name: 'Owner',
      email: 'owner@example.com',
      issue: 'Valid issue body',
      screenshotUrl: null,
      status: 'Submitted',
      createdByUid: 'owner-uid',
      createdByEmail: null,
      createdAt: createdAtServerTime(),
    }));

    // reports create: spoofed status/extra fields denied
    await assertFails(ownerDb.collection('reports').doc('report-status-spoof').set({
      name: 'Owner',
      email: 'owner@example.com',
      issue: 'Issue body',
      screenshotUrl: null,
      status: 'Resolved',
      createdByUid: 'owner-uid',
      createdByEmail: null,
      createdAt: createdAtServerTime(),
    }));
    await assertFails(ownerDb.collection('reports').doc('report-extra-field').set({
      name: 'Owner',
      email: 'owner@example.com',
      issue: 'Issue body',
      screenshotUrl: null,
      status: 'Submitted',
      createdByUid: 'owner-uid',
      createdByEmail: null,
      createdAt: createdAtServerTime(),
      isAdminOverride: true,
    }));
    await assertFails(ownerDb.collection('reports').doc('report-email-spoof').set({
      name: 'Owner',
      email: 'owner@example.com',
      issue: 'Issue body',
      screenshotUrl: null,
      status: 'Submitted',
      createdByUid: 'owner-uid',
      createdByEmail: 'spoofed@example.com',
      createdAt: createdAtServerTime(),
    }));
    await assertFails(ownerWithEmailDb.collection('reports').doc('report-email-mismatch').set({
      name: 'Owner',
      email: 'other@example.com',
      issue: 'Issue body',
      screenshotUrl: null,
      status: 'Submitted',
      createdByUid: 'owner-uid-email',
      createdByEmail: 'owner@example.com',
      createdAt: createdAtServerTime(),
    }));

    // reports read boundaries
    await assertSucceeds(ownerDb.collection('reports').doc('owner-report').get());
    await assertFails(otherDb.collection('reports').doc('owner-report').get());
    await assertSucceeds(staffDb.collection('reports').doc('owner-report').get());
    await assertSucceeds(supportDb.collection('reports').doc('owner-report').get());
    await assertSucceeds(legacyCompatDb.collection('reports').doc('owner-report').get());

    // reports update boundaries
    await assertFails(ownerDb.collection('reports').doc('owner-report').update({ status: 'Resolved' }));
    await assertSucceeds(staffDb.collection('reports').doc('owner-report').update({ status: 'Resolved' }));

    // fees boundaries
    await assertSucceeds(anonDb.collection('fees').doc('australia').get());
    await assertFails(otherDb.collection('fees').doc('australia').update({ test: 1 }));
    await assertSucceeds(adminDb.collection('fees').doc('australia').update({ test: 1 }));

    // storage boundaries for reports screenshots
    const ownerStorage = ownerCtx.storage();
    const otherStorage = otherCtx.storage();
    const staffStorage = staffCtx.storage();
    const anonStorage = anonCtx.storage();

    const ownerImageRef = ownerStorage.ref('reports/owner-uid/screenshot.png');
    await assertSucceeds(toPromise(ownerImageRef.putString('image-bytes', 'raw', { contentType: 'image/png' })));
    await assertFails(toPromise(otherStorage.ref('reports/owner-uid/spoof.png').putString('x', 'raw', { contentType: 'image/png' })));
    await assertFails(toPromise(ownerStorage.ref('reports/owner-uid/not-image.txt').putString('x', 'raw', { contentType: 'text/plain' })));

    await assertSucceeds(ownerStorage.ref('reports/owner-uid/screenshot.png').getDownloadURL());
    await assertSucceeds(staffStorage.ref('reports/owner-uid/screenshot.png').getDownloadURL());
    await assertSucceeds(supportCtx.storage().ref('reports/owner-uid/screenshot.png').getDownloadURL());
    await assertSucceeds(legacyCompatCtx.storage().ref('reports/owner-uid/screenshot.png').getDownloadURL());
    await assertFails(otherStorage.ref('reports/owner-uid/screenshot.png').getDownloadURL());
    await assertFails(anonStorage.ref('reports/owner-uid/screenshot.png').getDownloadURL());

    console.log('Semantic rules tests passed.');
  } finally {
    await testEnv.cleanup();
  }

  const strictEnv = await initializeTestEnvironment({
    projectId: `${PROJECT_ID}-strict`,
    firestore: { rules: buildStrictRules(firestoreRules) },
    storage: { rules: buildStrictRules(storageRules) },
  });

  try {
    await seedBaseData(strictEnv);
    const strictLegacy = strictEnv.authenticatedContext('legacy-uid', {
      email: 'legacy@example.com',
      email_verified: true,
      legacy_staff_email_fallback: true,
    });
    const strictStaff = strictEnv.authenticatedContext('staff-uid', {
      email: 'staff@example.com',
      staff: true,
    });
    await assertFails(strictLegacy.firestore().collection('reports').doc('owner-report').get());
    await assertSucceeds(strictStaff.firestore().collection('reports').doc('owner-report').get());
    await assertFails(strictLegacy.storage().ref('reports/owner-uid/screenshot.png').getDownloadURL());
  } finally {
    await strictEnv.cleanup();
  }
}

void run().catch((error) => {
  console.error('Semantic rules tests failed:', error);
  process.exit(1);
});

