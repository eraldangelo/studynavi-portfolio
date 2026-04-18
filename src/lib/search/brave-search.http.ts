import { SEARCH_CACHE_TTL_MS, SEARCH_CONFIG } from './brave-search.config';
import { normalizeQuery } from './brave-search.query-utils';
import type { BraveSearchResponse, BraveSearchResult, CachedSearchEntry } from './brave-search.types';
import {
  MAX_EXCERPT_BYTES,
  fetchPublicExcerptResponse,
  getContentLength,
  isAllowedExcerptContentType,
  parsePublicHttpUrl,
  readTextWithLimit,
} from './brave-search.excerpt-guard';

const searchCache = new Map<string, CachedSearchEntry>();

function getCachedResults(query: string): BraveSearchResult[] | null {
  const key = normalizeQuery(query);
  const cached = searchCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.ts > SEARCH_CACHE_TTL_MS) {
    searchCache.delete(key);
    return null;
  }
  return cached.results;
}
function setCachedResults(query: string, results: BraveSearchResult[]) {
  const key = normalizeQuery(query);
  searchCache.set(key, { ts: Date.now(), results });
}
export async function braveSearch(query: string): Promise<BraveSearchResponse> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) {
    return {
      results: [],
      query,
      error: 'BRAVE_SEARCH_API_KEY is not configured',
    };
  }
  if (!SEARCH_CONFIG.enabled) {
    return {
      results: [],
      query,
      error: 'Brave Search is disabled',
    };
  }
  const cached = getCachedResults(query);
  if (cached) return { results: cached, query };
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const params = new URLSearchParams({
      q: query,
      count: String(SEARCH_CONFIG.count),
      safesearch: SEARCH_CONFIG.safesearch,
      country: SEARCH_CONFIG.country,
      search_lang: 'en',
      text_decorations: 'false',
    });
    const apiResponse = await fetch(
      `https://api.search.brave.com/res/v1/web/search?${params.toString()}`,
      {
        method: 'GET',
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'X-Subscription-Token': apiKey,
        },
      },
    );
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('[Brave Search] API error:', apiResponse.status, errorText);
      return {
        results: [],
        query,
        error: `Brave Search API error: ${apiResponse.status}`,
      };
    }
    const data = await apiResponse.json();
    const webResults = data?.web?.results || [];
    const results: BraveSearchResult[] = webResults
      .filter((result: { url?: string }) => {
        const url = result.url || '';
        const parsed = parsePublicHttpUrl(url);
        if (!parsed) return false;
        return !SEARCH_CONFIG.excludeDomains.some((domain) => parsed.hostname.includes(domain));
      })
      .map((result: { title?: string; url?: string; description?: string; age?: string }) => ({
        title: result.title || '',
        url: result.url || '',
        description: result.description || '',
        age: result.age,
      }))
      .slice(0, SEARCH_CONFIG.count);
    results.sort((a, b) => {
      const aIsPriority = SEARCH_CONFIG.priorityDomains.some((domain) => a.url.includes(domain));
      const bIsPriority = SEARCH_CONFIG.priorityDomains.some((domain) => b.url.includes(domain));
      if (aIsPriority && !bIsPriority) return -1;
      if (!aIsPriority && bIsPriority) return 1;
      return 0;
    });
    setCachedResults(query, results);
    return { results, query };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.warn('[Brave Search] Search failed:', reason);
    return {
      results: [],
      query,
      error: `Search failed: ${reason}`,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
export async function fetchPageExcerpt(url: string, maxChars = 1200): Promise<string> {
  const parsed = parsePublicHttpUrl(url);
  if (!parsed) return '';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);
  try {
    const res = await fetchPublicExcerptResponse(parsed, controller.signal);
    if (!res) {
      console.warn('[Brave Search] blocked excerpt fetch target', parsed.hostname);
      return '';
    }
    if (!res.ok) return '';

    const contentType = String(res.headers.get('content-type') || '').toLowerCase();
    if (!isAllowedExcerptContentType(contentType)) return '';

    const contentLength = getContentLength(res.headers.get('content-length'));
    if (contentLength !== null && contentLength > MAX_EXCERPT_BYTES) return '';

    const html = await readTextWithLimit(res, MAX_EXCERPT_BYTES);
    if (!html) return '';

    const withoutScripts = html.replace(/<script[\s\S]*?<\/script>/gi, ' ');
    const withoutStyles = withoutScripts.replace(/<style[\s\S]*?<\/style>/gi, ' ');
    const text = withoutStyles.replace(/<[^>]+>/g, ' ');
    const normalized = text.replace(/\s+/g, ' ').trim();
    return normalized.slice(0, maxChars);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.warn('[Brave Search] fetchPageExcerpt failed for', parsed.toString(), reason);
    return '';
  } finally {
    clearTimeout(timeoutId);
  }
}
export async function attachExcerpts(results: BraveSearchResult[], topN = 2) {
  const tasks = results.slice(0, topN).map(async (result, idx) => {
    try {
      const excerpt = await fetchPageExcerpt(result.url);
      if (excerpt) results[idx].excerpt = excerpt;
    } catch {
      // ignore best-effort enrichment failures
    }
  });
  await Promise.all(tasks);
}
