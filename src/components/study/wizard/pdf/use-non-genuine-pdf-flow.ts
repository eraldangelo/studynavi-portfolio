'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type jsPDF from 'jspdf';
import type { Answers } from '@/lib/core/types';
import type { ExchangeRates } from '@/services/exchange-rate-service';
import type { FinancialCalculationResult, FinancialDocumentCalculationResult } from '@/services/financials/common';
import { generateNonGenuineBlankPdf, type PdfBuildMetrics } from '@/lib/pdf/generator';
import { elapsedMs, nowMs } from '@/lib/pdf/perf/metrics';
import { reportRuntimeAlert } from '@/lib/monitoring/runtime-alert.client';
import { createPdfFingerprint } from './fingerprint';
import { canUsePdfWorker, disablePdfWorker, generateNonGenuinePdfWithWorker } from './worker-client';
import {
  createEmptyBuildMetrics,
  downloadPdfBytes,
  reportNonGenuineDownloadMetric,
} from './use-wizard-pdf-flow.helpers';
import { waitForNextPaint } from '../study-wizard.utils';

type UseNonGenuinePdfFlowArgs = {
  answers: Answers;
  exchangeRates: ExchangeRates | null;
  paymentDetails: FinancialCalculationResult | null;
  financialDocuments: FinancialDocumentCalculationResult | null;
  canPrepare: boolean;
  onComplete: () => void;
  isE2EMockData: boolean;
};

type CachedNonGenuinePdf = {
  fingerprint: string;
  metrics: PdfBuildMetrics;
  doc: jsPDF | null;
  pdfBytes: Uint8Array | null;
};

export function useNonGenuinePdfFlow({
  answers,
  exchangeRates,
  paymentDetails,
  financialDocuments,
  canPrepare,
  onComplete,
  isE2EMockData,
}: UseNonGenuinePdfFlowArgs) {
  const [isNonGenuineDownloading, setIsNonGenuineDownloading] = useState(false);
  const warmRequestIdRef = useRef(0);
  const cacheRef = useRef<CachedNonGenuinePdf | null>(null);

  useEffect(
    () => () => {
      cacheRef.current = null;
    },
    [],
  );

  useEffect(() => {
    let isCancelled = false;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    if (!canPrepare || !exchangeRates) return () => undefined;

    const fingerprint = createPdfFingerprint({
      answers,
      exchangeRates,
      paymentDetails,
      financialDocuments,
    });
    if (cacheRef.current?.fingerprint === fingerprint) return () => undefined;

    const requestId = warmRequestIdRef.current + 1;
    warmRequestIdRef.current = requestId;

    const warmPdfCache = async () => {
      try {
        let metrics = createEmptyBuildMetrics();
        let doc: jsPDF | null = null;
        let pdfBytes: Uint8Array | null = null;

        if (canUsePdfWorker()) {
          try {
            const result = await generateNonGenuinePdfWithWorker({
              answers,
              exchangeRates,
              fingerprint,
            });
            metrics = result.metrics;
            pdfBytes = new Uint8Array(result.pdfArrayBuffer);
          } catch (workerError) {
            disablePdfWorker();
            reportRuntimeAlert({
              source: 'pdf.non-genuine.warm-cache.worker-fallback',
              message: 'Worker Non-Genuine warm cache failed; falling back to main thread',
              context: {
                error: workerError instanceof Error ? workerError.message : String(workerError),
              },
            });
            doc = await generateNonGenuineBlankPdf(answers, exchangeRates, true, (result) => {
              metrics = result;
            });
            pdfBytes = new Uint8Array(doc.output('arraybuffer'));
          }
        } else {
          doc = await generateNonGenuineBlankPdf(answers, exchangeRates, true, (result) => {
            metrics = result;
          });
          pdfBytes = new Uint8Array(doc.output('arraybuffer'));
        }

        if (isCancelled || requestId !== warmRequestIdRef.current) return;
        cacheRef.current = {
          fingerprint,
          metrics,
          doc,
          pdfBytes,
        };
      } catch (error) {
        if (isCancelled || requestId !== warmRequestIdRef.current) return;
        console.warn('Error warming Non-Genuine PDF cache:', error);
        reportRuntimeAlert({
          source: 'pdf.non-genuine.warm-cache',
          message: 'Error warming Non-Genuine PDF cache',
          context: { error: error instanceof Error ? error.message : String(error) },
        });
      }
    };

    timerId = setTimeout(() => {
      requestAnimationFrame(() => {
        if (!isCancelled && requestId === warmRequestIdRef.current) warmPdfCache();
      });
    }, 180);

    return () => {
      isCancelled = true;
      if (timerId) clearTimeout(timerId);
    };
  }, [answers, canPrepare, exchangeRates, financialDocuments, paymentDetails]);

  const handleDownloadNonGenuinePdf = useCallback(async () => {
    if (!exchangeRates) return;
    setIsNonGenuineDownloading(true);
    await waitForNextPaint();
    try {
      if (isE2EMockData) {
        await new Promise((resolve) => setTimeout(resolve, 120));
        onComplete();
        return;
      }

      const destination = answers.studyDestination || 'Unknown';
      const fingerprint = createPdfFingerprint({
        answers,
        exchangeRates,
        paymentDetails,
        financialDocuments,
      });
      const filename = `StudyNavi ${answers.schoolName || 'School'} Guide.pdf`;
      const cached = cacheRef.current;

      if (cached && cached.fingerprint === fingerprint) {
        const saveStartMs = nowMs();
        if (cached.pdfBytes) {
          downloadPdfBytes(cached.pdfBytes, filename);
        } else if (cached.doc) {
          cached.doc.save(filename);
        }
        reportNonGenuineDownloadMetric({
          destination,
          fingerprint,
          metrics: cached.metrics,
          downloadTriggerMs: elapsedMs(saveStartMs),
          reusedPreview: true,
        });
      } else if (canUsePdfWorker()) {
        try {
          const result = await generateNonGenuinePdfWithWorker({
            answers,
            exchangeRates,
            fingerprint,
          });
          const saveStartMs = nowMs();
          downloadPdfBytes(new Uint8Array(result.pdfArrayBuffer), filename);
          reportNonGenuineDownloadMetric({
            destination,
            fingerprint,
            metrics: result.metrics,
            downloadTriggerMs: elapsedMs(saveStartMs),
            reusedPreview: false,
          });
        } catch (workerError) {
          disablePdfWorker();
          reportRuntimeAlert({
            source: 'pdf.non-genuine.download.worker-fallback',
            message: 'Worker Non-Genuine download failed; falling back to main thread',
            context: {
              error: workerError instanceof Error ? workerError.message : String(workerError),
            },
          });
          let metrics = createEmptyBuildMetrics();
          await generateNonGenuineBlankPdf(answers, exchangeRates, false, (result) => {
            metrics = result;
          });
          reportNonGenuineDownloadMetric({
            destination,
            fingerprint,
            metrics,
            downloadTriggerMs: metrics.downloadTriggerMs,
            reusedPreview: false,
          });
        }
      } else {
        let metrics = createEmptyBuildMetrics();
        await generateNonGenuineBlankPdf(answers, exchangeRates, false, (result) => {
          metrics = result;
        });
        reportNonGenuineDownloadMetric({
          destination,
          fingerprint,
          metrics,
          downloadTriggerMs: metrics.downloadTriggerMs,
          reusedPreview: false,
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 600));
      onComplete();
    } catch (error) {
      console.error('Error generating Non-Genuine PDF', error);
      reportRuntimeAlert({
        source: 'pdf.non-genuine.download',
        message: 'Error generating Non-Genuine PDF download',
        context: { error: error instanceof Error ? error.message : String(error) },
      });
    } finally {
      setIsNonGenuineDownloading(false);
    }
  }, [answers, exchangeRates, financialDocuments, isE2EMockData, onComplete, paymentDetails]);

  return {
    isNonGenuineDownloading,
    handleDownloadNonGenuinePdf,
  };
}
