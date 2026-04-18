'use client';

import { Label } from "@/components/ui/forms/label";
import { Checkbox } from "@/components/ui/forms/checkbox";
import { Button } from "@/components/ui/forms/button";
import { Info } from "lucide-react";
import type { ModalID } from "@/lib/core/types";

interface AdditionalFeesSectionProps {
  insuranceCost: number;
  protectionOfEnrolledLearnersFee: number;
  englishTestFee: number;
  visaFee: number;
  medicalExaminationFee: number;
  biometricsFee: number;
  isIELTSSelected: boolean;
  setIsIELTSSelected: (checked: boolean) => void;
  hasMOI: boolean;
  setHasMOI: (checked: boolean) => void;
  isMultipleEntryVisa: boolean;
  setIsMultipleEntryVisa: (checked: boolean) => void;
  requiredTBTest: boolean;
  setRequiredTBTest: (checked: boolean) => void;
  isIreland: boolean;
  isCanada: boolean;
  isAustralia: boolean;
  isNewZealand: boolean;
  currencySymbol: string;
  phpRate: number;
  setModalId: (id: ModalID | null) => void;
  showEnglishTestFeeSection: boolean;
  hasDependents: boolean;
}

const AdditionalFeesSection = ({
  insuranceCost,
  protectionOfEnrolledLearnersFee,
  englishTestFee,
  visaFee,
  medicalExaminationFee,
  biometricsFee,
  isIELTSSelected,
  setIsIELTSSelected,
  hasMOI,
  setHasMOI,
  isMultipleEntryVisa,
  setIsMultipleEntryVisa,
  requiredTBTest,
  setRequiredTBTest,
  isIreland,
  isCanada,
  isAustralia,
  isNewZealand,
  currencySymbol,
  phpRate,
  setModalId,
  showEnglishTestFeeSection,
  hasDependents
}: AdditionalFeesSectionProps) => {
  
  const formatCurrency = (value: number) => 
    value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  const formatPhp = (value: number) => 
    (value * phpRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="border-t pt-6 mt-6">
      <div className="flex flex-wrap gap-x-8 gap-y-6">
        {!isCanada && insuranceCost > 0 && (
          <div className="space-y-2 flex-1 min-w-[120px]">
            <Label>{isIreland ? "Student Insurance" : "Insurance"}</Label>
            <p className="text-lg font-semibold text-[#004097]">
              {currencySymbol}{formatCurrency(insuranceCost)}
            </p>
            <p className="text-sm text-muted-foreground">(PHP: ₱{formatPhp(insuranceCost)})</p>
          </div>
        )}
        
        {protectionOfEnrolledLearnersFee > 0 && (
          <div className="space-y-2 flex-1 min-w-[120px]">
            <Label>
              <span className="flex items-center gap-2">
                Protection of Enrolled Learners
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setModalId('IRELAND_PEL_INFO')}>
                  <Info className="h-4 w-4 text-blue-500" />
                </Button>
              </span>
            </Label>
            <p className="text-lg font-semibold text-[#004097]">
              {currencySymbol}{formatCurrency(protectionOfEnrolledLearnersFee)}
            </p>
            <p className="text-sm text-muted-foreground">(PHP: ₱{formatPhp(protectionOfEnrolledLearnersFee)})</p>
          </div>
        )}
        
        {showEnglishTestFeeSection && (
          <div className="space-y-2 flex-1 min-w-[120px]">
            <Label>English Test Fee</Label>
            <p className="text-lg font-semibold text-[#004097]">
              {currencySymbol}{formatCurrency(englishTestFee)}
            </p>
            <p className="text-sm text-muted-foreground">(PHP: ₱{formatPhp(englishTestFee)})</p>
            {isIreland && (
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="isIELTSSelected" checked={isIELTSSelected} onCheckedChange={(checked) => setIsIELTSSelected(checked as boolean)} className="h-3 w-3" />
                <Label
                  htmlFor="isIELTSSelected"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  IELTS?
                </Label>
              </div>
            )}
            {isCanada && (
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="hasMOI" checked={hasMOI} onCheckedChange={(checked) => setHasMOI(checked as boolean)} className="h-3 w-3" />
                <Label
                  htmlFor="hasMOI"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  MOI?
                </Label>
              </div>
            )}
          </div>
        )}
        
        {visaFee > 0 && (
          <div className="space-y-2 flex-1 min-w-[120px]">
            <Label>
              <span className="flex items-center gap-2">
                Student Visa Fee
                {isIreland && (
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setModalId('IRELAND_VISA_PROCESSING_TIME')}>
                    <Info className="h-4 w-4 text-blue-500" />
                  </Button>
                )}
              </span>
            </Label>
            <p className="text-lg font-semibold text-[#004097]">
              {currencySymbol}{formatCurrency(visaFee)}
            </p>
            <p className="text-sm text-muted-foreground">(PHP: ₱{formatPhp(visaFee)})</p>
            {isIreland && (
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="isMultipleEntryVisa" checked={isMultipleEntryVisa} onCheckedChange={(checked) => setIsMultipleEntryVisa(checked as boolean)} className="h-3 w-3" />
                <Label
                  htmlFor="isMultipleEntryVisa"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Multiple Entry?
                </Label>
              </div>
            )}
          </div>
        )}
        
        {(isAustralia || isNewZealand || isCanada) && medicalExaminationFee > 0 && (
          <div className="space-y-2 flex-1 min-w-[120px]">
            <Label>Medical Exam Fee</Label>
            <p className="text-lg font-semibold text-[#004097]">
              {currencySymbol}{formatCurrency(medicalExaminationFee)}
            </p>
            <p className="text-sm text-muted-foreground">(PHP: ₱{formatPhp(medicalExaminationFee)})</p>
            {isAustralia && (
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="requiredTBTest" checked={requiredTBTest} onCheckedChange={(checked) => setRequiredTBTest(checked as boolean)} className="h-3 w-3" />
                <Label
                  htmlFor="requiredTBTest"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Required TB Test?
                </Label>
              </div>
            )}
          </div>
        )}
        
        {(isAustralia || isCanada) && biometricsFee > 0 && (
          <div className="space-y-2 flex-1 min-w-[120px]">
            <Label>{isAustralia ? 'Biometrics Fee' : (hasDependents ? 'Family Biometrics Fee' : 'Biometrics Fee')}</Label>
            <p className="text-lg font-semibold text-[#004097]">
              {currencySymbol}{formatCurrency(biometricsFee)}
            </p>
            <p className="text-sm text-muted-foreground">(PHP: ₱{formatPhp(biometricsFee)})</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdditionalFeesSection;