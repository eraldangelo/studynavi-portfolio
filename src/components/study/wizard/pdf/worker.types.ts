import type { Answers } from '@/lib/core/types';
import type { ExchangeRates } from '@/services/exchange-rate-service';
import type {
  FinancialCalculationResult,
  FinancialDocumentCalculationResult,
} from '@/services/financials/common';
import type { PdfBuildMetrics } from '@/lib/pdf/generator';

export type MainPdfWorkerPayload = {
  answers: Answers;
  exchangeRates: ExchangeRates | null;
  paymentDetails: FinancialCalculationResult | null;
  financialDocuments: FinancialDocumentCalculationResult | null;
  fingerprint: string;
};

export type NonGenuinePdfWorkerPayload = {
  answers: Answers;
  exchangeRates: ExchangeRates | null;
  fingerprint: string;
};

export type GenerateMainPdfWorkerRequest = {
  type: 'generate-main-pdf';
  requestId: number;
  payload: MainPdfWorkerPayload;
};

export type GenerateNonGenuinePdfWorkerRequest = {
  type: 'generate-non-genuine-pdf';
  requestId: number;
  payload: NonGenuinePdfWorkerPayload;
};

export type GenerateMainPdfWorkerSuccess = {
  type: 'generate-main-pdf:success';
  requestId: number;
  fingerprint: string;
  pdfArrayBuffer: ArrayBuffer;
  metrics: PdfBuildMetrics;
};

export type GenerateMainPdfWorkerError = {
  type: 'generate-main-pdf:error';
  requestId: number;
  fingerprint: string;
  error: string;
};

export type GenerateNonGenuinePdfWorkerSuccess = {
  type: 'generate-non-genuine-pdf:success';
  requestId: number;
  fingerprint: string;
  pdfArrayBuffer: ArrayBuffer;
  metrics: PdfBuildMetrics;
};

export type GenerateNonGenuinePdfWorkerError = {
  type: 'generate-non-genuine-pdf:error';
  requestId: number;
  fingerprint: string;
  error: string;
};

export type PdfWorkerRequest = GenerateMainPdfWorkerRequest | GenerateNonGenuinePdfWorkerRequest;
export type PdfWorkerResponse =
  | GenerateMainPdfWorkerSuccess
  | GenerateMainPdfWorkerError
  | GenerateNonGenuinePdfWorkerSuccess
  | GenerateNonGenuinePdfWorkerError;
