import { db, storage, auth } from '@/lib/firebase/client';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface ReportPayload {
  name: string;
  email: string;
  issue: string;
  file?: File | null;
}

export async function submitReport(payload: ReportPayload) {
  const { name, email, issue, file } = payload;
  let screenshotUrl: string | null = null;

  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('You must be signed in before submitting a report.');
    }

    if (file) {
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const path = `reports/${currentUser.uid}/${timestamp}_${safeName}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file, { contentType: file.type });
      screenshotUrl = await getDownloadURL(storageRef);
    }

    const docRef = await addDoc(collection(db, 'reports'), {
      name,
      email,
      issue,
      screenshotUrl,
      status: 'Submitted',
      createdByUid: currentUser.uid,
      createdByEmail: currentUser.email || null,
      createdAt: serverTimestamp(),
    });

    return { id: docRef.id, screenshotUrl };
  } catch (err: any) {
    console.error('[submitReport] failed:', err);
    const message = err?.message || String(err) || 'Unknown error';
    throw new Error(message);
  }
}
