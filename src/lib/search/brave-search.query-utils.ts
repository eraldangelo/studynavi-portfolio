import { SMALLTALK_PATTERN } from './brave-search.config';

export function normalizeQuery(query: string): string {
  return query.toLowerCase().replace(/\s+/g, ' ').trim();
}

export function matchesKeyword(message: string, keyword: string): boolean {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`\\b${escaped}\\b`, 'i');
  return pattern.test(message);
}

export function isShortSmalltalk(message: string): boolean {
  const trimmed = message.trim();
  if (trimmed.length >= 20) return false;
  return SMALLTALK_PATTERN.test(trimmed);
}
