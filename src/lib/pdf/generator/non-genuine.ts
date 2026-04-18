'use client';

import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { getCurrencyInfo } from '@/lib/currency';
import type { Answers, ExchangeRates } from '../types/pdf-types';
import { drawHeader } from '../components/header';
import { drawFooter } from '../components/footer';
import { drawNonGenuineRecommendations } from '../components/non-genuine-recommendations';
import { drawPrivacyDisclosure } from '../components/privacy-disclosure';
import { getDestinationFlagUrl, loadNonGenuinePdfAssets } from '../pdf-assets';
import { drawCenteredTitleWithFlag, PDF_MARGIN as margin, PDF_SEPARATOR_Y as separatorY } from '../pdf-utils';
import { elapsedMs, nowMs } from '../perf/metrics';
import type { PdfBuildMetrics } from './types';

const yieldToBrowser = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

export const generateNonGenuineBlankPdf = async (
  answers: Answers,
  exchangeRates: ExchangeRates | null,
  previewMode = false,
  onMetrics?: (metrics: PdfBuildMetrics) => void,
): Promise<jsPDF> => {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const totalStartMs = nowMs();
  let assetLoadMs = 0;
  let drawStartMs = totalStartMs;
  let downloadTriggerMs = 0;

  try {
    const destinationFlagUrl = getDestinationFlagUrl(answers.studyDestination);
    const assetLoadStartMs = nowMs();
    const {
      logoImg,
      disclaimerIconImg,
      warningIconImg,
      destinationFlagImg,
      recommendationImg,
      bankIconImg,
    } = await loadNonGenuinePdfAssets(destinationFlagUrl);
    assetLoadMs = elapsedMs(assetLoadStartMs);
    await yieldToBrowser();
    drawStartMs = nowMs();

    const generatedDate = format(new Date(), 'dd-MMM-yyyy HH:mm:ss');
    const { currencyCode, phpRate } = getCurrencyInfo(answers.studyDestination, exchangeRates);

    drawHeader(doc, logoImg, disclaimerIconImg, { showDisclaimerIcon: false });
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, separatorY, pageWidth - margin, separatorY);

    const titleY = separatorY + 8;
    const titleText = `${answers.studyDestination || 'Destination'} - School Recommendation`;
    drawCenteredTitleWithFlag({
      doc,
      text: titleText,
      y: titleY,
      pageWidth,
      flagImg: destinationFlagImg,
    });

    const currentY = titleY + 6;
    const footerSeparatorY = pageHeight - 12 - 4;
    const privacyTopY = footerSeparatorY - 6 - 18;
    const contentMaxY = privacyTopY - 4;
    await yieldToBrowser();

    drawNonGenuineRecommendations(doc, answers, currentY, {
      pageWidth,
      pageHeight,
      margin,
      contentMaxY,
      separatorY,
      logoImg,
      disclaimerIconImg,
      destinationFlagImg,
      recommendationImg,
      iconImg: bankIconImg,
      title: titleText,
    });
    await yieldToBrowser();

    const totalPagesAfter = doc.getNumberOfPages();
    for (let p = 1; p <= totalPagesAfter; p += 1) {
      doc.setPage(p);
      drawPrivacyDisclosure(doc, warningIconImg);
      drawFooter(doc, p, totalPagesAfter, generatedDate, currencyCode, phpRate);
    }

    if (!previewMode) {
      const downloadStartMs = nowMs();
      doc.save(`StudyNavi ${answers.schoolName || 'School'} Guide.pdf`);
      downloadTriggerMs = elapsedMs(downloadStartMs);
    }
  } catch (error) {
    const normalizedError = error instanceof Error
      ? `${error.name}: ${error.message}`
      : String((error as { type?: string } | null)?.type || error);
    console.error('Error generating Non-Genuine PDF:', normalizedError, error);
    doc.text('Error generating PDF. Could not load required images.', margin, margin);
  } finally {
    onMetrics?.({
      assetLoadMs,
      buildMs: elapsedMs(drawStartMs),
      totalMs: elapsedMs(totalStartMs),
      downloadTriggerMs,
    });
  }

  return doc;
};
