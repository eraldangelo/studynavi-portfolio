'use client';

import type { PdfBuildMetrics } from '@/lib/pdf/generator';
import type {
  MainPdfWorkerPayload,
  NonGenuinePdfWorkerPayload,
  PdfWorkerRequest,
  PdfWorkerResponse,
} from './worker.types';

type PendingRequest = {
  resolve: (result: { pdfArrayBuffer: ArrayBuffer; metrics: PdfBuildMetrics }) => void;
  reject: (error: Error) => void;
  timeoutId: ReturnType<typeof setTimeout>;
};

let requestIdCounter = 0;
let worker: Worker | null = null;
let workerUnavailable = false;
const pending = new Map<number, PendingRequest>();

function handleWorkerMessage(event: MessageEvent<PdfWorkerResponse>) {
  const message = event.data;
  if (!message) return;

  const pendingRequest = pending.get(message.requestId);
  if (!pendingRequest) return;
  pending.delete(message.requestId);
  clearTimeout(pendingRequest.timeoutId);

  if ('pdfArrayBuffer' in message && 'metrics' in message) {
    pendingRequest.resolve({
      pdfArrayBuffer: message.pdfArrayBuffer,
      metrics: message.metrics,
    });
    return;
  }

  pendingRequest.reject(new Error('error' in message ? message.error : 'PDF worker failed.'));
}

function destroyWorker() {
  if (!worker) return;
  worker.terminate();
  worker = null;
}

export function disablePdfWorker() {
  workerUnavailable = true;
  destroyWorker();
}

function getPdfWorker(): Worker | null {
  if (workerUnavailable || typeof window === 'undefined' || typeof Worker === 'undefined') {
    return null;
  }
  if (worker) return worker;

  try {
    worker = new Worker(new URL('./pdf.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = handleWorkerMessage;
    worker.onerror = () => {
      disablePdfWorker();
    };
    return worker;
  } catch {
    disablePdfWorker();
    return null;
  }
}

async function requestPdfWithWorker(
  request: PdfWorkerRequest,
  timeoutMs = 60_000,
): Promise<{ pdfArrayBuffer: ArrayBuffer; metrics: PdfBuildMetrics }> {
  const pdfWorker = getPdfWorker();
  if (!pdfWorker) {
    throw new Error('PDF worker unavailable');
  }

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      pending.delete(request.requestId);
      disablePdfWorker();
      reject(new Error('PDF worker request timed out.'));
    }, timeoutMs);

    pending.set(request.requestId, { resolve, reject, timeoutId });
    pdfWorker.postMessage(request);
  });
}

export function canUsePdfWorker(): boolean {
  return !!getPdfWorker();
}

export async function generateMainPdfWithWorker(
  payload: MainPdfWorkerPayload,
  timeoutMs = 60_000,
) {
  requestIdCounter += 1;
  return requestPdfWithWorker(
    { type: 'generate-main-pdf', requestId: requestIdCounter, payload },
    timeoutMs,
  );
}

export async function generateNonGenuinePdfWithWorker(
  payload: NonGenuinePdfWorkerPayload,
  timeoutMs = 60_000,
) {
  requestIdCounter += 1;
  return requestPdfWithWorker(
    { type: 'generate-non-genuine-pdf', requestId: requestIdCounter, payload },
    timeoutMs,
  );
}
