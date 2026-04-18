
import type { Answers } from '@/lib/core/types';
import type { ExchangeRates } from '../exchange-rate-service';
import { calculateAustraliaFinancials, calculateAustraliaFinancialDocuments } from './australia';
import { calculateIrelandFinancials, calculateIrelandFinancialDocuments } from './ireland';
import { calculateNewZealandFinancials, calculateNewZealandFinancialDocuments } from './new-zealand';
import { calculateCanadaFinancials, calculateCanadaFinancialDocuments } from './canada';
import type { FinancialCalculationResult, FinancialDocumentCalculationResult } from './common';

// --- Main Dispatcher Function for Initial Payments ---
export function calculateFinancials(
  answers: Answers,
  exchangeRates: ExchangeRates,
  feesDocs?: { australia?: any; canada?: any; ireland?: any; newZealand?: any }
): FinancialCalculationResult {
  const selectedDestination = answers.studyDestination || 'Australia';
  
  switch (selectedDestination) {
    case 'New Zealand':
      return calculateNewZealandFinancials(answers, exchangeRates, feesDocs?.newZealand);
    case 'Ireland':
      return calculateIrelandFinancials(answers, exchangeRates, feesDocs?.ireland);
    case 'Canada':
      return calculateCanadaFinancials(answers, exchangeRates, feesDocs?.canada);
    case 'Australia':
    default:
      return calculateAustraliaFinancials(answers, exchangeRates, feesDocs?.australia);
  }
}

// --- Main Dispatcher Function for Financial Documents ---
export function calculateFinancialDocuments(
  answers: Answers,
  exchangeRates: ExchangeRates,
  feesDocs?: { australia?: any; canada?: any; ireland?: any; newZealand?: any }
): FinancialDocumentCalculationResult {
  const selectedDestination = answers.studyDestination || 'Australia';

  switch (selectedDestination) {
    case 'New Zealand':
      return calculateNewZealandFinancialDocuments(answers, exchangeRates, feesDocs?.newZealand);
    case 'Ireland':
      return calculateIrelandFinancialDocuments(answers, exchangeRates, feesDocs?.ireland);
    case 'Canada':
        return calculateCanadaFinancialDocuments(answers, exchangeRates, feesDocs?.canada);
    case 'Australia':
    default:
      return calculateAustraliaFinancialDocuments(answers, exchangeRates, feesDocs?.australia);
  }
}
