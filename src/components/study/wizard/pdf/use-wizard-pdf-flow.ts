'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type jsPDF from 'jspdf';
import type { Answers } from '@/lib/core/types';
import type { ExchangeRates } from '@/services/exchange-rate-service';
import type { FinancialCalculationResult, FinancialDocumentCalculationResult } from '@/services/financials/common';
import type { PdfBuildMetrics } from '@/lib/pdf/generator';
import { elapsedMs, nowMs } from '@/lib/pdf/perf/metrics';
import { reportRuntimeAlert } from '@/lib/monitoring/runtime-alert.client';
import { createPdfFingerprint } from './fingerprint';
import {
  buildPreviewPdfWithFallback,
  downloadMainPdfWithFallback,
  downloadPdfBytes,
  reportDownloadMetric,
} from './use-wizard-pdf-flow.helpers';
import { shouldGeneratePdfPreview, waitForNextPaint } from '../study-wizard.utils';

type UseWizardPdfFlowArgs = {
  answers: Answers;
  exchangeRates: ExchangeRates | null;
  paymentDetails: FinancialCalculationResult | null;
  financialDocuments: FinancialDocumentCalculationResult | null;
  isReviewStep: boolean;
  isLoadingRates: boolean;
  onComplete: () => void;
};

type CachedPreview = {
  fingerprint: string;
  blobUrl: string;
  metrics: PdfBuildMetrics;
  doc: jsPDF | null;
  pdfBytes: Uint8Array | null;
};

export function useWizardPdfFlow({
  answers,
  exchangeRates,
  paymentDetails,
  financialDocuments,
  isReviewStep,
  isLoadingRates,
  onComplete,
}: UseWizardPdfFlowArgs) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const previewRequestIdRef = useRef(0);
  const previewCacheRef = useRef<CachedPreview | null>(null);

  useEffect(
    () => () => {
      const cached = previewCacheRef.current;
      if (cached?.blobUrl) URL.revokeObjectURL(cached.blobUrl);
      previewCacheRef.current = null;
    },
    [],
  );

  useEffect(() => {
    let isCancelled = false;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const canGeneratePreview = shouldGeneratePdfPreview({
      isReviewStep,
      isLoadingRates,
      exchangeRates,
      paymentDetails,
      financialDocuments,
    });
    if (!canGeneratePreview) {
      setIsPreviewLoading(false);
      return () => {
        if (timerId) clearTimeout(timerId);
      };
    }

    const fingerprint = createPdfFingerprint({
      answers,
      exchangeRates,
      paymentDetails,
      financialDocuments,
    });
    const cachedPreview = previewCacheRef.current;
    if (cachedPreview?.fingerprint === fingerprint) {
      if (!pdfUrl) setPdfUrl(`${cachedPreview.blobUrl}#view=FitH&pagemode=none`);
      setIsPreviewLoading(false);
      return () => {
        if (timerId) clearTimeout(timerId);
      };
    }

    const requestId = previewRequestIdRef.current + 1;
    previewRequestIdRef.current = requestId;
    setIsPreviewLoading(true);

    const generatePreview = async () => {
      try {
        const destination = answers.studyDestination || 'Unknown';
        const { blobUrl, metrics: buildMetrics, doc, pdfBytes } = await buildPreviewPdfWithFallback({
          answers,
          exchangeRates,
          paymentDetails,
          financialDocuments,
          destination,
          fingerprint,
        });

        if (isCancelled || requestId !== previewRequestIdRef.current) return;
        const oldBlobUrl = previewCacheRef.current?.blobUrl;
        if (oldBlobUrl && oldBlobUrl !== blobUrl) URL.revokeObjectURL(oldBlobUrl);

        previewCacheRef.current = { fingerprint, blobUrl, metrics: buildMetrics, doc, pdfBytes };
        setPdfUrl(`${blobUrl}#view=FitH&pagemode=none`);
        setIsPreviewLoading(false);
      } catch (error) {
        if (isCancelled || requestId !== previewRequestIdRef.current) return;
        console.error('Error generating PDF preview:', error);
        reportRuntimeAlert({ source: 'pdf.preview', message: 'Error generating PDF preview', context: { error: error instanceof Error ? error.message : String(error) } });
        setIsPreviewLoading(false);
      }
    };

    timerId = setTimeout(() => {
      requestAnimationFrame(() => {
        if (!isCancelled && requestId === previewRequestIdRef.current) generatePreview();
      });
    }, 120);

    return () => {
      isCancelled = true;
      if (timerId) clearTimeout(timerId);
    };
  }, [answers, exchangeRates, financialDocuments, isLoadingRates, isReviewStep, paymentDetails, pdfUrl]);

  const handleDownloadPdf = useCallback(async () => {
    if (!paymentDetails || !financialDocuments || !exchangeRates) return;

    const fingerprint = createPdfFingerprint({
      answers,
      exchangeRates,
      paymentDetails,
      financialDocuments,
    });
    const destination = answers.studyDestination || 'Unknown';
    const filename = `StudyNavi ${answers.schoolName || 'School'} Guide.pdf`;

    setIsDownloading(true);
    await waitForNextPaint();
    try {
      const cachedPreview = previewCacheRef.current;
      if (cachedPreview && cachedPreview.fingerprint === fingerprint) {
        const saveStartMs = nowMs();
        if (cachedPreview.pdfBytes) {
          downloadPdfBytes(cachedPreview.pdfBytes, filename);
        } else if (cachedPreview.doc) {
          cachedPreview.doc.save(filename);
        }
        reportDownloadMetric({
          destination,
          fingerprint,
          metrics: cachedPreview.metrics,
          downloadTriggerMs: elapsedMs(saveStartMs),
          reusedPreview: true,
        });
      } else {
        const { metrics, downloadTriggerMs } = await downloadMainPdfWithFallback({
          answers,
          exchangeRates,
          paymentDetails,
          financialDocuments,
          destination,
          fingerprint,
          filename,
        });
        reportDownloadMetric({
          destination,
          fingerprint,
          metrics,
          downloadTriggerMs,
          reusedPreview: false,
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 600));
      onComplete();
    } catch (error) {
      console.error('Error generating PDF', error);
      reportRuntimeAlert({ source: 'pdf.download', message: 'Error generating PDF download', context: { error: error instanceof Error ? error.message : String(error) } });
    } finally {
      setIsDownloading(false);
    }
  }, [answers, exchangeRates, financialDocuments, onComplete, paymentDetails]);

  return { pdfUrl, isPreviewLoading, isDownloading, handleDownloadPdf };
}
