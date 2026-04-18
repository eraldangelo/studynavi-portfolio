'use client';

import { Label } from "@/components/ui/forms/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/forms/select";
import { Checkbox } from "@/components/ui/forms/checkbox";
import { CurrencyInput } from "@/components/ui/forms/currency-input";
import type { Answers } from "@/lib/core/types";

interface PaymentTypeSectionProps {
  answers: Answers;
  onAnswer: (id: keyof Answers, value: any) => void;
  isPaymentTypeDisabled: boolean;
  currencySymbol: string;
  currencyCode: string;
  isApplicationFeeWaived: boolean;
  setIsApplicationFeeWaived: (checked: boolean) => void;
  isCanada: boolean;
  isAustralia: boolean;
}

const PaymentTypeSection = ({
  answers,
  onAnswer,
  isPaymentTypeDisabled,
  currencySymbol,
  currencyCode,
  isApplicationFeeWaived,
  setIsApplicationFeeWaived,
  isCanada,
  isAustralia
}: PaymentTypeSectionProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="paymentType">Payment Type</Label>
      <Select onValueChange={(val) => onAnswer('paymentType', val)} value={answers.paymentType ?? ''} disabled={isPaymentTypeDisabled}>
        <SelectTrigger data-testid="payment-type-select-trigger">
          <SelectValue placeholder="Select payment type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="3_months">Pay every 3 months (VET)</SelectItem>
          <SelectItem value="1_semester">1 Semester Fee (Most Universities)</SelectItem>
          <SelectItem value="1_year">1 Year School Fee</SelectItem>
          <SelectItem value="tuition_fee_deposit_only">Tuition Fee Deposit Only</SelectItem>
          <SelectItem value="manual">Manual (for trimester schools)</SelectItem>
        </SelectContent>
      </Select>
      
      {answers.paymentType === 'tuition_fee_deposit_only' && (
        <div className="space-y-2 mt-4">
          <Label htmlFor="tuitionFeeDeposit">Enter tuition fee deposit amount ({currencyCode})</Label>
          <CurrencyInput 
            id="tuitionFeeDeposit"
            data-testid="tuition-fee-deposit-input"
            placeholder="Enter tuition fee deposit"
            value={answers.tuitionFeeDeposit ?? ''}
            onChange={(value) => onAnswer('tuitionFeeDeposit', value)}
            symbol={currencySymbol}
          />
        </div>
      )}

      {answers.paymentType === 'manual' && (
        <div className="space-y-2 mt-4">
          <Label htmlFor="manualPayment">Enter manual payment amount ({currencyCode})</Label>
          <CurrencyInput 
            id="manualPayment"
            data-testid="manual-payment-input"
            placeholder="Enter manual payment amount"
            value={answers.manualPayment ?? ''}
            onChange={(value) => onAnswer('manualPayment', value)}
            symbol={currencySymbol}
          />
        </div>
      )}
      
      {(isCanada || isAustralia) && (
        <div className="space-y-2 mt-4">
          <Label htmlFor="schoolApplicationFee">School Application Fee</Label>
          <CurrencyInput
            id="schoolApplicationFee"
            data-testid="school-application-fee-input"
            placeholder="Enter fee"
            value={answers.schoolApplicationFee ?? ''}
            onChange={(value) => onAnswer('schoolApplicationFee', value)}
            symbol={currencySymbol}
            disabled={isApplicationFeeWaived}
          />
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="applicationFeeWaived"
              checked={isApplicationFeeWaived}
              onCheckedChange={(checked) => setIsApplicationFeeWaived(checked as boolean)}
            />
            <Label htmlFor="applicationFeeWaived" className="text-sm font-medium cursor-pointer">
              Application fee waived?
            </Label>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentTypeSection;
