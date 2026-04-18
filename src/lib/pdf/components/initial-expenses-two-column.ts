import jsPDF from 'jspdf';
import type { Answers } from '@/lib/pdf/types/pdf-types';
import type { FinancialCalculationResult } from '@/services/financials/common';
import { drawRow, getPaymentLabel, computeScholarshipDeduction } from '@/lib/pdf/components/initial-expenses-shared';
import { drawDependentColumn } from '@/lib/pdf/components/initial-expenses-dependent-column';

interface DrawTwoColumnInitialExpensesParams {
  doc: jsPDF;
  answers: Answers;
  paymentDetails: FinancialCalculationResult;
  currentY: number;
  margin: number;
  pageWidth: number;
  currencySymbol: string;
  phpRate: number;
}

function drawMainStudentColumn({
  doc,
  answers,
  paymentDetails,
  startY,
  colX,
  colWidth,
  currencySymbol,
  phpRate,
}: {
  doc: jsPDF;
  answers: Answers;
  paymentDetails: FinancialCalculationResult;
  startY: number;
  colX: number;
  colWidth: number;
  currencySymbol: string;
  phpRate: number;
}) {
  let y = startY;

  y += drawRow(
    doc,
    y,
    getPaymentLabel(answers.paymentType),
    paymentDetails.totalPaymentDueBeforeScholarship,
    colX,
    colWidth,
    currencySymbol,
    phpRate,
    true,
  );

  const scholarshipDeduction = computeScholarshipDeduction(answers, paymentDetails);
  if (scholarshipDeduction > 0) {
    y += drawRow(
      doc,
      y,
      'Scholarship Deduction',
      -scholarshipDeduction,
      colX,
      colWidth,
      currencySymbol,
      phpRate,
      true,
      true,
    );
  }

  if (answers.applicationFeeWaived !== 'true' && paymentDetails.schoolApplicationFee > 0) {
    y += drawRow(doc, y, 'School Application Fee', paymentDetails.schoolApplicationFee, colX, colWidth, currencySymbol, phpRate, true);
  }
  if (paymentDetails.insuranceCost > 0) {
    y += drawRow(doc, y, 'Insurance', paymentDetails.insuranceCost, colX, colWidth, currencySymbol, phpRate, true);
  }
  if (paymentDetails.englishTestFee > 0) {
    y += drawRow(doc, y, 'English Test Fee', paymentDetails.englishTestFee, colX, colWidth, currencySymbol, phpRate, true);
  }
  if (paymentDetails.visaFee > 0) {
    y += drawRow(doc, y, 'Student Visa Fee', paymentDetails.visaFee, colX, colWidth, currencySymbol, phpRate, true);
  }
  if (paymentDetails.medicalExaminationFee > 0) {
    const subLabel = answers.requiredTBTest === 'true' ? '(with TB Test)' : undefined;
    y += drawRow(
      doc,
      y,
      'Medical Exam Fee',
      paymentDetails.medicalExaminationFee,
      colX,
      colWidth,
      currencySymbol,
      phpRate,
      true,
      false,
      false,
      undefined,
      subLabel,
    );
  }
  if (paymentDetails.biometricsFee > 0) {
    y += drawRow(doc, y, 'Biometrics Fee', paymentDetails.biometricsFee, colX, colWidth, currencySymbol, phpRate, true);
  }

  y += 2;
  doc.setDrawColor(220, 220, 220);
  doc.line(colX, y, colX + colWidth, y);
  y += 4;

  y += drawRow(doc, y, 'Total Cashout', paymentDetails.totalCashout, colX, colWidth, currencySymbol, phpRate, true, false, true);

  if (answers.paymentType === 'tuition_fee_deposit_only' && paymentDetails.remainingBalanceToPay > 0) {
    y += 4;
    const remainingBalanceLabel = `Remaining balance to be paid in ${answers.studyDestination || ''}`;
    y += drawRow(
      doc,
      y,
      remainingBalanceLabel,
      paymentDetails.remainingBalanceToPay,
      colX,
      colWidth,
      currencySymbol,
      phpRate,
      true,
      false,
      false,
      'green',
    );
  }

  return y;
}

export function drawTwoColumnInitialExpenses({
  doc,
  answers,
  paymentDetails,
  currentY,
  margin,
  pageWidth,
  currencySymbol,
  phpRate,
}: DrawTwoColumnInitialExpensesParams) {
  const columnGap = 10;
  const colWidth = (pageWidth - (margin * 2) - columnGap) / 2;
  const col1X = margin;
  const col2X = margin + colWidth + columnGap;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(80, 80, 80);
  doc.text('Main Student', col1X, currentY);
  doc.text('Additional Fees', col2X, currentY);

  currentY += 3.5;
  doc.setDrawColor(220, 220, 220);
  doc.line(col1X, currentY, col1X + colWidth, currentY);
  doc.line(col2X, currentY, col2X + colWidth, currentY);
  currentY += 4;

  const col1Y = drawMainStudentColumn({
    doc,
    answers,
    paymentDetails,
    startY: currentY,
    colX: col1X,
    colWidth,
    currencySymbol,
    phpRate,
  });

  const col2Y = drawDependentColumn({
    doc,
    answers,
    paymentDetails,
    startY: currentY,
    colX: col2X,
    colWidth,
    currencySymbol,
    phpRate,
  });

  return Math.max(col1Y, col2Y);
}
