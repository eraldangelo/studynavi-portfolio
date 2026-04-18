'use client';

import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { getCurrencyInfo } from '@/lib/currency';
import type { FinancialCalculationResult } from '@/services/financials/common';
import type { Answers, ExchangeRates, FinancialDocumentCalculationResult } from '../types/pdf-types';
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
import { getDestinationFlagUrl, loadMainPdfAssets } from '../pdf-assets';
import { drawCenteredTitleWithFlag, PDF_MARGIN as margin, PDF_SEPARATOR_Y as separatorY } from '../pdf-utils';
import { elapsedMs, nowMs } from '../perf/metrics';
import type { PdfBuildMetrics } from './types';

const yieldToBrowser = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

export const generateBlankPdf = async (
  answers: Answers,
  exchangeRates: ExchangeRates | null,
  paymentDetails: FinancialCalculationResult | null,
  financialDocuments: FinancialDocumentCalculationResult | null,
  previewMode = false,
  onMetrics?: (metrics: PdfBuildMetrics) => void,
): Promise<jsPDF> => {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const totalPages = 2;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const totalStartMs = nowMs();
  let assetLoadMs = 0;
  let drawStartMs = totalStartMs;
  let downloadTriggerMs = 0;

  try {
    const destinationFlagUrl = getDestinationFlagUrl(answers.studyDestination);
    const assetLoadStartMs = nowMs();
    const assets = await loadMainPdfAssets(destinationFlagUrl);
    assetLoadMs = elapsedMs(assetLoadStartMs);
    await yieldToBrowser();
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
    await yieldToBrowser();

    currentY = drawProgramDetails(doc, answers, currentY);
    await yieldToBrowser();
    currentY = drawStudentVisaProcess(doc, answers, currentY, {
      planeIconImg: assets.planeIconImg,
      checkboxIconImg: assets.checkboxIconImg,
      checkedIconImg: assets.checkedIconImg,
    });
    await yieldToBrowser();

    currentY += 4;
    doc.setDrawColor(150, 150, 150);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 8;
    currentY = drawRequiredDocuments(doc, answers, currentY, {
      documentIconImg: assets.documentIconImg,
      checkboxIconImg: assets.checkboxIconImg,
    });
    await yieldToBrowser();

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
    await yieldToBrowser();

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
    await yieldToBrowser();

    page2Y = drawProgramDetails(doc, answers, page2Y);
    await yieldToBrowser();
    page2Y = drawExpensesDetails(doc, answers, page2Y, currencySymbol, phpRate);
    await yieldToBrowser();
    page2Y = drawInitialExpenses(doc, answers, paymentDetails, page2Y, { payIconImg: assets.payIconImg }, currencySymbol, phpRate);
    await yieldToBrowser();

    page2Y += 4;
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, page2Y, pageWidth - margin, page2Y);
    page2Y += 4;
    page2Y = drawEvidenceOfFunds(doc, answers, financialDocuments, exchangeRates, page2Y, {
      checkboxIconImg: assets.checkboxIconImg,
      documentIconImg: assets.documentIconImg,
      bankIconImg: assets.bankIconImg,
    });
    await yieldToBrowser();

    drawPrivacyDisclosure(doc, assets.warningIconImg);
    drawFooter(doc, 2, totalPages, generatedDate, currencyCode, phpRate);

    if (!previewMode) {
      const downloadStartMs = nowMs();
      doc.save(`StudyNavi ${answers.schoolName || 'School'} Guide.pdf`);
      downloadTriggerMs = elapsedMs(downloadStartMs);
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
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
