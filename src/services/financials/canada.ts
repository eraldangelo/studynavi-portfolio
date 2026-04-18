
import type { Answers } from '@/lib/core/types';
import type { ExchangeRates } from '../exchange-rate-service';
import { getNumber, calculateBaseScholarship, calculatePaymentDue, FinancialCalculationResult, FinancialDocumentCalculationResult } from './common';
import { getCanadaFeesRuntime } from '@/services/fees/canada-fees-runtime';
import type { CanadaTierKey } from '@/services/fees/canada-fees-runtime';

export function calculateCanadaFinancials(answers: Answers, exchangeRates: ExchangeRates, feesDoc?: any): FinancialCalculationResult {
    const phpRate = exchangeRates['PHP'] / exchangeRates['CAD'];
    const annualTuitionFee = getNumber(answers.annualTuitionFee);
    const fees = getCanadaFeesRuntime(feesDoc);

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
    
    const insuranceCost = 0; // Set insurance to 0 for Canada
    
    let englishTestFee = 0;
    if (answers.ieltsPreparation !== 'Yes' && answers.englishTestRequired === 'true' && answers.hasMOI !== 'true') {
        englishTestFee = fees.englishTestIeltsFeePHP / phpRate;
    }
    
    const visaFee = fees.studentVisaFeeCAD;
    
    const hasDependents = answers.visaAssistance && answers.visaAssistance !== 'No';
    const hasSpouse = answers.visaAssistance === 'Spouse/De Facto' || answers.visaAssistance === 'Spouse/De Facto and Child/ren';
    
    const numChildren_0_4 = getNumber(answers.children_0_4);
    const numChildren_5_10 = getNumber(answers.children_5_10);
    const numChildren_11_14 = getNumber(answers.children_11_14);
    const numChildren_15_plus = getNumber(answers.children_15_plus);
    const numChildren = numChildren_0_4 + numChildren_5_10 + numChildren_11_14 + numChildren_15_plus;
    const numChildrenForStudyPermit = numChildren_5_10 + numChildren_11_14 + numChildren_15_plus;
    
    const dependentCount = (hasSpouse ? 1 : 0) + numChildren;

    const studentMedicalFee = fees.studentMedicalExamFeePHP / phpRate;
    const biometricsFee = dependentCount > 0 ? fees.biometricsFamilyCAD : fees.biometricsSoloCAD;
    
    let dependentMedicalExamFee = 0;
    let dependentVisaFee = 0; // for visitor visa 0-4
    let dependentStudyPermitFee = 0; // for study permit 5+
    let dependentVisaFeeOver18 = 0;
    let agencyAssistanceFee = 0;
    
    let medical0to4Fee = 0;
    let medical5to10Fee = 0;
    let medical11to14Fee = 0;
    let medical15plusFee = 0;

    if (hasDependents && dependentCount > 0) {
        if (hasSpouse) {
            dependentVisaFeeOver18 = fees.dependentVisaFeeSpouseOWPCAD;
            dependentMedicalExamFee = fees.spouseMedicalExamFeePHP / phpRate;
        } else {
            dependentVisaFeeOver18 = 0;
        }

        dependentVisaFee = numChildren_0_4 * fees.dependentVisaFeeVisitorChild0to4CAD;
        dependentStudyPermitFee = numChildrenForStudyPermit * fees.dependentStudyPermitFeeChild5PlusCAD;
        
        medical0to4Fee = numChildren_0_4 * (fees.childMedical0to4PHP / phpRate);
        medical5to10Fee = numChildren_5_10 * (fees.childMedical5to10PHP / phpRate);
        medical11to14Fee = numChildren_11_14 * (fees.childMedical11to14PHP / phpRate);
        medical15plusFee = numChildren_15_plus * (fees.childMedical15plusPHP / phpRate);

        const assistanceFeePHP = answers.isSubsequentEntry === 'true' ? fees.assistancePerDependentSubsequentEntryPHP : fees.assistancePerDependentPHP;
        agencyAssistanceFee = (assistanceFeePHP * dependentCount) / phpRate;
    }
    
    const totalCashout = paymentDueWithScholarship 
        + insuranceCost 
        + englishTestFee 
        + visaFee 
        + studentMedicalFee 
        + biometricsFee 
        + getNumber(answers.schoolApplicationFee) 
        + agencyAssistanceFee 
        + dependentVisaFeeOver18
        + dependentVisaFee
        + dependentStudyPermitFee
        + dependentMedicalExamFee
        + medical0to4Fee
        + medical5to10Fee
        + medical11to14Fee
        + medical15plusFee;

    return {
        totalCourseFeeBeforeScholarship, totalCourseFeeAfterScholarship, scholarshipAmount,
        totalPaymentDue: paymentDueWithScholarship, totalPaymentDueBeforeScholarship: paymentDueBeforeScholarship, insuranceCost: insuranceCost,
        englishTestFee: englishTestFee, visaFee: visaFee, medicalExaminationFee: studentMedicalFee, biometricsFee: biometricsFee,
        totalCashout: totalCashout,
        protectionOfEnrolledLearnersFee: 0, remainingBalanceToPay, 
        dependentMedicalExamFee: dependentMedicalExamFee,
        dependentVisaFee: dependentVisaFee, 
        dependentStudyPermitFee: dependentStudyPermitFee,
        dependentVisaFeeOver18: dependentVisaFeeOver18, 
        dependentBiometricsFee: 0, // This is now included in the main biometricsFee
        agencyAssistanceFee: agencyAssistanceFee,
        dependentVisaFeeSchoolAge: 0, 
        dependentVisaFeeNonSchoolAge: 0, 
        schoolApplicationFee: getNumber(answers.schoolApplicationFee),
        medical0to4Fee,
        medical5to10Fee,
        medical11to14Fee,
        medical15plusFee,
    };
}

export function calculateCanadaFinancialDocuments(answers: Answers, exchangeRates: ExchangeRates, feesDoc?: any): FinancialDocumentCalculationResult {
    const annualTuitionFee = getNumber(answers.annualTuitionFee);
    const fees = getCanadaFeesRuntime(feesDoc);
    
    const hasDependents = answers.visaAssistance && answers.visaAssistance !== 'No';
    const hasSpouseOrPartner = hasDependents && ['Spouse/De Facto', 'Spouse/De Facto and Child/ren'].includes(answers.visaAssistance || '');
    
    const numChildren_0_4 = getNumber(answers.children_0_4);
    const numChildren_5_10 = getNumber(answers.children_5_10);
    const numChildren_11_14 = getNumber(answers.children_11_14);
    const numChildren_15_plus = getNumber(answers.children_15_plus);
    const numChildren = numChildren_0_4 + numChildren_5_10 + numChildren_11_14 + numChildren_15_plus;

    const numberOfFamilyMembers = 1 + (hasSpouseOrPartner ? 1 : 0) + numChildren;

    let costOfLiving;
    if (numberOfFamilyMembers <= 7) {
        costOfLiving = fees.costOfLivingTierCAD[String(numberOfFamilyMembers) as CanadaTierKey];
    } else {
        costOfLiving = fees.costOfLivingTierCAD['7'] + (numberOfFamilyMembers - 7) * fees.additionalMemberCostCAD;
    }

    const numberOfPeopleForAirfare = 1 + (hasSpouseOrPartner ? 1 : 0) + numChildren;
    const airfare = fees.airfarePerPersonCAD * numberOfPeopleForAirfare;

    const totalFunds = annualTuitionFee + costOfLiving + airfare;

    return {
        oneYearTuitionFee: annualTuitionFee,
        costOfLiving: costOfLiving,
        partnerCostOfLiving: 0, // No longer used for Canada in this way
        dependentCostOfLiving: 0, // No longer used for Canada in this way
        nzSchoolAgeCost: 0,
        nzNonSchoolAgeCost: 0,
        airfare: airfare,
        totalFunds: totalFunds,
    };
}
