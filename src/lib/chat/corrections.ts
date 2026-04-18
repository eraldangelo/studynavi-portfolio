/**
 * Corrections memory for StudyNavi Chatbot
 * Stores learned corrections in Firestore so the bot does not repeat mistakes.
 *
 * Each correction has:
 *  - topic: short tag for deduplication (e.g. "abm-cookery-intakes")
 *  - wrongAnswer: what the assistant said incorrectly
 *  - correctedAnswer: what the user said is correct
 *  - createdAt: ISO timestamp
 */

import { getAdminDb } from '@/lib/firebase/admin';
import fs from 'fs';
import os from 'os';
import path from 'path';

export interface Correction {
  topic: string;
  wrongAnswer: string;
  correctedAnswer: string;
  createdAt: string;
}

const COLLECTION = 'chat-corrections';
const MAX_CORRECTIONS_IN_PROMPT = 50;
const LOCAL_CORRECTIONS_PATH = path.join(os.tmpdir(), 'studynavi_corrections.json');
const ALLOW_LOCAL_CORRECTIONS_FALLBACK = process.env.NODE_ENV !== 'production';

/** In-memory cache so we don't hit Firestore on every request */
let cachedCorrections: Correction[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Load all corrections from Firestore (with in-memory caching)
 */
export async function loadCorrections(): Promise<Correction[]> {
  // Return cache if fresh
  if (cachedCorrections && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    return cachedCorrections;
  }

  const db = getAdminDb();
  // If Firestore admin isn't configured, optionally fall back to a local file store in non-production.
  if (!db) {
    if (!ALLOW_LOCAL_CORRECTIONS_FALLBACK) {
      console.warn('[Corrections] Firestore admin not available in production; returning empty corrections.');
      return cachedCorrections ?? [];
    }
    console.warn('[Corrections] Firestore admin not available, falling back to local file store');
    try {
      const filePath = LOCAL_CORRECTIONS_PATH;
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(raw || '[]') as Correction[];
        cachedCorrections = parsed.slice(0, MAX_CORRECTIONS_IN_PROMPT);
        cacheTimestamp = Date.now();
        console.log(`[Corrections] Loaded ${cachedCorrections.length} corrections from local file`);
        return cachedCorrections;
      }
    } catch (err) {
      console.warn('[Corrections] Failed to load local corrections file:', err);
    }
    return cachedCorrections ?? [];
  }

  try {
    const snapshot = await db
      .collection(COLLECTION)
      .orderBy('createdAt', 'desc')
      .limit(MAX_CORRECTIONS_IN_PROMPT)
      .get();

    const corrections: Correction[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        topic: data.topic ?? '',
        wrongAnswer: data.wrongAnswer ?? '',
        correctedAnswer: data.correctedAnswer ?? '',
        createdAt: data.createdAt ?? '',
      };
    });

    cachedCorrections = corrections;
    cacheTimestamp = Date.now();
    console.log(`[Corrections] Loaded ${corrections.length} corrections from Firestore`);
    return corrections;
  } catch (err) {
    const code = (err as { code?: number })?.code;
    const message = (err as { message?: string })?.message || '';
    const isNotFound = code === 5 || message.includes('NOT_FOUND');
    if (isNotFound) {
      cachedCorrections = [];
      cacheTimestamp = Date.now();
      console.warn('[Corrections] No corrections collection found; continuing without corrections');
      return [];
    }
    console.warn('[Corrections] Failed to load from Firestore:', err);
    return cachedCorrections ?? [];
  }
}

/**
 * Save a new correction to Firestore (and update cache)
 */
export async function saveCorrection(correction: Omit<Correction, 'createdAt'>): Promise<boolean> {
  const db = getAdminDb();
  const entry: Correction = {
    ...correction,
    createdAt: new Date().toISOString(),
  };

  // If Firestore admin isn't configured, save to local file only in non-production.
  if (!db) {
    if (!ALLOW_LOCAL_CORRECTIONS_FALLBACK) {
      console.warn('[Corrections] Firestore admin not available in production; skip local fallback write.');
      return false;
    }
    try {
      const filePath = LOCAL_CORRECTIONS_PATH;
      let existing: Correction[] = [];
      if (fs.existsSync(filePath)) {
        existing = JSON.parse(fs.readFileSync(filePath, 'utf8') || '[]');
      }

      const idx = existing.findIndex(e => e.topic === correction.topic);
      if (idx !== -1) {
        existing[idx] = entry;
      } else {
        existing.unshift(entry);
      }

      // Keep file reasonably sized
      existing = existing.slice(0, MAX_CORRECTIONS_IN_PROMPT);
      fs.writeFileSync(filePath, JSON.stringify(existing, null, 2), 'utf8');
      cachedCorrections = existing;
      cacheTimestamp = Date.now();
      console.log(`[Corrections] Saved correction to local file: "${correction.topic}"`);
      return true;
    } catch (err) {
      console.warn('[Corrections] Failed to save local correction:', err);
      return false;
    }
  }

  try {
    // Check for duplicate topic to avoid storing the same correction twice
    const existing = await db
      .collection(COLLECTION)
      .where('topic', '==', correction.topic)
      .limit(1)
      .get();

    if (!existing.empty) {
      // Update the existing correction with the newer info
      const docRef = existing.docs[0].ref;
      await docRef.update({
        wrongAnswer: entry.wrongAnswer,
        correctedAnswer: entry.correctedAnswer,
        createdAt: entry.createdAt,
      });
      console.log(`[Corrections] Updated existing correction: "${correction.topic}"`);
    } else {
      await db.collection(COLLECTION).add(entry);
      console.log(`[Corrections] Saved new correction: "${correction.topic}"`);
    }

    // Invalidate cache
    cachedCorrections = null;
    cacheTimestamp = 0;
    return true;
  } catch (err) {
    console.warn('[Corrections] Failed to save correction:', err);
    return false;
  }
}

/**
 * Format corrections into a system prompt section
 */
export function formatCorrectionsForPrompt(corrections: Correction[]): string {
  if (corrections.length === 0) return '';

  const lines = corrections.map((c) => {
    return `• Topic: "${c.topic}" — WRONG: "${c.wrongAnswer}" → CORRECT: "${c.correctedAnswer}"`;
  });

  return `\n\n=== LEARNED CORRECTIONS (MUST FOLLOW) ===
You have been corrected on the following topics before. You MUST use the CORRECT information and NEVER repeat the wrong answer:

${lines.join('\n')}

Always apply these corrections when the topic comes up. Do not repeat previous mistakes.
===`;
}
