/// <reference lib="webworker" />

import { generateBlankPdfInWorker } from '@/lib/pdf/generator/worker-main';
import { generateNonGenuineBlankPdfInWorker } from '@/lib/pdf/generator/worker-non-genuine';
import type { PdfWorkerRequest, PdfWorkerResponse } from './worker.types';

const workerContext = self as DedicatedWorkerGlobalScope;

async function handleMainRequest(message: Extract<PdfWorkerRequest, { type: 'generate-main-pdf' }>) {
  try {
    const { pdfArrayBuffer, metrics } = await generateBlankPdfInWorker(
      message.payload.answers,
      message.payload.exchangeRates,
      message.payload.paymentDetails,
      message.payload.financialDocuments,
    );
    const response: PdfWorkerResponse = {
      type: 'generate-main-pdf:success',
      requestId: message.requestId,
      fingerprint: message.payload.fingerprint,
      pdfArrayBuffer,
      metrics,
    };
    workerContext.postMessage(response, [pdfArrayBuffer]);
  } catch (error) {
    const response: PdfWorkerResponse = {
      type: 'generate-main-pdf:error',
      requestId: message.requestId,
      fingerprint: message.payload.fingerprint,
      error: error instanceof Error ? error.message : String(error),
    };
    workerContext.postMessage(response);
  }
}

async function handleNonGenuineRequest(
  message: Extract<PdfWorkerRequest, { type: 'generate-non-genuine-pdf' }>,
) {
  try {
    const { pdfArrayBuffer, metrics } = await generateNonGenuineBlankPdfInWorker(
      message.payload.answers,
      message.payload.exchangeRates,
    );
    const response: PdfWorkerResponse = {
      type: 'generate-non-genuine-pdf:success',
      requestId: message.requestId,
      fingerprint: message.payload.fingerprint,
      pdfArrayBuffer,
      metrics,
    };
    workerContext.postMessage(response, [pdfArrayBuffer]);
  } catch (error) {
    const response: PdfWorkerResponse = {
      type: 'generate-non-genuine-pdf:error',
      requestId: message.requestId,
      fingerprint: message.payload.fingerprint,
      error: error instanceof Error ? error.message : String(error),
    };
    workerContext.postMessage(response);
  }
}

workerContext.onmessage = async (event: MessageEvent<PdfWorkerRequest>) => {
  const message = event.data;
  if (!message) return;
  if (message.type === 'generate-main-pdf') await handleMainRequest(message);
  if (message.type === 'generate-non-genuine-pdf') await handleNonGenuineRequest(message);
};

export {};
