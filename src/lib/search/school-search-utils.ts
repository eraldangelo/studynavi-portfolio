import type { SchoolTableEntry } from '@/lib/education-providers/school-table';

/**
 * Normalize text for reliable searching:
 * - lowercase
 * - remove bullets/asterisks formatting markers
 * - replace punctuation with spaces
 * - collapse whitespace
 */
export function normalizeText(input: string): string {
  return (input ?? '')
    .toLowerCase()
    .replace(/[*•]/g, ' ')        // remove formatting markers
    .replace(/[^\w\s]/g, ' ')     // punctuation -> spaces
    .replace(/\s+/g, ' ')         // collapse whitespace
    .trim();
}

/**
 * Build the unified searchable text for a school.
 * IMPORTANT: include category + all locations.
 */
export function buildSchoolSearchText(s: SchoolTableEntry): string {
  const parts = [
    s.university,
    s.category,
    ...(s.location ?? []),
    s.generalPrograms,
    s.popularPrograms,
  ];

  return parts.map(normalizeText).join(' ');
}

/**
 * AND-match behavior:
 * every keyword must exist somewhere in the school search text.
 */
export function matchesSchoolQuery(s: SchoolTableEntry, query: string): boolean {
  const q = normalizeText(query);
  if (!q) return true;

  // ignore 1-character tokens (too noisy)
  const keywords = q.split(' ').filter(k => k.length > 1);
  if (!keywords.length) return true;

  const haystack = buildSchoolSearchText(s);
  return keywords.every(k => haystack.includes(k));
}
