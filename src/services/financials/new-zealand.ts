
import type { Answers } from '@/lib/core/types';
import type { ExchangeRates } from '../exchange-rate-service';
import { getNumber, getProgramDuration, calculateBaseScholarship, calculatePaymentDue, FinancialCalculationResult, FinancialDocumentCalculationResult } from './common';
import { getNewZealandFeesRuntime } from '@/services/fees/new-zealand-fees-runtime';

function _calculateNewZealandInsurance(answers: Answers, fees: ReturnType<typeof getNewZealandFeesRuntime>): number {
    const durationKey = getProgramDuration(answers.programDuration).toString() as keyof typeof fees.insuranceSingleNZD;
    const visaAssistance = answers.visaAssistance || 'No';
    const hasSpouseOrPartner = visaAssistance === 'Spouse/De Facto' || visaAssistance === 'Spouse/De Facto and Child/ren';
    
    return hasSpouseOrPartner ? (fees.insuranceCoupleNZD[durationKey] || 0) : (fees.insuranceSingleNZD[durationKey] || 0);
}

export function calculateNewZealandFinancials(answers: Answers, exchangeRates: ExchangeRates, feesDoc?: any): FinancialCalculationResult {
    const phpRate = exchangeRates['PHP'] ? exchangeRates['PHP'] / exchangeRates['NZD'] : 36;
    const annualTuitionFee = getNumber(answers.annualTuitionFee);
    const fees = getNewZealandFeesRuntime(feesDoc);

    const {
        totalCourseFeeBeforeScholarship,
        totalCourseFeeAfterScholarship,
        scholarshipAmount,
        upfrontScholarshipOnInitialPayment,
    } = calculateBaseScholarship(answers, annualTuitionFee);

    const paymentDueWithScholarship = calculatePaymentDue(answers, annualTuitionFee, upfrontScholarshipOnInitialPayment);
    const paymentDueBeforeScholarship = calculatePaymentDue(answers, annualTuitionFee, 0);

    const insuranceCost = _calculateNewZealandInsurance(answers, fees);
    const englishTestFee = (answers.ieltsPreparation !== 'Yes' && answers.englishTestRequired === 'true' && answers.highestEducation !== 'International Baccalaureate / GCE A-Levels') ? (fees.englishTestFeePHP / phpRate) : 0;
    
    let visaFee = fees.visaStudentNZD;
    if (answers.programCategory === 'Pathway Student') visaFee = fees.visaPathwayStudentNZD;
    
    const medicalExaminationFee = fees.medicalExamFeePHP / phpRate;

    let dependentMedicalExamFee = 0, dependentVisaFeeSchoolAge = 0, dependentVisaFeeNonSchoolAge = 0, agencyAssistanceFee = 0, dependentVisaFeeOver18 = 0;
    const hasDependents = answers.visaAssistance && answers.visaAssistance !== 'No';
    const hasSpouse = answers.visaAssistance === 'Spouse/De Facto' || answers.visaAssistance === 'Spouse/De Facto and Child/ren';
    const numChildren = getNumber(answers.numberOfChildren, false);
    const dependentCount = (hasSpouse ? 1 : 0) + numChildren;
    if (hasDependents && dependentCount > 0) {
        dependentMedicalExamFee = (fees.dependentMedicalExamFeePHP * dependentCount) / phpRate;
        const assistanceFeePHP = answers.isSubsequentEntry === 'true' ? fees.assistancePerDependentSubsequentEntryPHP : fees.assistancePerDependentPHP;
        agencyAssistanceFee = (assistanceFeePHP * dependentCount) / phpRate;
        dependentVisaFeeOver18 = hasSpouse ? fees.dependentVisaSpouse18PlusNZD : 0;
        const schoolAgeCount = getNumber(answers.numberOfSchoolAgeChildren);
        const nonSchoolAgeCount = getNumber(answers.numberOfNonSchoolAgeChildren);
        if (schoolAgeCount > 0) dependentVisaFeeSchoolAge = schoolAgeCount * fees.dependentVisaChildSchoolAgeNZD;
        if (nonSchoolAgeCount > 0) dependentVisaFeeNonSchoolAge = nonSchoolAgeCount * fees.dependentVisaChildNonSchoolAgeNZD;
        if (schoolAgeCount === 0 && nonSchoolAgeCount === 0 && numChildren > 0) dependentVisaFeeSchoolAge = numChildren * fees.dependentVisaChildSchoolAgeNZD;
    }

    const totalCashout = paymentDueWithScholarship + insuranceCost + englishTestFee + visaFee + medicalExaminationFee + dependentMedicalExamFee + dependentVisaFeeOver18 + agencyAssistanceFee + dependentVisaFeeSchoolAge + dependentVisaFeeNonSchoolAge;

    return {
        totalCourseFeeBeforeScholarship, totalCourseFeeAfterScholarship, scholarshipAmount,
        totalPaymentDue: paymentDueWithScholarship, totalPaymentDueBeforeScholarship: paymentDueBeforeScholarship, insuranceCost,
        englishTestFee, visaFee, medicalExaminationFee,
        biometricsFee: 0, protectionOfEnrolledLearnersFee: 0, totalCashout, remainingBalanceToPay: 0,
        dependentMedicalExamFee, dependentVisaFeeOver18,
        agencyAssistanceFee, dependentVisaFeeSchoolAge,
        dependentVisaFeeNonSchoolAge, dependentVisaFee: 0, dependentBiometricsFee: 0, schoolApplicationFee: 0,
        dependentStudyPermitFee: 0,
    };
}

export function calculateNewZealandFinancialDocuments(answers: Answers, exchangeRates: ExchangeRates, feesDoc?: any): FinancialDocumentCalculationResult {
    const fees = getNewZealandFeesRuntime(feesDoc);
    
    let livingCostDuration = getProgramDuration(answers.programDuration);
    if (answers.financialEvidenceFor1YearOnly === 'true') {
        livingCostDuration = 1;
    } else if (answers.financialEvidenceFor2YearsOnly === 'true') {
        livingCostDuration = 2;
    }

    const costOfLivingPerYear = fees.evidenceStudentPerYearNZD;
    const costOfLiving = costOfLivingPerYear * livingCostDuration;

    const hasDependents = answers.visaAssistance && answers.visaAssistance !== 'No';
    const hasSpouseOrPartner = hasDependents && ['Spouse/De Facto', 'Spouse/De Facto and Child/ren'].includes(answers.visaAssistance || '');
    const numChildren = hasDependents ? getNumber(answers.numberOfChildren) : 0;

    const partnerCostOfLiving = hasSpouseOrPartner ? fees.evidencePartnerPerYearNZD * livingCostDuration : 0;

    let nzSchoolAgeCost = 0, nzNonSchoolAgeCost = 0;
    if (numChildren > 0) {
        const schoolAgeCount = getNumber(answers.numberOfSchoolAgeChildren);
        const nonSchoolAgeCount = getNumber(answers.numberOfNonSchoolAgeChildren);
        const schoolAgeCostPerYear = fees.evidenceChildSchoolAgePerYearNZD, nonSchoolAgeCostPerYear = fees.evidenceChildNonSchoolAgePerYearNZD;
        
        if (schoolAgeCount > 0) nzSchoolAgeCost = schoolAgeCount * schoolAgeCostPerYear * livingCostDuration;
        if (nonSchoolAgeCount > 0) nzNonSchoolAgeCost = nonSchoolAgeCount * nonSchoolAgeCostPerYear * livingCostDuration;
        if (schoolAgeCount === 0 && nonSchoolAgeCount === 0) {
            // Default to school age cost if categories are not specified
            nzSchoolAgeCost = numChildren * schoolAgeCostPerYear * livingCostDuration;
        }
    }
    
    const airfarePerPerson = fees.airfarePerPersonNZD;
    const numberOfPeopleForAirfare = 1 + (hasSpouseOrPartner ? 1 : 0) + numChildren;
    const airfare = airfarePerPerson * numberOfPeopleForAirfare;

    const totalFunds = costOfLiving + partnerCostOfLiving + nzSchoolAgeCost + nzNonSchoolAgeCost + airfare;

    return {
        oneYearTuitionFee: 0, costOfLiving, partnerCostOfLiving,
        dependentCostOfLiving: 0, nzSchoolAgeCost, nzNonSchoolAgeCost,
        airfare, totalFunds,
    };
}
