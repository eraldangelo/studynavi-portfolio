import jsPDF from 'jspdf';
import type { Answers } from '@/lib/pdf/types/pdf-types';
import type { FinancialCalculationResult } from '@/services/financials/common';
import { drawTwoColumnInitialExpenses } from '@/lib/pdf/components/initial-expenses-two-column';
import { drawSingleColumnInitialExpenses } from '@/lib/pdf/components/initial-expenses-single-column';
import { getPdfImageAddSource, type PdfImageSource } from '../shared/image-source';

export const drawInitialExpenses = (
  doc: jsPDF,
  answers: Answers,
  paymentDetails: FinancialCalculationResult | null,
  initialY: number,
  images: {
    payIconImg: PdfImageSource;
  },
  currencySymbol: string,
  phpRate: number,
): number => {
  let currentY = initialY;
  const margin = 8;
  const pageWidth = doc.internal.pageSize.getWidth();

  currentY += 4;
  const cashoutHeaderText = 'Initial Cashout Computation';
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#004097');

  const cashoutIconSize = 4;
  const cashoutIconGap = 1.5;
  const cashoutHeaderTextWidth = doc.getTextWidth(cashoutHeaderText);
  const totalCashoutHeaderWidth = cashoutHeaderTextWidth + cashoutIconSize + cashoutIconGap;
  const cashoutHeaderStartX = (pageWidth - totalCashoutHeaderWidth) / 2;

  const cashoutIconY = currentY - (cashoutIconSize / 2);
  doc.addImage(
    getPdfImageAddSource(images.payIconImg),
    'PNG',
    cashoutHeaderStartX,
    cashoutIconY,
    cashoutIconSize,
    cashoutIconSize,
  );

  const cashoutTextX = cashoutHeaderStartX + cashoutIconSize + cashoutIconGap;
  doc.text(cashoutHeaderText, cashoutTextX, currentY, { baseline: 'middle', align: 'left' });

  currentY += 8;

  if (!paymentDetails) {
    doc.text('Financial details could not be calculated.', margin, currentY);
    return currentY + 10;
  }

  const hasDependents = answers.visaAssistance && answers.visaAssistance !== 'No';

  if (hasDependents) {
    return drawTwoColumnInitialExpenses({
      doc,
      answers,
      paymentDetails,
      currentY,
      margin,
      pageWidth,
      currencySymbol,
      phpRate,
    });
  }

  return drawSingleColumnInitialExpenses({
    doc,
    answers,
    paymentDetails,
    currentY,
    margin,
    pageWidth,
    currencySymbol,
    phpRate,
  });
};
