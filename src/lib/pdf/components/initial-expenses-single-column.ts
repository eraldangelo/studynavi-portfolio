import jsPDF from 'jspdf';
import type { Answers } from '@/lib/pdf/types/pdf-types';
import type { FinancialCalculationResult } from '@/services/financials/common';
import { drawRow, getPaymentLabel, computeScholarshipDeduction } from '@/lib/pdf/components/initial-expenses-shared';

interface DrawSingleColumnInitialExpensesParams {
  doc: jsPDF;
  answers: Answers;
  paymentDetails: FinancialCalculationResult;
  currentY: number;
  margin: number;
  pageWidth: number;
  currencySymbol: string;
  phpRate: number;
}

export function drawSingleColumnInitialExpenses({
  doc,
  answers,
  paymentDetails,
  currentY,
  margin,
  pageWidth,
  currencySymbol,
  phpRate,
}: DrawSingleColumnInitialExpensesParams) {
  const colWidth = pageWidth - (margin * 2);
  const colX = margin;

  currentY += drawRow(
    doc,
    currentY,
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
    currentY += drawRow(
      doc,
      currentY,
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
    currentY += drawRow(doc, currentY, 'School Application Fee', paymentDetails.schoolApplicationFee, colX, colWidth, currencySymbol, phpRate, true);
  }
  if (paymentDetails.insuranceCost > 0) {
    currentY += drawRow(doc, currentY, 'Insurance', paymentDetails.insuranceCost, colX, colWidth, currencySymbol, phpRate, true);
  }
  if (paymentDetails.englishTestFee > 0) {
    currentY += drawRow(doc, currentY, 'English Test Fee', paymentDetails.englishTestFee, colX, colWidth, currencySymbol, phpRate, true);
  }
  if (paymentDetails.visaFee > 0) {
    currentY += drawRow(doc, currentY, 'Student Visa Fee', paymentDetails.visaFee, colX, colWidth, currencySymbol, phpRate, true);
  }
  if (paymentDetails.medicalExaminationFee > 0) {
    const subLabel = answers.requiredTBTest === 'true' ? '(with TB Test)' : undefined;
    currentY += drawRow(
      doc,
      currentY,
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
    currentY += drawRow(doc, currentY, 'Biometrics Fee', paymentDetails.biometricsFee, colX, colWidth, currencySymbol, phpRate, true);
  }

  currentY += 2;
  doc.setDrawColor(220, 220, 220);
  doc.line(colX, currentY, colX + colWidth, currentY);
  currentY += 4;

  currentY += drawRow(doc, currentY, 'Total Cashout', paymentDetails.totalCashout, colX, colWidth, currencySymbol, phpRate, true, false, true);

  if (answers.paymentType === 'tuition_fee_deposit_only' && paymentDetails.remainingBalanceToPay > 0) {
    currentY += 4;
    const remainingBalanceLabel = `Remaining balance to be paid in ${answers.studyDestination || ''}`;
    currentY += drawRow(
      doc,
      currentY,
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

  return currentY;
}
