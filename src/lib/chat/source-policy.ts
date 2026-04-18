/**
 * Source attribution policy for chat responses.
 * Filters out competitor agencies and prioritizes official sources.
 */

import type { BraveSearchResult } from '@/lib/search/brave-search';

export type SourceItem = {
  title: string;
  url: string;
  hostname: string;
};

export const DO_NOT_CITE_DOMAINS = [
  'idp.com',
  'idp.com.ph',
  'idp.com.au',
  'idpeducation.com',
  'aeccglobal.com',
  'aeccglobal.com.ph',
  'aeccglobal.com.au',
  'augstudy.com',
  'augstudy.com.au',
  'amsglobal.com',
  'amsglobal.co',
  'amsglobal.com.au',
  'bada.com',
  'badaeducation.com',
  'badaeducation.com.au',
];

export const PREFERRED_CITE_PATTERNS: RegExp[] = [
  /\.gov(\.|$)/,
  /\.govt(\.|$)/,
  /\.edu(\.|$)/,
  /\.ac\.[a-z]{2}$/,
  /(^|\.)homeaffairs\.gov\.au$/,
  /(^|\.)immi\.homeaffairs\.gov\.au$/,
  /(^|\.)studyinaustralia\.gov\.au$/,
  /(^|\.)education\.gov\.au$/,
  /(^|\.)canada\.ca$/,
  /(^|\.)ircc\.canada\.ca$/,
  /(^|\.)gov\.uk$/,
  /(^|\.)gov\.ie$/,
  /(^|\.)immigration\.govt\.nz$/,
  /(^|\.)education\.govt\.nz$/,
  /(^|\.)mofa\.go\.jp$/,
  /(^|\.)ielts\.org$/,
  /(^|\.)toefl\.org$/,
  /(^|\.)ets\.org$/,
  /(^|\.)pteacademic\.com$/,
  /(^|\.)pearsonpte\.com$/,
  /(^|\.)cambridgeenglish\.org$/,
  /(^|\.)englishtest\.duolingo\.com$/,
];

export const NEUTRAL_ALLOWED_PATTERNS: RegExp[] = [
  /(^|\.)wikipedia\.org$/,
];

export function normalizeHostname(url: string): string {
  const trimmed = (url || '').trim();
  if (!trimmed) return '';

  try {
    const parsed = new URL(trimmed);
    return parsed.hostname.replace(/^www\./i, '').toLowerCase().trim();
  } catch {
    const withoutProtocol = trimmed.replace(/^https?:\/\//i, '');
    const hostname = withoutProtocol.split('/')[0] || '';
    return hostname.replace(/^www\./i, '').toLowerCase().trim();
  }
}

export function isDoNotCite(url: string): boolean {
  const host = normalizeHostname(url);
  if (!host) return false;
  return DO_NOT_CITE_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`));
}

export function isPreferred(url: string): boolean {
  const host = normalizeHostname(url);
  if (!host) return false;
  return PREFERRED_CITE_PATTERNS.some((pattern) => pattern.test(host));
}

function isNeutralAllowed(url: string): boolean {
  const host = normalizeHostname(url);
  if (!host) return false;
  return NEUTRAL_ALLOWED_PATTERNS.some((pattern) => pattern.test(host));
}

function buildCandidateSources(results: BraveSearchResult[]): SourceItem[] {
  const candidates: SourceItem[] = [];
  const seen = new Set<string>();

  for (const result of results || []) {
    const url = (result.url || '').trim();
    if (!url) continue;
    if (seen.has(url)) continue;
    const hostname = normalizeHostname(url);
    if (!hostname) continue;
    seen.add(url);
    candidates.push({
      title: (result.title || '').trim(),
      url,
      hostname,
    });
  }

  return candidates;
}

export function filterSourcesForAttribution(
  results: BraveSearchResult[],
  limit = 4
): { sources: SourceItem[]; usedPreferred: boolean; onlyDoNotCite: boolean } {
  const candidates = buildCandidateSources(results || []);
  const blocked = candidates.filter((item) => isDoNotCite(item.url));
  const onlyDoNotCite = candidates.length > 0 && blocked.length === candidates.length;

  const allowed = candidates.filter((item) => !isDoNotCite(item.url));
  const preferred = allowed.filter((item) => isPreferred(item.url));
  const neutral = allowed.filter((item) => isNeutralAllowed(item.url));

  let selected: SourceItem[] = [];
  if (preferred.length > 0) {
    selected = preferred;
  } else if (neutral.length > 0) {
    selected = neutral;
  }

  const sources = selected.slice(0, Math.max(0, limit));
  const usedPreferred = sources.some((item) => isPreferred(item.url));

  return { sources, usedPreferred, onlyDoNotCite };
}
