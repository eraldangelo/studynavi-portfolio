
import type { Answers } from '@/lib/core/types';

export interface FinancialCalculationResult {
    totalCourseFeeBeforeScholarship: number;
    totalCourseFeeAfterScholarship: number;
    scholarshipAmount: number;
    totalPaymentDue: number;
    totalPaymentDueBeforeScholarship: number;
    insuranceCost: number;
    englishTestFee: number;
    visaFee: number;
    medicalExaminationFee: number;
    biometricsFee: number;
    protectionOfEnrolledLearnersFee: number;
    totalCashout: number;
    remainingBalanceToPay: number;
    dependentMedicalExamFee: number;
    dependentVisaFee: number; // Under 18 / Visitor
    dependentStudyPermitFee: number;
    dependentVisaFeeOver18: number; // 18 and over / Spouse
    dependentBiometricsFee: number;
    agencyAssistanceFee: number;
    dependentVisaFeeSchoolAge: number;
    dependentVisaFeeNonSchoolAge: number;
    schoolApplicationFee: number;
    medical0to4Fee?: number;
    medical5to10Fee?: number;
    medical11to14Fee?: number;
    medical15plusFee?: number;
}
  
export interface FinancialDocumentCalculationResult {
    oneYearTuitionFee: number;
    costOfLiving: number;
    partnerCostOfLiving: number;
    dependentCostOfLiving: number;
    nzSchoolAgeCost: number;
    nzNonSchoolAgeCost: number;
    airfare: number;
    totalFunds: number;
}
  
export function getNumber(value: string | number | null | undefined, returnOneForZero = false): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const num = parseFloat(value.replace(/[^\d.]/g, ''));
        if (!isNaN(num)) {
            if (returnOneForZero && num === 0) return 1;
            return num;
        }
    }
    if (returnOneForZero) return 1;
    return 0;
}

export function getProgramDuration(value: string | number | null | undefined): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const match = value.match(/(\d+(?:\.\d+)?)/);
        if (match) {
        const num = parseFloat(match[1]);
        return isNaN(num) ? 1 : num;
        }
    }
    return 1;
}

export function calculateBaseScholarship(answers: Answers, annualTuitionFee: number) {
    const programDuration = getNumber(answers.programDuration, true);
    const scholarshipPercentage = getNumber(answers.scholarshipPercentage);
    const scholarshipPercentageCapped = Math.min(99, Math.max(0, scholarshipPercentage));
    const scholarshipAmountRaw = getNumber(answers.scholarshipAmount);
    const scholarshipType = answers.scholarshipType;
    const hasScholarship = scholarshipPercentage > 0 || scholarshipAmountRaw > 0;
    const scholarshipInputType = scholarshipPercentage > 0 ? 'percentage' : 'amount';
    const isFirstYearOnly = scholarshipType === 'first_year_only';
    const appliesOnInitialPayment = scholarshipType === 'upfront' || isFirstYearOnly;

    const totalCourseFeeBeforeScholarship = annualTuitionFee * programDuration;
    const annualScholarshipRaw = hasScholarship
        ? scholarshipInputType === 'percentage'
            ? annualTuitionFee * (scholarshipPercentageCapped / 100)
            : scholarshipAmountRaw
        : 0;
    const annualScholarshipAmount = Math.min(annualTuitionFee, Math.max(0, annualScholarshipRaw));
    
    const scholarshipAmountRawTotal = hasScholarship
        ? isFirstYearOnly
            ? annualScholarshipAmount
            : annualScholarshipAmount * programDuration
        : 0;
    const scholarshipAmount = Math.min(totalCourseFeeBeforeScholarship, Math.max(0, scholarshipAmountRawTotal));

    const totalCourseFeeAfterScholarship = Math.max(0, totalCourseFeeBeforeScholarship - scholarshipAmount);

    let upfrontScholarshipOnInitialPayment = 0;
    if (appliesOnInitialPayment) {
        const paymentPeriodsPerYear = answers.paymentType === '1_semester' ? 2 : answers.paymentType === '3_months' ? 4 : 1;
        upfrontScholarshipOnInitialPayment = annualScholarshipAmount / paymentPeriodsPerYear;
    }

    return {
        totalCourseFeeBeforeScholarship,
        totalCourseFeeAfterScholarship,
        scholarshipAmount,
        annualScholarshipAmount,
        appliesOnInitialPayment,
        upfrontScholarshipOnInitialPayment,
    };
}

export function calculatePaymentDue(answers: Answers, baseAnnualFee: number, scholarshipApplied: number) {
    const tuitionFeeDeposit = getNumber(answers.tuitionFeeDeposit);
    const manualPayment = getNumber(answers.manualPayment);

    let due = 0;
    if (answers.paymentType === '3_months') {
        due = baseAnnualFee / 4;
    } else if (answers.paymentType === '1_semester') {
        due = baseAnnualFee / 2;
    } else if (answers.paymentType === '1_year') {
        due = baseAnnualFee;
    } else if (answers.paymentType === 'tuition_fee_deposit_only') {
        due = tuitionFeeDeposit;
    } else if (answers.paymentType === 'manual') {
        due = manualPayment;
    }
    if (answers.paymentType === 'tuition_fee_deposit_only' || answers.paymentType === 'manual') {
        return Math.max(0, due);
    }

    return Math.max(0, due - scholarshipApplied);
}
