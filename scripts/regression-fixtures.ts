import {
  australiaSeed,
  canadaSeed,
  irelandSeed,
  newZealandSeed,
} from '../src/services/fees/firestore-fees.seeds';

type FeeDocs = {
  australia: unknown;
  canada: unknown;
  ireland: unknown;
  newZealand: unknown;
};

export const FIXTURE_EXCHANGE_RATES: Record<string, number> = {
  PHP: 56,
  AUD: 1.5,
  CAD: 1.3,
  NZD: 1.6,
  EUR: 1,
  USD: 1.1,
};

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value;
  Object.freeze(value);
  for (const key of Object.keys(value as Record<string, unknown>)) {
    const child = (value as Record<string, unknown>)[key];
    if (child && typeof child === 'object' && !Object.isFrozen(child)) {
      deepFreeze(child);
    }
  }
  return value;
}

export const FIXTURE_FEES_DOCS: FeeDocs = deepFreeze({
  australia: australiaSeed,
  canada: canadaSeed,
  ireland: irelandSeed,
  newZealand: newZealandSeed,
});
