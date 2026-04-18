import jsPDF from 'jspdf';
import type { Answers } from '@/lib/pdf/types/pdf-types';
import type { FinancialCalculationResult } from '@/services/financials/common';
import { drawRow } from '@/lib/pdf/components/initial-expenses-shared';

interface DrawDependentColumnParams {
  doc: jsPDF;
  answers: Answers;
  paymentDetails: FinancialCalculationResult;
  startY: number;
  colX: number;
  colWidth: number;
  currencySymbol: string;
  phpRate: number;
}

export function drawDependentColumn({
  doc,
  answers,
  paymentDetails,
  startY,
  colX,
  colWidth,
  currencySymbol,
  phpRate,
}: DrawDependentColumnParams) {
  let y = startY;
  let totalDependentFees = 0;

  switch (answers.studyDestination) {
    case 'Australia':
      if (paymentDetails.dependentMedicalExamFee > 0) {
        y += drawRow(doc, y, 'Dependent Medical', paymentDetails.dependentMedicalExamFee, colX, colWidth, currencySymbol, phpRate, true);
        totalDependentFees += paymentDetails.dependentMedicalExamFee;
      }
      if (paymentDetails.dependentVisaFeeOver18 > 0) {
        y += drawRow(doc, y, 'Dependent Visa', paymentDetails.dependentVisaFeeOver18, colX, colWidth, currencySymbol, phpRate, true, false, false, undefined, '(18 and over)');
        totalDependentFees += paymentDetails.dependentVisaFeeOver18;
      }
      if (paymentDetails.dependentVisaFee > 0) {
        y += drawRow(doc, y, 'Dependent Visa', paymentDetails.dependentVisaFee, colX, colWidth, currencySymbol, phpRate, true, false, false, undefined, '(Under 18)');
        totalDependentFees += paymentDetails.dependentVisaFee;
      }
      if (paymentDetails.dependentBiometricsFee > 0) {
        y += drawRow(doc, y, 'Dependent Biometrics', paymentDetails.dependentBiometricsFee, colX, colWidth, currencySymbol, phpRate, true);
        totalDependentFees += paymentDetails.dependentBiometricsFee;
      }
      if (paymentDetails.agencyAssistanceFee > 0) {
        y += drawRow(doc, y, 'Agency Assistance Fee', paymentDetails.agencyAssistanceFee, colX, colWidth, currencySymbol, phpRate, true);
        totalDependentFees += paymentDetails.agencyAssistanceFee;
      }
      break;

    case 'New Zealand':
      if (paymentDetails.dependentMedicalExamFee > 0) {
        y += drawRow(doc, y, 'Dependent Medical', paymentDetails.dependentMedicalExamFee, colX, colWidth, currencySymbol, phpRate, true);
        totalDependentFees += paymentDetails.dependentMedicalExamFee;
      }
      if (paymentDetails.dependentVisaFeeOver18 > 0) {
        y += drawRow(doc, y, 'Dependent Visa', paymentDetails.dependentVisaFeeOver18, colX, colWidth, currencySymbol, phpRate, true, false, false, undefined, '(Spouse)');
        totalDependentFees += paymentDetails.dependentVisaFeeOver18;
      }
      if (paymentDetails.dependentVisaFeeSchoolAge > 0) {
        y += drawRow(doc, y, 'Dependent Visa', paymentDetails.dependentVisaFeeSchoolAge, colX, colWidth, currencySymbol, phpRate, true, false, false, undefined, '(School Age)');
        totalDependentFees += paymentDetails.dependentVisaFeeSchoolAge;
      }
      if (paymentDetails.dependentVisaFeeNonSchoolAge > 0) {
        y += drawRow(doc, y, 'Dependent Visa', paymentDetails.dependentVisaFeeNonSchoolAge, colX, colWidth, currencySymbol, phpRate, true, false, false, undefined, '(Non-School Age)');
        totalDependentFees += paymentDetails.dependentVisaFeeNonSchoolAge;
      }
      if (paymentDetails.agencyAssistanceFee > 0) {
        y += drawRow(doc, y, 'Agency Assistance Fee', paymentDetails.agencyAssistanceFee, colX, colWidth, currencySymbol, phpRate, true);
        totalDependentFees += paymentDetails.agencyAssistanceFee;
      }
      break;

    case 'Canada':
      if (paymentDetails.dependentVisaFeeOver18 > 0) {
        y += drawRow(doc, y, 'Dependent Visa', paymentDetails.dependentVisaFeeOver18, colX, colWidth, currencySymbol, phpRate, true, false, false, undefined, '(Spouse w/ OWP)');
        totalDependentFees += paymentDetails.dependentVisaFeeOver18;
      }
      if (paymentDetails.dependentStudyPermitFee > 0) {
        y += drawRow(doc, y, 'Dependent Visa', paymentDetails.dependentStudyPermitFee, colX, colWidth, currencySymbol, phpRate, true, false, false, undefined, '(Study Permit)');
        totalDependentFees += paymentDetails.dependentStudyPermitFee;
      }
      if (paymentDetails.dependentVisaFee > 0) {
        y += drawRow(doc, y, 'Dependent Visa', paymentDetails.dependentVisaFee, colX, colWidth, currencySymbol, phpRate, true, false, false, undefined, '(Visitor)');
        totalDependentFees += paymentDetails.dependentVisaFee;
      }
      if (paymentDetails.medical0to4Fee && paymentDetails.medical0to4Fee > 0) {
        y += drawRow(doc, y, 'Medical', paymentDetails.medical0to4Fee, colX, colWidth, currencySymbol, phpRate, true, false, false, undefined, '(0-4 years old)');
        totalDependentFees += paymentDetails.medical0to4Fee;
      }
      if (paymentDetails.medical5to10Fee && paymentDetails.medical5to10Fee > 0) {
        y += drawRow(doc, y, 'Medical', paymentDetails.medical5to10Fee, colX, colWidth, currencySymbol, phpRate, true, false, false, undefined, '(5-10 years old)');
        totalDependentFees += paymentDetails.medical5to10Fee;
      }
      if (paymentDetails.medical11to14Fee && paymentDetails.medical11to14Fee > 0) {
        y += drawRow(doc, y, 'Medical', paymentDetails.medical11to14Fee, colX, colWidth, currencySymbol, phpRate, true, false, false, undefined, '(11-14 years old)');
        totalDependentFees += paymentDetails.medical11to14Fee;
      }
      if (paymentDetails.medical15plusFee && paymentDetails.medical15plusFee > 0) {
        y += drawRow(doc, y, 'Medical', paymentDetails.medical15plusFee, colX, colWidth, currencySymbol, phpRate, true, false, false, undefined, '(15+ years old)');
        totalDependentFees += paymentDetails.medical15plusFee;
      }
      if (paymentDetails.dependentMedicalExamFee > 0) {
        y += drawRow(doc, y, 'Medical', paymentDetails.dependentMedicalExamFee, colX, colWidth, currencySymbol, phpRate, true, false, false, undefined, '(Spouse)');
        totalDependentFees += paymentDetails.dependentMedicalExamFee;
      }
      if (paymentDetails.agencyAssistanceFee > 0) {
        y += drawRow(doc, y, 'Agency Assistance Fee', paymentDetails.agencyAssistanceFee, colX, colWidth, currencySymbol, phpRate, true);
        totalDependentFees += paymentDetails.agencyAssistanceFee;
      }
      break;

    default:
      break;
  }

  if (totalDependentFees > 0) {
    y += 2;
    doc.setDrawColor(220, 220, 220);
    doc.line(colX, y, colX + colWidth, y);
    y += 4;
    y += drawRow(doc, y, 'Total Additional Fees', totalDependentFees, colX, colWidth, currencySymbol, phpRate, true, false, true);
  }

  return y;
}
