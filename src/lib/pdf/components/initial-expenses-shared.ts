import jsPDF from 'jspdf';
import type { Answers } from '@/lib/pdf/types/pdf-types';
import type { FinancialCalculationResult } from '@/services/financials/common';

export const PAYMENT_TYPE_LABELS: Record<string, string> = {
  '3_months': '1st Payment Fee',
  '1_semester': '1st Semester Fee',
  '1_year': '1st Year School Fee',
  tuition_fee_deposit_only: 'Deposit Amount',
  manual: 'Tuition Fee',
};

export function getPaymentLabel(paymentType: string | undefined) {
  return PAYMENT_TYPE_LABELS[paymentType || ''] || '1st Payment Fee';
}

export function formatCurrency(value: number | undefined, symbol: string) {
  if (value === undefined) return 'N/A';
  const formattedValue = Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const prefix = value < 0 ? '- ' : '';
  return `${prefix}${symbol}${formattedValue}`;
}

export function formatPhp(value: number | undefined) {
  if (value === undefined) return '';
  const formattedValue = Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const prefix = value < 0 ? '- ' : '';
  return `(${prefix}PHP ${formattedValue})`;
}

export function drawRow(
  doc: jsPDF,
  y: number,
  label: string,
  value: number | undefined,
  startX: number,
  columnWidth: number,
  currencySymbol: string,
  phpRate: number,
  isBold = false,
  isRed = false,
  isTotal = false,
  labelColor?: string,
  subLabel?: string,
) {
  const valueColumnX = startX + columnWidth;
  const labelY = y;

  doc.setFontSize(8);
  doc.setFont('helvetica', isBold ? 'bold' : 'normal');

  if (labelColor === 'green') {
    doc.setTextColor(34, 139, 34);
  } else {
    doc.setTextColor(isRed ? 220 : 0, isRed ? 20 : 64, isRed ? 60 : 151);
  }
  doc.text(label, startX, labelY, { baseline: 'middle' });

  if (subLabel) {
    doc.setFontSize(6);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text(subLabel, startX, labelY + 3, { baseline: 'middle' });
  }

  doc.setFontSize(isTotal ? 11 : 9);
  doc.setFont('helvetica', 'bold');
  if (isTotal) {
    doc.setTextColor(0, 64, 151);
  } else if (isRed) {
    doc.setTextColor(220, 20, 60);
  } else {
    doc.setTextColor(80, 80, 80);
  }
  doc.text(formatCurrency(value, currencySymbol), valueColumnX, y, { align: 'right', baseline: 'middle' });

  doc.setFontSize(isTotal ? 8 : 7);
  doc.setFont('helvetica', 'normal');
  if (isTotal) {
    doc.setTextColor(0, 64, 151);
  } else if (isRed) {
    doc.setTextColor(220, 20, 60);
  } else {
    doc.setTextColor(80, 80, 80);
  }
  doc.text(formatPhp(value !== undefined ? value * phpRate : undefined), valueColumnX, y + (isTotal ? 4 : 3.5), {
    align: 'right',
    baseline: 'middle',
  });

  let rowHeight = isTotal ? 10 : 8;
  if (subLabel) {
    rowHeight += 2;
  }
  return rowHeight;
}

export function getProgramDuration(value: string | number | null | undefined, returnOneForZero = false): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const match = value.match(/(\d+(?:\.\d+)?)/);
    if (match) {
      const num = parseFloat(match[1]);
      if (!Number.isNaN(num)) {
        if (returnOneForZero && num === 0) return 1;
        return num;
      }
    }
  }
  return returnOneForZero ? 1 : 0;
}

export function computeScholarshipDeduction(
  answers: Answers,
  paymentDetails: FinancialCalculationResult,
) {
  const isInitialPaymentType =
    answers.scholarshipType === 'upfront' || answers.scholarshipType === 'first_year_only';
  if (!isInitialPaymentType || paymentDetails.scholarshipAmount <= 0) {
    return 0;
  }
  return Math.max(0, paymentDetails.totalPaymentDueBeforeScholarship - paymentDetails.totalPaymentDue);
}
