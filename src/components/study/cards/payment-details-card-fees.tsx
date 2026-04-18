import type { Answers, ModalID } from '@/lib/core/types';
import type { FinancialCalculationResult } from '@/services/financials/common';
import AdditionalFeesSection from '@/components/study/payment-details/additional-fees-section';
import DependentFeesSection from '@/components/study/payment-details/dependent-fees-section';
import ExchangeRateSection from '@/components/study/payment-details/exchange-rate-section';

interface PaymentDetailsCardFeesProps {
  answers: Answers;
  paymentDetails: FinancialCalculationResult;
  hasDependentFees: boolean;
  hasDependents: boolean;
  setModalId: (id: ModalID | null) => void;
  isIELTSSelected: boolean;
  setIsIELTSSelected: (value: boolean) => void;
  hasMOI: boolean;
  setHasMOI: (value: boolean) => void;
  isMultipleEntryVisa: boolean;
  setIsMultipleEntryVisa: (value: boolean) => void;
  requiredTBTest: boolean;
  setRequiredTBTest: (value: boolean) => void;
  isSubsequentEntry: boolean;
  setIsSubsequentEntry: (value: boolean) => void;
  isIreland: boolean;
  isCanada: boolean;
  isAustralia: boolean;
  isNewZealand: boolean;
  currencyCode: string;
  currencySymbol: string;
  phpRate: number;
  countryRates: Record<string, number>;
  currentTime: string | null;
  totalCashout: number;
  isLoading: boolean;
  showEnglishTestFeeSection: boolean;
}

export function PaymentDetailsCardFees({
  answers,
  paymentDetails,
  hasDependentFees,
  hasDependents,
  setModalId,
  isIELTSSelected,
  setIsIELTSSelected,
  hasMOI,
  setHasMOI,
  isMultipleEntryVisa,
  setIsMultipleEntryVisa,
  requiredTBTest,
  setRequiredTBTest,
  isSubsequentEntry,
  setIsSubsequentEntry,
  isIreland,
  isCanada,
  isAustralia,
  isNewZealand,
  currencyCode,
  currencySymbol,
  phpRate,
  countryRates,
  currentTime,
  totalCashout,
  isLoading,
  showEnglishTestFeeSection,
}: PaymentDetailsCardFeesProps) {
  const {
    insuranceCost,
    englishTestFee,
    visaFee,
    medicalExaminationFee,
    biometricsFee,
    protectionOfEnrolledLearnersFee,
    dependentMedicalExamFee,
    dependentVisaFee,
    dependentVisaFeeOver18,
    dependentBiometricsFee,
    agencyAssistanceFee,
    dependentVisaFeeSchoolAge,
    dependentVisaFeeNonSchoolAge,
    dependentStudyPermitFee,
    medical0to4Fee,
    medical5to10Fee,
    medical11to14Fee,
    medical15plusFee,
  } = paymentDetails;

  return (
    <>
      <AdditionalFeesSection
        insuranceCost={insuranceCost}
        protectionOfEnrolledLearnersFee={protectionOfEnrolledLearnersFee}
        englishTestFee={englishTestFee}
        visaFee={visaFee}
        medicalExaminationFee={medicalExaminationFee}
        biometricsFee={biometricsFee}
        isIELTSSelected={isIELTSSelected}
        setIsIELTSSelected={setIsIELTSSelected}
        hasMOI={hasMOI}
        setHasMOI={setHasMOI}
        isMultipleEntryVisa={isMultipleEntryVisa}
        setIsMultipleEntryVisa={setIsMultipleEntryVisa}
        requiredTBTest={requiredTBTest}
        setRequiredTBTest={setRequiredTBTest}
        isIreland={isIreland}
        isCanada={isCanada}
        isAustralia={isAustralia}
        isNewZealand={isNewZealand}
        currencySymbol={currencySymbol}
        phpRate={phpRate}
        setModalId={setModalId}
        showEnglishTestFeeSection={showEnglishTestFeeSection}
        hasDependents={hasDependents}
      />

      {hasDependentFees && (
        <DependentFeesSection
          dependentMedicalExamFee={dependentMedicalExamFee}
          dependentVisaFee={dependentVisaFee}
          dependentVisaFeeOver18={dependentVisaFeeOver18}
          dependentBiometricsFee={dependentBiometricsFee}
          agencyAssistanceFee={agencyAssistanceFee}
          dependentVisaFeeSchoolAge={dependentVisaFeeSchoolAge}
          dependentVisaFeeNonSchoolAge={dependentVisaFeeNonSchoolAge}
          dependentStudyPermitFee={dependentStudyPermitFee}
          medical0to4Fee={medical0to4Fee}
          medical5to10Fee={medical5to10Fee}
          medical11to14Fee={medical11to14Fee}
          medical15plusFee={medical15plusFee}
          isSubsequentEntry={isSubsequentEntry}
          setIsSubsequentEntry={setIsSubsequentEntry}
          isCanada={isCanada}
          isAustralia={isAustralia}
          isNewZealand={isNewZealand}
          currencySymbol={currencySymbol}
          phpRate={phpRate}
          hasDependents={hasDependents}
          hasDependentFees={hasDependentFees}
          setModalId={setModalId}
          answers={answers}
        />
      )}

      <ExchangeRateSection
        currentTime={currentTime}
        currencyCode={currencyCode}
        phpRate={phpRate}
        countryRates={countryRates}
        totalCashout={totalCashout}
        currencySymbol={currencySymbol}
        hasDependents={hasDependents}
        isLoading={isLoading}
        isIreland={isIreland}
        isAustralia={isAustralia}
        isNewZealand={isNewZealand}
        isCanada={isCanada}
      />
    </>
  );
}
