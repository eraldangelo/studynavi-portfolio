'use client';

import { Checkbox } from '@/components/ui/forms/checkbox';
import { Label } from '@/components/ui/forms/label';

type FormatFn = (value: number) => string;

interface FeeItemProps {
  label: string;
  subtitle?: string;
  value: number;
  currencySymbol: string;
  formatCurrency: FormatFn;
  formatPhp: FormatFn;
}

export function DependentFeeItem({
  label,
  subtitle,
  value,
  currencySymbol,
  formatCurrency,
  formatPhp,
}: FeeItemProps) {
  return (
    <div className="space-y-2">
      <Label>
        {subtitle ? (
          <div>
            <span>{label}</span>
            <span className="block text-xs font-normal text-muted-foreground">({subtitle})</span>
          </div>
        ) : (
          label
        )}
      </Label>
      <p className="text-lg font-semibold text-[#004097]">
        {currencySymbol}
        {formatCurrency(value)}
      </p>
      <p className="text-sm text-muted-foreground">
        (PHP: {'\u20B1'}
        {formatPhp(value)})
      </p>
    </div>
  );
}

interface AssistanceItemProps extends FeeItemProps {
  isSubsequentEntry: boolean;
  setIsSubsequentEntry: (checked: boolean) => void;
}

export function DependentAssistanceItem({
  label,
  value,
  currencySymbol,
  formatCurrency,
  formatPhp,
  isSubsequentEntry,
  setIsSubsequentEntry,
}: AssistanceItemProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <p className="text-lg font-semibold text-[#004097]">
        {currencySymbol}
        {formatCurrency(value)}
      </p>
      <p className="text-sm text-muted-foreground">
        (PHP: {'\u20B1'}
        {formatPhp(value)})
      </p>
      <div className="flex items-center space-x-2 pt-2">
        <Checkbox
          id="isSubsequentEntry"
          checked={isSubsequentEntry}
          onCheckedChange={(checked) => setIsSubsequentEntry(checked as boolean)}
          className="h-3 w-3"
        />
        <Label
          htmlFor="isSubsequentEntry"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          Subsequent Entry?
        </Label>
      </div>
    </div>
  );
}
