'use client';

import type { Answers } from '@/lib/core/types';
import type { ExchangeRates } from '@/services/exchange-rate-service';
import type {
  FinancialCalculationResult,
  FinancialDocumentCalculationResult,
} from '@/services/financials/common';

type FingerprintInput = {
  answers: Answers;
  exchangeRates: ExchangeRates | null;
  paymentDetails: FinancialCalculationResult | null;
  financialDocuments: FinancialDocumentCalculationResult | null;
};

function stableSerialize(value: unknown): string {
  if (value === null) return 'null';
  const valueType = typeof value;
  if (valueType === 'number' || valueType === 'boolean') return String(value);
  if (valueType === 'string') return JSON.stringify(value);
  if (valueType !== 'object') return `"${valueType}"`;

  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableSerialize(entry)).join(',')}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, entry]) => typeof entry !== 'undefined')
    .sort(([left], [right]) => left.localeCompare(right));
  return `{${entries
    .map(([key, entry]) => `${JSON.stringify(key)}:${stableSerialize(entry)}`)
    .join(',')}}`;
}

function hashString(input: string): string {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function createPdfFingerprint({
  answers,
  exchangeRates,
  paymentDetails,
  financialDocuments,
}: FingerprintInput): string {
  const payload = stableSerialize({
    answers,
    exchangeRates,
    paymentDetails,
    financialDocuments,
  });
  return hashString(payload);
}

