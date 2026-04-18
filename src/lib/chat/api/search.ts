import {
  braveSearch,
  shouldSearch,
  shouldVerifyRecency,
  formatSearchResultsForPrompt,
  SEARCH_CONFIG,
  attachExcerpts,
  type BraveSearchResult,
} from '@/lib/search/brave-search';
import { DO_NOT_CITE_DOMAINS, isDoNotCite, isPreferred } from '@/lib/chat/source-policy';

const COMPETITOR_BRAND_PATTERN =
  /\b(idp|idp education|aecc|aecc global|ams global|amsglobal|aug study|augstudy|bada|bada education)\b/gi;

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const COMPETITOR_DOMAIN_PATTERN = new RegExp(
  `\\b(?:www\\.)?(?:${DO_NOT_CITE_DOMAINS.map(escapeRegex).join('|')})\\b`,
  'gi'
);

function buildVerificationQuery(message: string): string {
  const lower = message.toLowerCase();
  const tokens = new Set<string>();

  const addTokens = (list: string[]) => list.forEach((item) => tokens.add(item));

  if (/\baustralia\b|\baustralian\b|\bau\b/.test(lower)) {
    addTokens([
      'site:homeaffairs.gov.au',
      'site:immi.homeaffairs.gov.au',
      'site:studyinaustralia.gov.au',
      'site:education.gov.au',
    ]);
  }

  if (/\bcanada\b/.test(lower)) {
    addTokens(['site:canada.ca', 'site:ircc.canada.ca']);
  }

  if (/\bnew zealand\b|\bnz\b/.test(lower)) {
    addTokens(['site:immigration.govt.nz', 'site:education.govt.nz']);
  }

  if (/\bireland\b/.test(lower)) {
    addTokens(['site:gov.ie', 'site:education.ie']);
  }

  if (/\buk\b|\bunited kingdom\b|\bbritain\b|\bengland\b|\bscotland\b|\bwales\b/.test(lower)) {
    addTokens(['site:gov.uk']);
  }

  if (/\bielts\b/.test(lower)) {
    addTokens(['site:ielts.org']);
  }

  if (/\btoefl\b/.test(lower)) {
    addTokens(['site:toefl.org', 'site:ets.org']);
  }

  if (/\bpte\b/.test(lower)) {
    addTokens(['site:pteacademic.com', 'site:pearsonpte.com']);
  }

  if (/\bduolingo\b/.test(lower)) {
    addTokens(['site:englishtest.duolingo.com']);
  }

  if (tokens.size === 0) {
    addTokens([
      'site:homeaffairs.gov.au',
      'site:immi.homeaffairs.gov.au',
      'site:studyinaustralia.gov.au',
      'site:canada.ca',
      'site:ircc.canada.ca',
      'site:gov.uk',
      'site:gov.ie',
      'site:immigration.govt.nz',
      'site:gov.au',
      'site:gov.ph',
      'site:.gov',
      'site:.edu',
      'site:.ac',
      'site:edu.au',
      'site:edu.ph',
      'site:edu.ca',
      'site:ac.uk',
      'site:ac.nz',
    ]);
  }

  return `${message} ${Array.from(tokens).join(' OR ')} official 2025 2026 updated current`;
}

export type SearchContextResult = {
  context: string;
  performed: boolean;
  results: BraveSearchResult[];
};

export async function performSearchIfNeeded(
  message: string,
  requestId: string
): Promise<SearchContextResult> {
  if (!shouldSearch(message)) {
    return { context: '', performed: false, results: [] };
  }

  const searchResponse = await braveSearch(message);
  const results = searchResponse.results || [];
  let context = '';

  if (results.length > 0) {
    // Attach small page excerpts from top results to improve accuracy
    try {
      await attachExcerpts(results, 2);
    } catch (e) {
      console.warn('[Chat API] attachExcerpts failed', e);
    }

    console.log('[Chat API] Found search results', {
      requestId,
      count: results.length,
    });
    context = formatSearchResultsForPrompt({ ...searchResponse, results });
  }

  if (searchResponse.error) {
    console.warn('[Chat API] Search error:', searchResponse.error);
  }

  return { context, performed: true, results };
}

export function redactCompetitorBrands(text: string): string {
  if (!text) return text;
  const strippedUrls = text.replace(/https?:\/\/[^\s)]+/g, (match) => {
    if (isDoNotCite(match)) {
      return '';
    }
    return match;
  });
  const strippedDomains = strippedUrls.replace(COMPETITOR_DOMAIN_PATTERN, 'another agency');
  return strippedDomains.replace(COMPETITOR_BRAND_PATTERN, 'another agency');
}

export async function verifyRecency(message: string): Promise<{
  recencyConfirmed: boolean;
  recencySearchPerformed: boolean;
}> {
  let recencyConfirmed = false;
  let recencySearchPerformed = false;
  const shouldRunRecency = shouldVerifyRecency(message);
  if (SEARCH_CONFIG.enabled && shouldRunRecency) {
    try {
      recencySearchPerformed = true;
      const verificationQuery = buildVerificationQuery(message);
      const verRes = await braveSearch(verificationQuery);
      const results = verRes.results || [];
      if (results.length > 0) {
        // Confirm recency based on official domains plus explicit recency cues
        const found = results.some((r) => {
          const hay = `${r.title} ${r.description || ''} ${r.excerpt || ''} ${r.url}`.toLowerCase();
          const recencyCue = /\b2025\b|\b2026\b|\bupdated\b|\bcurrent\b|\beffective\b|\bas of\b/.test(hay);
          return isPreferred(r.url) && recencyCue;
        });
        recencyConfirmed = found;
      }
    } catch (e) {
      console.warn('[Chat API] Recency verification failed', e);
    }
  }

  return { recencyConfirmed, recencySearchPerformed };
}
