'use client';
import { Label } from '@/components/ui/forms/label';
import type { ModalID, Answers } from '@/lib/core/types';
import {
  DependentAssistanceItem,
  DependentFeeItem,
} from '@/components/study/payment-details/dependent-fees-section.items';
interface DependentFeesSectionProps {
  dependentMedicalExamFee: number;
  dependentVisaFee: number;
  dependentVisaFeeOver18: number;
  dependentBiometricsFee: number;
  agencyAssistanceFee: number;
  dependentVisaFeeSchoolAge: number;
  dependentVisaFeeNonSchoolAge: number;
  dependentStudyPermitFee: number;
  medical0to4Fee?: number;
  medical5to10Fee?: number;
  medical11to14Fee?: number;
  medical15plusFee?: number;
  isSubsequentEntry: boolean;
  setIsSubsequentEntry: (checked: boolean) => void;
  isCanada: boolean;
  isAustralia: boolean;
  isNewZealand: boolean;
  currencySymbol: string;
  phpRate: number;
  hasDependents: boolean;
  hasDependentFees: boolean;
  setModalId?: (id: ModalID | null) => void;
  answers?: Answers;
}
const SPOUSE_STATUSES = ['De Facto / Common Law', 'Married'];
const DependentFeesSection = ({
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
  isSubsequentEntry,
  setIsSubsequentEntry,
  isCanada,
  isAustralia,
  isNewZealand,
  currencySymbol,
  phpRate,
  answers,
}: DependentFeesSectionProps) => {
  const formatCurrency = (value: number) =>
    value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatPhp = (value: number) =>
    (value * phpRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const isSpouseDependent =
    !!answers?.maritalStatus
    && SPOUSE_STATUSES.includes(answers.maritalStatus)
    && answers.visaAssistance !== 'Child/ren';
  return (
    <div className="border-t pt-6 mt-6 space-y-6">
      <Label className="text-lg font-bold">Additional Fees for Dependents</Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-6">
        {!isCanada && dependentMedicalExamFee > 0 && (
          <DependentFeeItem
            label="Dependent Medical"
            value={dependentMedicalExamFee}
            currencySymbol={currencySymbol}
            formatCurrency={formatCurrency}
            formatPhp={formatPhp}
          />
        )}
        {(isAustralia || isNewZealand) && dependentVisaFeeOver18 > 0 && isSpouseDependent && (
          <DependentFeeItem
            label="Dependent Visa"
            subtitle="18 and over"
            value={dependentVisaFeeOver18}
            currencySymbol={currencySymbol}
            formatCurrency={formatCurrency}
            formatPhp={formatPhp}
          />
        )}
        {!isCanada && !isNewZealand && isAustralia && dependentVisaFee > 0 && (
          <DependentFeeItem
            label="Dependent Visa"
            subtitle="Under 18"
            value={dependentVisaFee}
            currencySymbol={currencySymbol}
            formatCurrency={formatCurrency}
            formatPhp={formatPhp}
          />
        )}
        {isNewZealand && dependentVisaFeeSchoolAge > 0 && (
          <DependentFeeItem
            label="Dependent Visa"
            subtitle="School Age"
            value={dependentVisaFeeSchoolAge}
            currencySymbol={currencySymbol}
            formatCurrency={formatCurrency}
            formatPhp={formatPhp}
          />
        )}
        {isNewZealand && dependentVisaFeeNonSchoolAge > 0 && (
          <DependentFeeItem
            label="Dependent Visa"
            subtitle="Non-School Age"
            value={dependentVisaFeeNonSchoolAge}
            currencySymbol={currencySymbol}
            formatCurrency={formatCurrency}
            formatPhp={formatPhp}
          />
        )}
        {!isCanada && dependentBiometricsFee > 0 && (
          <DependentFeeItem
            label="Dependent Biometrics"
            value={dependentBiometricsFee}
            currencySymbol={currencySymbol}
            formatCurrency={formatCurrency}
            formatPhp={formatPhp}
          />
        )}
        {isCanada && (
          <>
            {dependentVisaFeeOver18 > 0 && isSpouseDependent && (
              <DependentFeeItem
                label="Dependent Visa"
                subtitle="Spouse w/ OWP"
                value={dependentVisaFeeOver18}
                currencySymbol={currencySymbol}
                formatCurrency={formatCurrency}
                formatPhp={formatPhp}
              />
            )}
            {dependentStudyPermitFee > 0 && (
              <DependentFeeItem
                label="Dependent Visa"
                subtitle="Study Permit"
                value={dependentStudyPermitFee}
                currencySymbol={currencySymbol}
                formatCurrency={formatCurrency}
                formatPhp={formatPhp}
              />
            )}
            {dependentVisaFee > 0 && (
              <DependentFeeItem
                label="Dependent Visa"
                subtitle="Visitor"
                value={dependentVisaFee}
                currencySymbol={currencySymbol}
                formatCurrency={formatCurrency}
                formatPhp={formatPhp}
              />
            )}
            {(medical0to4Fee ?? 0) > 0 && (
              <DependentFeeItem
                label="Medical"
                subtitle="0-4 years old"
                value={medical0to4Fee ?? 0}
                currencySymbol={currencySymbol}
                formatCurrency={formatCurrency}
                formatPhp={formatPhp}
              />
            )}
            {(medical5to10Fee ?? 0) > 0 && (
              <DependentFeeItem
                label="Medical"
                subtitle="5-10 years old"
                value={medical5to10Fee ?? 0}
                currencySymbol={currencySymbol}
                formatCurrency={formatCurrency}
                formatPhp={formatPhp}
              />
            )}
            {(medical11to14Fee ?? 0) > 0 && (
              <DependentFeeItem
                label="Medical"
                subtitle="11-14 years old"
                value={medical11to14Fee ?? 0}
                currencySymbol={currencySymbol}
                formatCurrency={formatCurrency}
                formatPhp={formatPhp}
              />
            )}
            {(medical15plusFee ?? 0) > 0 && (
              <DependentFeeItem
                label="Medical"
                subtitle="15+"
                value={medical15plusFee ?? 0}
                currencySymbol={currencySymbol}
                formatCurrency={formatCurrency}
                formatPhp={formatPhp}
              />
            )}
            {dependentMedicalExamFee > 0 && (
              <DependentFeeItem
                label="Medical"
                subtitle="Spouse"
                value={dependentMedicalExamFee}
                currencySymbol={currencySymbol}
                formatCurrency={formatCurrency}
                formatPhp={formatPhp}
              />
            )}
            {agencyAssistanceFee > 0 && (
              <DependentAssistanceItem
                label="Agency Assistance Fee"
                value={agencyAssistanceFee}
                currencySymbol={currencySymbol}
                formatCurrency={formatCurrency}
                formatPhp={formatPhp}
                isSubsequentEntry={isSubsequentEntry}
                setIsSubsequentEntry={setIsSubsequentEntry}
              />
            )}
          </>
        )}
        {!isCanada && agencyAssistanceFee > 0 && (
          <DependentAssistanceItem
            label="Agency Assistance Fee"
            value={agencyAssistanceFee}
            currencySymbol={currencySymbol}
            formatCurrency={formatCurrency}
            formatPhp={formatPhp}
            isSubsequentEntry={isSubsequentEntry}
            setIsSubsequentEntry={setIsSubsequentEntry}
          />
        )}
      </div>
    </div>
  );
};
export default DependentFeesSection;
