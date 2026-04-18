'use client';

import { Label } from '@/components/ui/forms/label';
import { Checkbox } from '@/components/ui/forms/checkbox';
import { CurrencyInput } from '@/components/ui/forms/currency-input';
import type { Answers } from '@/lib/core/types';

type PaymentDetailsCardSummaryProps = {
  answers: Answers;
  onAnswer: (id: keyof Answers, value: any) => void;
  hasScholarship: boolean;
  setHasScholarship: (value: boolean) => void;
  currencyCode: string;
  currencySymbol: string;
  totalCourseFeeBeforeScholarship: number;
  totalCourseFeeAfterScholarship: number;
  scholarshipAmount: number;
  formatCurrency: (value: number) => string;
  formatPhp: (value: number) => string;
};

export function PaymentDetailsCardSummary({
  answers,
  onAnswer,
  hasScholarship,
  setHasScholarship,
  currencyCode,
  currencySymbol,
  totalCourseFeeBeforeScholarship,
  totalCourseFeeAfterScholarship,
  scholarshipAmount,
  formatCurrency,
  formatPhp,
}: PaymentDetailsCardSummaryProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="annualTuitionFee">Annual Tuition Fee ({currencyCode})</Label>
        <CurrencyInput
          id="annualTuitionFee"
          placeholder="Enter annual tuition fee"
          value={answers.annualTuitionFee ?? ''}
          onChange={(value) => onAnswer('annualTuitionFee', value)}
          symbol={currencySymbol}
        />
        <div className="flex items-center space-x-2 pt-2">
          <Checkbox
            id="hasScholarship"
            checked={hasScholarship}
            onCheckedChange={(checked) => setHasScholarship(checked as boolean)}
          />
          <Label
            htmlFor="hasScholarship"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Scholarship?
          </Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="totalCourseFee">Total Course Fee</Label>
        {hasScholarship ? (
          <>
            <p className="text-sm text-muted-foreground">
              Without Scholarship:{' '}
              <span className="font-semibold text-gray-800">
                {currencySymbol}
                {formatCurrency(totalCourseFeeBeforeScholarship)}
              </span>
            </p>
            <p className="text-lg font-semibold text-[#004097]">
              With Scholarship: {currencySymbol}
              {formatCurrency(totalCourseFeeAfterScholarship)}
            </p>
            <p className="text-sm text-muted-foreground">
              (PHP: {'\u20B1'}{formatPhp(totalCourseFeeAfterScholarship)})
            </p>
            <p className="text-sm text-green-600">
              You save: {currencySymbol}
              {formatCurrency(scholarshipAmount)}
            </p>
          </>
        ) : (
          <>
            <p className="text-lg font-semibold text-[#004097]">
              {currencySymbol}
              {formatCurrency(totalCourseFeeBeforeScholarship)}
            </p>
            <p className="text-sm text-muted-foreground">
              (PHP: {'\u20B1'}{formatPhp(totalCourseFeeBeforeScholarship)})
            </p>
          </>
        )}
      </div>
    </>
  );
}
