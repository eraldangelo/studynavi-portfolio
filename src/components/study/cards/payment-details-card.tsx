'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { DollarSign } from 'lucide-react';
import type { Answers, ModalID } from '@/lib/core/types';
import type { FinancialCalculationResult } from '@/services/financials/common';
import type { ExchangeRates } from '@/services/exchange-rate-service';
import { getCurrencyInfo } from '@/lib/currency';
import { Skeleton } from '@/components/ui/display/skeleton';
import { usePaymentDetailsState } from '@/hooks/study/usePaymentDetailsState';
import ScholarshipSection from '@/components/study/payment-details/scholarship-section';
import PaymentTypeSection from '@/components/study/payment-details/payment-type-section';
import { PaymentDetailsCardSummary } from '@/components/study/cards/payment-details-card-summary';
import { PaymentDetailsCardPaymentDue } from '@/components/study/cards/payment-details-card-payment-due';
import { computeHasDependentFees } from '@/components/study/cards/payment-details-card.helpers';
import { PaymentDetailsCardFees } from '@/components/study/cards/payment-details-card-fees';

interface PaymentDetailsCardProps {
  answers: Answers;
  onAnswerChange: (id: keyof Answers, value: any) => void;
  setModalId: (id: ModalID | null) => void;
  paymentDetails: FinancialCalculationResult | null;
  isLoading: boolean;
  error: string | null;
  exchangeRates: ExchangeRates | null;
}

export default function PaymentDetailsCard({
  answers,
  onAnswerChange: onAnswer,
  setModalId,
  paymentDetails,
  isLoading,
  error,
  exchangeRates,
}: PaymentDetailsCardProps) {
  const {
    hasScholarship,
    setHasScholarship,
    scholarshipInputType,
    setScholarshipInputType,
    requiredTBTest,
    setRequiredTBTest,
    isSubsequentEntry,
    setIsSubsequentEntry,
    isIELTSSelected,
    setIsIELTSSelected,
    hasMOI,
    setHasMOI,
    isMultipleEntryVisa,
    setIsMultipleEntryVisa,
    currentTime,
    isApplicationFeeWaived,
    setIsApplicationFeeWaived,
    isIreland,
    isNewZealand,
    isAustralia,
    isCanada,
    hasDependents,
    isPaymentTypeDisabled,
    showEnglishTestFeeSection,
    getPaymentDueLabel,
  } = usePaymentDetailsState(answers, onAnswer, setModalId);

  const { currencyCode, currencySymbol, phpRate, countryRates } = getCurrencyInfo(
    answers.studyDestination,
    exchangeRates,
  );

  const formatCurrency = (value: number) =>
    value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formatPhp = (value: number) =>
    (value * phpRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (isLoading) {
    return <Skeleton className="h-[600px] w-full" />;
  }

  if (error || !paymentDetails || !exchangeRates) {
    return (
      <Card className="w-full">
        <CardHeader className="p-4 pb-4 md:p-6 md:pb-4">
          <CardTitle style={{ color: '#004097' }}>Tuition Fee Details</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
          <p className="text-destructive text-center">{error || 'Could not calculate payment details.'}</p>
        </CardContent>
      </Card>
    );
  }

  const {
    totalCourseFeeBeforeScholarship,
    totalCourseFeeAfterScholarship,
    scholarshipAmount,
    totalPaymentDue,
    remainingBalanceToPay,
    dependentMedicalExamFee,
    dependentVisaFee,
    dependentVisaFeeOver18,
    dependentBiometricsFee,
    agencyAssistanceFee,
    dependentStudyPermitFee,
    medical0to4Fee,
    medical5to10Fee,
    medical11to14Fee,
    medical15plusFee,
  } = paymentDetails;

  const hasDependentFees = computeHasDependentFees({
    hasDependents: !!hasDependents,
    isCanada,
    dependentVisaFeeOver18,
    dependentVisaFee,
    dependentStudyPermitFee,
    agencyAssistanceFee,
    dependentMedicalExamFee,
    medical0to4Fee,
    medical5to10Fee,
    medical11to14Fee,
    medical15plusFee,
    dependentBiometricsFee,
  });

  return (
    <Card className="w-full animate-in fade-in-0 duration-500">
      <CardHeader className="p-4 pb-4 md:p-6 md:pb-4">
        <CardTitle className="flex items-center gap-3 text-xl md:text-2xl text-[#004097]">
          <DollarSign className="h-7 w-7 text-yellow-500" />
          Tuition Fee Details
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 p-4 pt-0 md:p-6 md:pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <PaymentDetailsCardSummary
            answers={answers}
            onAnswer={onAnswer}
            hasScholarship={hasScholarship}
            setHasScholarship={setHasScholarship}
            currencyCode={currencyCode}
            currencySymbol={currencySymbol}
            totalCourseFeeBeforeScholarship={totalCourseFeeBeforeScholarship}
            totalCourseFeeAfterScholarship={totalCourseFeeAfterScholarship}
            scholarshipAmount={scholarshipAmount}
            formatCurrency={formatCurrency}
            formatPhp={formatPhp}
          />

          {hasScholarship && (
            <ScholarshipSection
              answers={answers}
              onAnswer={onAnswer}
              scholarshipInputType={scholarshipInputType}
              setScholarshipInputType={setScholarshipInputType}
              currencySymbol={currencySymbol}
              currencyCode={currencyCode}
              totalCourseFeeBeforeScholarship={totalCourseFeeBeforeScholarship}
              totalCourseFeeAfterScholarship={totalCourseFeeAfterScholarship}
              scholarshipAmount={scholarshipAmount}
              phpRate={phpRate}
            />
          )}

          <PaymentTypeSection
            answers={answers}
            onAnswer={onAnswer}
            isPaymentTypeDisabled={isPaymentTypeDisabled}
            currencySymbol={currencySymbol}
            currencyCode={currencyCode}
            isApplicationFeeWaived={isApplicationFeeWaived}
            setIsApplicationFeeWaived={setIsApplicationFeeWaived}
            isCanada={isCanada}
            isAustralia={isAustralia}
          />

          <PaymentDetailsCardPaymentDue
            paymentType={answers.paymentType}
            label={getPaymentDueLabel()}
            totalPaymentDue={totalPaymentDue}
            remainingBalanceToPay={remainingBalanceToPay}
            currencySymbol={currencySymbol}
            formatCurrency={formatCurrency}
            formatPhp={formatPhp}
          />
        </div>

        <PaymentDetailsCardFees
          answers={answers}
          paymentDetails={paymentDetails}
          hasDependentFees={hasDependentFees}
          hasDependents={!!hasDependents}
          setModalId={setModalId}
          isIELTSSelected={isIELTSSelected}
          setIsIELTSSelected={setIsIELTSSelected}
          hasMOI={hasMOI}
          setHasMOI={setHasMOI}
          isMultipleEntryVisa={isMultipleEntryVisa}
          setIsMultipleEntryVisa={setIsMultipleEntryVisa}
          requiredTBTest={requiredTBTest}
          setRequiredTBTest={setRequiredTBTest}
          isSubsequentEntry={isSubsequentEntry}
          setIsSubsequentEntry={setIsSubsequentEntry}
          isIreland={isIreland}
          isCanada={isCanada}
          isAustralia={isAustralia}
          isNewZealand={isNewZealand}
          currencyCode={currencyCode}
          currencySymbol={currencySymbol}
          phpRate={phpRate}
          countryRates={countryRates}
          currentTime={currentTime}
          totalCashout={paymentDetails.totalCashout}
          isLoading={isLoading}
          showEnglishTestFeeSection={showEnglishTestFeeSection}
        />
      </CardContent>
    </Card>
  );
}
