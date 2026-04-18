// Using a 'use client' file for localStorage access.
'use client';
import { isE2EMockDataEnabled } from '@/lib/env/runtime-flags';

const EXCHANGE_RATE_CACHE_KEY = 'exchangeRates';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const E2E_MOCK_DATA = isE2EMockDataEnabled();

export interface ExchangeRates {
  [key: string]: number;
}

interface CachedRates {
  timestamp: number;
  rates: ExchangeRates;
}

// Default rates to be used as a fallback in case of API failure.
const DEFAULT_RATES: ExchangeRates = {
  USD: 0.66,
  EUR: 0.61,
  GBP: 0.52,
  CAD: 0.91,
  NZD: 1.08,
  PHP: 38.75,
  AUD: 1, // Base currency
};

const E2E_MOCK_RATES: ExchangeRates = {
  PHP: 56,
  AUD: 1.5,
  CAD: 1.3,
  NZD: 1.6,
  EUR: 1,
  USD: 1.1,
};

export async function fetchExchangeRates(): Promise<ExchangeRates> {
  if (E2E_MOCK_DATA) {
    return E2E_MOCK_RATES;
  }

  // Fetch new rates
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/AUD');
    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rates: ${response.statusText}`);
    }
    const data = await response.json();
    const rates: ExchangeRates = data.rates;

    return rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    // If there's an error, return default rates.
    return DEFAULT_RATES;
  }
}
