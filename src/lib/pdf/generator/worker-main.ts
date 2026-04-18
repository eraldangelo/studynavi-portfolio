import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { getCurrencyInfo } from '@/lib/currency';
import type { Answers, ExchangeRates, FinancialDocumentCalculationResult } from '../types/pdf-types';
import type { FinancialCalculationResult } from '@/services/financials/common';
import { drawHeader } from '../components/header';
import { drawFooter } from '../components/footer';
import { drawProgramDetails } from '../components/program-details';
import { drawStudentVisaProcess } from '../components/student-visa-process';
import { drawRequiredDocuments } from '../components/required-documents';
import { calculateDidYouKnowHeight, drawDidYouKnow, getOptimalFontSize } from '../components/info-sections';
import { drawPrivacyDisclosure } from '../components/privacy-disclosure';
import { drawExpensesDetails } from '../components/expenses-details';
import { drawInitialExpenses } from '../components/initial-expenses';
import { drawEvidenceOfFunds } from '../components/evidence-of-funds';
import { drawCenteredTitleWithFlag, PDF_MARGIN as margin, PDF_SEPARATOR_Y as separatorY } from '../pdf-utils';
import { elapsedMs, nowMs } from '../perf/metrics';
import type { PdfBuildMetrics } from './types';
import { loadWorkerMainPdfAssets } from '../worker/assets';

const yieldToWorkerLoop = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

type WorkerMainPdfResult = {
  pdfArrayBuffer: ArrayBuffer;
  metrics: PdfBuildMetrics;
};

export async function generateBlankPdfInWorker(
  answers: Answers,
  exchangeRates: ExchangeRates | null,
  paymentDetails: FinancialCalculationResult | null,
  financialDocuments: FinancialDocumentCalculationResult | null,
): Promise<WorkerMainPdfResult> {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const totalPages = 2;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const totalStartMs = nowMs();
  let assetLoadMs = 0;
  let drawStartMs = totalStartMs;

  const assetLoadStartMs = nowMs();
  const assets = await loadWorkerMainPdfAssets(answers.studyDestination);
  assetLoadMs = elapsedMs(assetLoadStartMs);
  await yieldToWorkerLoop();
  drawStartMs = nowMs();

  const generatedDate = format(new Date(), 'dd-MMM-yyyy HH:mm:ss');
  const { currencyCode, currencySymbol, phpRate } = getCurrencyInfo(answers.studyDestination, exchangeRates);

  drawHeader(doc, assets.logoImg, assets.disclaimerIconImg, { showDisclaimerIcon: false });
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, separatorY, pageWidth - margin, separatorY);

  let currentY = separatorY + 8;
  drawCenteredTitleWithFlag({
    doc,
    text: `${answers.studyDestination || 'Destination'}'s Student Visa Guide`,
    y: currentY,
    pageWidth,
    flagImg: assets.destinationFlagImg,
  });
  currentY += 10;
  await yieldToWorkerLoop();

  currentY = drawProgramDetails(doc, answers, currentY);
  await yieldToWorkerLoop();
  currentY = drawStudentVisaProcess(doc, answers, currentY, {
    planeIconImg: assets.planeIconImg,
    checkboxIconImg: assets.checkboxIconImg,
    checkedIconImg: assets.checkedIconImg,
  });
  await yieldToWorkerLoop();

  currentY += 4;
  doc.setDrawColor(150, 150, 150);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 8;
  currentY = drawRequiredDocuments(doc, answers, currentY, {
    documentIconImg: assets.documentIconImg,
    checkboxIconImg: assets.checkboxIconImg,
  });
  await yieldToWorkerLoop();

  currentY += 2;
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  const contentEndY = currentY;
  const privacyBoxStartY = pageHeight - 12 - 4 - 6 - 18;
  const availableSpace = privacyBoxStartY - contentEndY;
  const columnWidth = (pageWidth - margin * 2) / 2;

  const { fontSize, lineHeight } = getOptimalFontSize(doc, availableSpace, columnWidth);
  const didYouKnowHeight = calculateDidYouKnowHeight(doc, columnWidth, fontSize, lineHeight);
  drawDidYouKnow(doc, contentEndY + (availableSpace - didYouKnowHeight) / 2, fontSize, lineHeight, assets.ideaIconImg);

  drawPrivacyDisclosure(doc, assets.warningIconImg);
  drawFooter(doc, 1, totalPages, generatedDate, currencyCode, phpRate);
  await yieldToWorkerLoop();

  doc.addPage();
  drawHeader(doc, assets.logoImg, assets.disclaimerIconImg, { showDisclaimerIcon: false });
  doc.setDrawColor(220, 220, 200);
  doc.line(margin, separatorY, pageWidth - margin, separatorY);

  let page2Y = separatorY + 8;
  drawCenteredTitleWithFlag({
    doc,
    text: `${answers.studyDestination || 'Destination'}'s Summary of Initial Expenses`,
    y: page2Y,
    pageWidth,
    flagImg: assets.destinationFlagImg,
  });
  page2Y += 10;
  await yieldToWorkerLoop();
  page2Y = drawProgramDetails(doc, answers, page2Y);
  await yieldToWorkerLoop();
  page2Y = drawExpensesDetails(doc, answers, page2Y, currencySymbol, phpRate);
  await yieldToWorkerLoop();
  page2Y = drawInitialExpenses(doc, answers, paymentDetails, page2Y, { payIconImg: assets.payIconImg }, currencySymbol, phpRate);
  await yieldToWorkerLoop();

  page2Y += 4;
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, page2Y, pageWidth - margin, page2Y);
  page2Y += 4;
  page2Y = drawEvidenceOfFunds(doc, answers, financialDocuments, exchangeRates, page2Y, {
    checkboxIconImg: assets.checkboxIconImg,
    documentIconImg: assets.documentIconImg,
    bankIconImg: assets.bankIconImg,
  });
  await yieldToWorkerLoop();

  drawPrivacyDisclosure(doc, assets.warningIconImg);
  drawFooter(doc, 2, totalPages, generatedDate, currencyCode, phpRate);
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
