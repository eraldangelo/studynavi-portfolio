
import type { Answers } from '@/lib/core/types';
import type { ExchangeRates } from '../exchange-rate-service';
import { getNumber, getProgramDuration, calculateBaseScholarship, calculatePaymentDue, FinancialCalculationResult, FinancialDocumentCalculationResult } from './common';
import { getAustraliaFeesRuntime } from '@/services/fees/australia-fees-runtime';

function _calculateAustraliaInsurance(answers: Answers, fees: ReturnType<typeof getAustraliaFeesRuntime>): number {
    const durationKey = getProgramDuration(answers.programDuration).toString();
    const visaAssistance = answers.visaAssistance || 'No';
    const hasSpouseOrPartner = visaAssistance === 'Spouse/De Facto' || visaAssistance === 'Spouse/De Facto and Child/ren';
    const hasChildren = visaAssistance === 'Child/ren' || visaAssistance === 'Spouse/De Facto and Child/ren';
    const numChildren = getNumber(answers.numberOfChildren);

    if (hasSpouseOrPartner && hasChildren && numChildren > 0) return (fees.insuranceCostsFamilyAUD as any)[durationKey] || 0;
    if (hasSpouseOrPartner) return (fees.insuranceCostsCoupleAUD as any)[durationKey] || 0;
    if (hasChildren && numChildren > 0) return (fees.insuranceCostsSingleParentWithChildrenAUD as any)[durationKey] || 0;
    return (fees.insuranceCostsAloneAUD as any)[durationKey] || 0;
}

export function calculateAustraliaFinancials(answers: Answers, exchangeRates: ExchangeRates, feesDoc?: any): FinancialCalculationResult {
    const fees = getAustraliaFeesRuntime(feesDoc);
    const phpRate = exchangeRates['PHP'] ? exchangeRates['PHP'] / exchangeRates['AUD'] : 38.5;
    const annualTuitionFee = getNumber(answers.annualTuitionFee);

    const {
        totalCourseFeeBeforeScholarship,
        totalCourseFeeAfterScholarship,
        scholarshipAmount,
        annualScholarshipAmount,
        appliesOnInitialPayment,
        upfrontScholarshipOnInitialPayment,
    } = calculateBaseScholarship(answers, annualTuitionFee);

    const paymentDueWithScholarship = calculatePaymentDue(answers, annualTuitionFee, upfrontScholarshipOnInitialPayment);
    const paymentDueBeforeScholarship = calculatePaymentDue(answers, annualTuitionFee, 0);
    
    const annualTuitionFeeAfterUpfrontScholarship = annualTuitionFee - (appliesOnInitialPayment ? annualScholarshipAmount : 0);
    const paymentPerSemesterWithScholarship = annualTuitionFeeAfterUpfrontScholarship / 2;
    const remainingBalanceToPay = answers.paymentType === 'tuition_fee_deposit_only'
        ? Math.max(0, paymentPerSemesterWithScholarship - paymentDueWithScholarship)
        : 0;
    
    const insuranceCost = _calculateAustraliaInsurance(answers, fees);
    const englishTestFee = (answers.ieltsPreparation !== 'Yes' && answers.englishTestRequired === 'true' && answers.highestEducation !== 'International Baccalaureate / GCE A-Levels') ? (fees.englishTestFeePHP / phpRate) : 0;
    const visaFee = fees.studentVisaFeeAUD;
    const medicalExaminationFee = (answers.requiredTBTest === 'true' ? fees.medicalExamFeeWithTBPHP : fees.medicalExamFeePHP) / phpRate;
    const biometricsFee = fees.biometricsFeePHP / phpRate;
    
    const schoolApplicationFee = getNumber(answers.schoolApplicationFee);

    let dependentMedicalExamFee = 0, dependentVisaFee = 0, dependentVisaFeeOver18 = 0, dependentBiometricsFee = 0, agencyAssistanceFee = 0;
    const hasDependents = answers.visaAssistance && answers.visaAssistance !== 'No';
    const hasSpouse = answers.visaAssistance === 'Spouse/De Facto' || answers.visaAssistance === 'Spouse/De Facto and Child/ren';
    const numChildren = getNumber(answers.numberOfChildren, false);
    const dependentCount = (hasSpouse ? 1 : 0) + numChildren;
    if (hasDependents && dependentCount > 0) {
        dependentMedicalExamFee = (fees.dependentMedicalExamFeePHP * dependentCount) / phpRate;
        dependentBiometricsFee = (fees.dependentBiometricsFeePHP * dependentCount) / phpRate;
        const assistanceFeePHP = answers.isSubsequentEntry === 'true' ? fees.assistancePerDependentSubsequentEntryPHP : fees.assistancePerDependentPHP;
        agencyAssistanceFee = (assistanceFeePHP * dependentCount) / phpRate;
        dependentVisaFeeOver18 = hasSpouse ? fees.dependentVisaFeeSpouse18PlusAUD : 0;
        if (numChildren > 0) {
            dependentVisaFee = fees.dependentVisaFeeChildUnder18AUD * numChildren;
        }
    }

    const totalCashout = paymentDueWithScholarship + insuranceCost + englishTestFee + visaFee + medicalExaminationFee + biometricsFee + schoolApplicationFee + dependentMedicalExamFee + dependentVisaFee + dependentVisaFeeOver18 + dependentBiometricsFee + agencyAssistanceFee;

    return {
        totalCourseFeeBeforeScholarship, totalCourseFeeAfterScholarship, scholarshipAmount,
        totalPaymentDue: paymentDueWithScholarship, totalPaymentDueBeforeScholarship: paymentDueBeforeScholarship,
        insuranceCost: insuranceCost, englishTestFee: englishTestFee, visaFee: visaFee,
        medicalExaminationFee: medicalExaminationFee, biometricsFee: biometricsFee, protectionOfEnrolledLearnersFee: 0,
        totalCashout: totalCashout, remainingBalanceToPay,
        dependentMedicalExamFee: dependentMedicalExamFee, dependentVisaFee: dependentVisaFee, dependentVisaFeeOver18: dependentVisaFeeOver18,
        dependentBiometricsFee: dependentBiometricsFee, agencyAssistanceFee: agencyAssistanceFee,
        dependentVisaFeeSchoolAge: 0, dependentVisaFeeNonSchoolAge: 0, schoolApplicationFee,
        dependentStudyPermitFee: 0,
    };
}

export function calculateAustraliaFinancialDocuments(answers: Answers, exchangeRates: ExchangeRates, feesDoc?: any): FinancialDocumentCalculationResult {
    const fees = getAustraliaFeesRuntime(feesDoc);
    const annualTuitionFee = getNumber(answers.annualTuitionFee);
    const scholarshipAmountRaw = getNumber(answers.scholarshipAmount);
    const scholarshipPercentage = getNumber(answers.scholarshipPercentage);
    const scholarshipInputType = scholarshipPercentage > 0 ? 'percentage' : 'amount';

    const annualScholarshipAmount = scholarshipInputType === 'percentage'
      ? annualTuitionFee * (scholarshipPercentage / 100)
      : scholarshipAmountRaw;
    const annualTuitionFeeAfterScholarship = annualTuitionFee - annualScholarshipAmount;

    const paymentDue = calculatePaymentDue(answers, annualTuitionFeeAfterScholarship, 0);
    const oneYearTuitionFee = annualTuitionFeeAfterScholarship - paymentDue;
    
    const costOfLiving = fees.studentCostOfLivingAUD;
    const hasDependents = answers.visaAssistance && answers.visaAssistance !== 'No';
    const hasSpouseOrPartner = hasDependents && ['Spouse/De Facto', 'Spouse/De Facto and Child/ren'].includes(answers.visaAssistance || '');
    const numChildren = hasDependents ? getNumber(answers.numberOfChildren) : 0;

    const partnerCostOfLiving = hasSpouseOrPartner ? fees.partnerCostOfLivingAUD : 0;
    const dependentCostOfLiving = numChildren > 0 ? fees.costOfLivingPerChildAUD * numChildren : 0;
    
    const numberOfPeopleForAirfare = 1 + (hasSpouseOrPartner ? 1 : 0) + numChildren;
    const airfare = fees.airfarePerPersonAUD * numberOfPeopleForAirfare;

    const totalFunds = oneYearTuitionFee + costOfLiving + partnerCostOfLiving + dependentCostOfLiving + airfare;

    return {
      oneYearTuitionFee, costOfLiving,
      partnerCostOfLiving, dependentCostOfLiving,
      nzSchoolAgeCost: 0, nzNonSchoolAgeCost: 0, airfare, totalFunds,
    };
}
