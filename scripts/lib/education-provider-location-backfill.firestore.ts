import fs from 'node:fs';
import path from 'node:path';
import admin from 'firebase-admin';

import { toNonEmptyString, toTextList, type FirestoreProvider, type UpdateRecord } from './education-provider-location-backfill.helpers';

export const ensureAdminApp = (serviceAccountPath: string | null) => {
  if (admin.apps.length > 0) return;

  if (serviceAccountPath) {
    const resolvedPath = path.resolve(serviceAccountPath);
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Service account JSON not found: ${resolvedPath}`);
    }

    const raw = fs.readFileSync(resolvedPath, 'utf8');
    const serviceAccount = JSON.parse(raw);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    return;
  }

  admin.initializeApp();
};

export const loadProviders = async (collectionName: string): Promise<FirestoreProvider[]> => {
  const db = admin.firestore();
  const snapshot = await db.collection(collectionName).get();

  return snapshot.docs.map((doc) => {
    const data = (doc.data() || {}) as Record<string, unknown>;
    return {
      id: doc.id,
      name: toNonEmptyString(data.name),
      country: toNonEmptyString(data.country),
      locations: toTextList(data.locations),
      category: toNonEmptyString(data.category),
    };
  });
};

export const applyLocationUpdates = async (collectionName: string, updates: UpdateRecord[]) => {
  if (updates.length === 0) {
    return {
      commits: 0,
      updatedDocuments: 0,
    };
  }

  const db = admin.firestore();
  const batchSize = 400;
  let pending = 0;
  let commits = 0;
  let batch = db.batch();

  for (const update of updates) {
    const ref = db.collection(collectionName).doc(update.id);
    batch.set(
      ref,
      {
        locations: update.after,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    pending += 1;

    if (pending >= batchSize) {
      await batch.commit();
      commits += 1;
      batch = db.batch();
      pending = 0;
    }
  }

  if (pending > 0) {
    await batch.commit();
    commits += 1;
  }

  return {
    commits,
    updatedDocuments: updates.length,
  };
};
