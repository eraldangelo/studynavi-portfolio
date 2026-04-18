import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { getCurrencyInfo } from '@/lib/currency';
import type { Answers, ExchangeRates } from '../types/pdf-types';
import { drawHeader } from '../components/header';
import { drawFooter } from '../components/footer';
import { drawNonGenuineRecommendations } from '../components/non-genuine-recommendations';
import { drawPrivacyDisclosure } from '../components/privacy-disclosure';
import { drawCenteredTitleWithFlag, PDF_MARGIN as margin, PDF_SEPARATOR_Y as separatorY } from '../pdf-utils';
import { elapsedMs, nowMs } from '../perf/metrics';
import type { PdfBuildMetrics } from './types';
import { loadWorkerNonGenuinePdfAssets } from '../worker/assets';

const yieldToWorkerLoop = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

type WorkerNonGenuinePdfResult = {
  pdfArrayBuffer: ArrayBuffer;
  metrics: PdfBuildMetrics;
};

export async function generateNonGenuineBlankPdfInWorker(
  answers: Answers,
  exchangeRates: ExchangeRates | null,
): Promise<WorkerNonGenuinePdfResult> {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const totalStartMs = nowMs();
  let assetLoadMs = 0;
  let drawStartMs = totalStartMs;

  const assetLoadStartMs = nowMs();
  const {
    logoImg,
    disclaimerIconImg,
    warningIconImg,
    destinationFlagImg,
    recommendationImg,
    bankIconImg,
  } = await loadWorkerNonGenuinePdfAssets(answers.studyDestination);
  assetLoadMs = elapsedMs(assetLoadStartMs);
  await yieldToWorkerLoop();
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
  await yieldToWorkerLoop();

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
  await yieldToWorkerLoop();

  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    drawPrivacyDisclosure(doc, warningIconImg);
    drawFooter(doc, page, totalPages, generatedDate, currencyCode, phpRate);
  }
  const pdfArrayBuffer = doc.output('arraybuffer');

  return {
    pdfArrayBuffer,
    metrics: {
      assetLoadMs,
      buildMs: elapsedMs(drawStartMs),
      totalMs: elapsedMs(totalStartMs),
      downloadTriggerMs: 0,
    },
  };
}
