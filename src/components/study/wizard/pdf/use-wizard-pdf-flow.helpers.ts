'use client';

import type jsPDF from 'jspdf';
import type { Answers } from '@/lib/core/types';
import type { ExchangeRates } from '@/services/exchange-rate-service';
import type { FinancialCalculationResult, FinancialDocumentCalculationResult } from '@/services/financials/common';
import type { PdfBuildMetrics } from '@/lib/pdf/generator';
import { generateBlankPdf } from '@/lib/pdf/generator';
import { pushPdfPerfMetric, elapsedMs, nowMs } from '@/lib/pdf/perf/metrics';
import { reportRuntimeAlert } from '@/lib/monitoring/runtime-alert.client';
import { canUsePdfWorker, disablePdfWorker, generateMainPdfWithWorker } from './worker-client';

type MainPdfBuildArgs = {
  answers: Answers;
  exchangeRates: ExchangeRates | null;
  paymentDetails: FinancialCalculationResult | null;
  financialDocuments: FinancialDocumentCalculationResult | null;
  destination: string;
  fingerprint: string;
};

export type MainPdfPreviewResult = {
  blobUrl: string;
  metrics: PdfBuildMetrics;
  doc: jsPDF | null;
  pdfBytes: Uint8Array | null;
};

export type MainPdfDownloadResult = {
  metrics: PdfBuildMetrics;
  downloadTriggerMs: number;
};

export function createEmptyBuildMetrics(): PdfBuildMetrics {
  return {
    assetLoadMs: 0,
    buildMs: 0,
    totalMs: 0,
    downloadTriggerMs: 0,
  };
}

export function reportPreviewMetric(args: {
  destination: string;
  fingerprint: string;
  metrics: PdfBuildMetrics;
  blobUrlMs: number;
}) {
  const { destination, fingerprint, metrics, blobUrlMs } = args;
  pushPdfPerfMetric({
    phase: 'preview',
    destination,
    fingerprint,
    assetLoadMs: metrics.assetLoadMs,
    buildMs: metrics.buildMs,
    blobUrlMs,
    downloadTriggerMs: 0,
    totalMs: metrics.totalMs + blobUrlMs,
    reusedPreview: false,
    timestamp: new Date().toISOString(),
  });
}

export function reportDownloadMetric(args: {
  destination: string;
  fingerprint: string;
  metrics: PdfBuildMetrics;
  downloadTriggerMs: number;
  reusedPreview: boolean;
}) {
  const { destination, fingerprint, metrics, downloadTriggerMs, reusedPreview } = args;
  pushPdfPerfMetric({
    phase: 'download',
    destination,
    fingerprint,
    assetLoadMs: metrics.assetLoadMs,
    buildMs: metrics.buildMs,
    blobUrlMs: 0,
    downloadTriggerMs,
    totalMs: metrics.totalMs + downloadTriggerMs,
    reusedPreview,
    timestamp: new Date().toISOString(),
  });
}

export function reportNonGenuineDownloadMetric(args: {
  destination: string;
  fingerprint: string;
  metrics: PdfBuildMetrics;
  downloadTriggerMs: number;
  reusedPreview: boolean;
}) {
  const { destination, fingerprint, metrics, downloadTriggerMs, reusedPreview } = args;
  pushPdfPerfMetric({
    phase: 'non-genuine-download',
    destination,
    fingerprint,
    assetLoadMs: metrics.assetLoadMs,
    buildMs: metrics.buildMs,
    blobUrlMs: 0,
    downloadTriggerMs,
    totalMs: metrics.totalMs + downloadTriggerMs,
    reusedPreview,
    timestamp: new Date().toISOString(),
  });
}

export function downloadPdfBytes(pdfBytes: Uint8Array, filename: string) {
  const pdfBuffer = pdfBytes.buffer.slice(
    pdfBytes.byteOffset,
    pdfBytes.byteOffset + pdfBytes.byteLength,
  ) as ArrayBuffer;
  const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' });
  const downloadUrl = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 1200);
}

function createPdfBlobUrl(pdfBytes: Uint8Array) {
  const pdfBuffer = pdfBytes.buffer.slice(
    pdfBytes.byteOffset,
    pdfBytes.byteOffset + pdfBytes.byteLength,
  ) as ArrayBuffer;
  return URL.createObjectURL(new Blob([pdfBuffer], { type: 'application/pdf' }));
}

export async function buildPreviewPdfWithFallback(args: MainPdfBuildArgs): Promise<MainPdfPreviewResult> {
  const { answers, exchangeRates, paymentDetails, financialDocuments, destination, fingerprint } = args;
  let buildMetrics = createEmptyBuildMetrics();

  if (canUsePdfWorker()) {
    try {
      const { pdfArrayBuffer, metrics } = await generateMainPdfWithWorker({
        answers,
        exchangeRates,
        paymentDetails,
        financialDocuments,
        fingerprint,
      });
      buildMetrics = metrics;
      const pdfBytes = new Uint8Array(pdfArrayBuffer);
      const blobStartMs = nowMs();
      const blobUrl = createPdfBlobUrl(pdfBytes);
      reportPreviewMetric({
        destination,
        fingerprint,
        metrics: buildMetrics,
        blobUrlMs: elapsedMs(blobStartMs),
      });
      return {
        blobUrl,
        metrics: buildMetrics,
        doc: null,
        pdfBytes,
      };
    } catch (workerError) {
      disablePdfWorker();
      reportRuntimeAlert({
        source: 'pdf.preview.worker-fallback',
        message: 'Worker PDF preview failed; falling back to main thread',
        context: {
          error: workerError instanceof Error ? workerError.message : String(workerError),
        },
      });
    }
  }

  const generatedDoc = await generateBlankPdf(
    answers,
    exchangeRates,
    paymentDetails,
    financialDocuments,
    true,
    (metrics) => {
      buildMetrics = metrics;
    },
  );
  const blobStartMs = nowMs();
  const blobUrl = generatedDoc.output('bloburl').toString();
  reportPreviewMetric({
    destination,
    fingerprint,
    metrics: buildMetrics,
    blobUrlMs: elapsedMs(blobStartMs),
  });
  return {
    blobUrl,
    metrics: buildMetrics,
    doc: generatedDoc,
    pdfBytes: null,
  };
}

export async function downloadMainPdfWithFallback(
  args: MainPdfBuildArgs & { filename: string },
): Promise<MainPdfDownloadResult> {
  const { answers, exchangeRates, paymentDetails, financialDocuments, fingerprint, filename } = args;

  if (canUsePdfWorker()) {
    try {
      const { pdfArrayBuffer, metrics } = await generateMainPdfWithWorker({
        answers,
        exchangeRates,
        paymentDetails,
        financialDocuments,
        fingerprint,
      });
      const saveStartMs = nowMs();
      downloadPdfBytes(new Uint8Array(pdfArrayBuffer), filename);
      return {
        metrics,
        downloadTriggerMs: elapsedMs(saveStartMs),
      };
    } catch (workerError) {
      disablePdfWorker();
      reportRuntimeAlert({
        source: 'pdf.download.worker-fallback',
        message: 'Worker PDF download failed; falling back to main thread',
        context: {
          error: workerError instanceof Error ? workerError.message : String(workerError),
        },
      });
    }
  }

  let metrics = createEmptyBuildMetrics();
  await generateBlankPdf(
    answers,
    exchangeRates,
    paymentDetails,
    financialDocuments,
    false,
    (result) => {
      metrics = result;
    },
  );
  return {
    metrics,
    downloadTriggerMs: metrics.downloadTriggerMs,
  };
}
