import {
  FACTUAL_RISK_PATTERNS,
  RECENCY_SIGNAL_PATTERNS,
  RECENCY_TOPIC_PATTERNS,
  SEARCH_CONFIG,
} from './brave-search.config';
import { isShortSmalltalk, matchesKeyword } from './brave-search.query-utils';

export function shouldSearch(message: string): boolean {
  if (!SEARCH_CONFIG.enabled) return false;
  if (!message || !message.trim()) return false;
  if (isShortSmalltalk(message)) return false;

  const keywordMatch = SEARCH_CONFIG.triggerKeywords.some((keyword) =>
    matchesKeyword(message, keyword),
  );
  const factualRiskMatch = FACTUAL_RISK_PATTERNS.some((pattern) => pattern.test(message));
  const recencySignalMatch = RECENCY_SIGNAL_PATTERNS.some((pattern) => pattern.test(message));

  return keywordMatch || factualRiskMatch || recencySignalMatch;
}

export function shouldVerifyRecency(message: string): boolean {
  if (!SEARCH_CONFIG.enabled) return false;
  if (!message || !message.trim()) return false;
  if (isShortSmalltalk(message)) return false;

  const topicMatch = RECENCY_TOPIC_PATTERNS.some((pattern) => pattern.test(message));
  const signalMatch = RECENCY_SIGNAL_PATTERNS.some((pattern) => pattern.test(message));

  return topicMatch || signalMatch;
}
