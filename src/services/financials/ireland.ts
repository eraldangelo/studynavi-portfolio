
import type { Answers } from '@/lib/core/types';
import type { ExchangeRates } from '../exchange-rate-service';
import { DESTINATION_CONFIG } from '@/lib/destination-config';
import { getNumber, getProgramDuration, calculateBaseScholarship, calculatePaymentDue, FinancialCalculationResult, FinancialDocumentCalculationResult } from './common';
import { getIrelandFeesRuntime } from '@/services/fees/ireland-fees-runtime';

export function calculateIrelandFinancials(answers: Answers, exchangeRates: ExchangeRates, feesDoc?: any): FinancialCalculationResult {
    const config = DESTINATION_CONFIG['Ireland'];
    const phpRate = exchangeRates['PHP'] ? exchangeRates['PHP'] / exchangeRates['EUR'] : 63;
    const usdRate = exchangeRates['USD'] ? exchangeRates['USD'] / exchangeRates['EUR'] : 0.92;
    const annualTuitionFee = getNumber(answers.annualTuitionFee);
    const fees = getIrelandFeesRuntime(feesDoc);

    const {
        totalCourseFeeBeforeScholarship,
        totalCourseFeeAfterScholarship,
        scholarshipAmount,
        upfrontScholarshipOnInitialPayment,
    } = calculateBaseScholarship(answers, annualTuitionFee);

    const paymentDueWithScholarship = calculatePaymentDue(answers, annualTuitionFee, upfrontScholarshipOnInitialPayment);
    const paymentDueBeforeScholarship = calculatePaymentDue(answers, annualTuitionFee, 0);
    
    const insuranceCost = fees.studentInsurancePerYearEUR;
    
    let englishTestFee = 0;
    if (answers.ieltsPreparation !== 'Yes' && answers.englishTestRequired === 'true') {
        if (answers.isIELTSSelected === 'true') {
            englishTestFee = fees.ieltsFeePHP / phpRate;
        } else {
            englishTestFee = fees.duolingoFeeUSD * usdRate; // Duolingo fee converted to EUR
        }
    }
    
    const visaFee = answers.isMultipleEntryVisa === 'true' ? fees.visaFeeMultipleEntryEUR : fees.visaFeeSingleEntryEUR;
    const protectionOfEnrolledLearnersFee = fees.pelFeeEUR;

    const totalCashout = paymentDueWithScholarship + insuranceCost + englishTestFee + visaFee + protectionOfEnrolledLearnersFee;

    return {
        totalCourseFeeBeforeScholarship, totalCourseFeeAfterScholarship, scholarshipAmount,
        totalPaymentDue: paymentDueWithScholarship, totalPaymentDueBeforeScholarship: paymentDueBeforeScholarship, insuranceCost,
        englishTestFee, visaFee, protectionOfEnrolledLearnersFee,
        totalCashout,
        medicalExaminationFee: 0, biometricsFee: 0, remainingBalanceToPay: 0, dependentMedicalExamFee: 0,
        dependentVisaFee: 0, dependentVisaFeeOver18: 0, dependentBiometricsFee: 0, agencyAssistanceFee: 0,
        dependentVisaFeeSchoolAge: 0, dependentVisaFeeNonSchoolAge: 0, schoolApplicationFee: 0,
        dependentStudyPermitFee: 0
    };
}

export function calculateIrelandFinancialDocuments(_answers: Answers, exchangeRates: ExchangeRates, feesDoc?: any): FinancialDocumentCalculationResult {
    const fees = getIrelandFeesRuntime(feesDoc);
    const costOfLiving = fees.evidenceOfFundsCostOfLivingEUR;

    return {
        oneYearTuitionFee: 0,
        costOfLiving,
        partnerCostOfLiving: 0,
        dependentCostOfLiving: 0,
        nzSchoolAgeCost: 0,
        nzNonSchoolAgeCost: 0,
        airfare: 0,
        totalFunds: costOfLiving,
    };
}
