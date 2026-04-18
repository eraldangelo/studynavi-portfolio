import type { ExchangeRates } from "@/services/exchange-rate-service";

const countryCurrencyMap: { [key: string]: { code: string, symbol: string } } = {
  'Australia': { code: 'AUD', symbol: '$' },
  'Canada': { code: 'CAD', symbol: '$' },
  'New Zealand': { code: 'NZD', symbol: '$' },
  'Ireland': { code: 'EUR', symbol: '€' },
  'UK': { code: 'GBP', symbol: '£' },
  'USA': { code: 'USD', symbol: '$' },
  'Germany': { code: 'EUR', symbol: '€' },
};

export function getCurrencyInfo(destination: string | undefined, rates: ExchangeRates | null) {
  const defaultCurrency = { code: 'AUD', symbol: '$' };
  const currency = destination ? countryCurrencyMap[destination] || defaultCurrency : defaultCurrency;

  const getRate = (code: string) => rates ? (rates['PHP'] || 38.5) / (rates[code] || 1) : 0;
  
  const phpRateForSelected = rates ? (rates['PHP'] || 38.5) / (rates[currency.code] || 1) : 38.5;

  const countryRates = {
    'AUD': getRate('AUD'),
    'CAD': getRate('CAD'),
    'NZD': getRate('NZD'),
    'USD': getRate('USD'),
    'EUR': getRate('EUR'),
  };

  return {
    currencyCode: currency.code,
    currencySymbol: currency.symbol,
    phpRate: phpRateForSelected,
    countryRates,
  };
}
