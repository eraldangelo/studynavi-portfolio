'use client';

import { Label } from '@/components/ui/forms/label';

type PaymentDueProps = {
  paymentType: string | null | undefined;
  label: string;
  totalPaymentDue: number;
  remainingBalanceToPay: number;
  currencySymbol: string;
  formatCurrency: (value: number) => string;
  formatPhp: (value: number) => string;
};

export function PaymentDetailsCardPaymentDue({
  paymentType,
  label,
  totalPaymentDue,
  remainingBalanceToPay,
  currencySymbol,
  formatCurrency,
  formatPhp,
}: PaymentDueProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <p data-testid="payment-due-amount" className="text-lg font-semibold text-[#004097]">
        {currencySymbol}
        {formatCurrency(totalPaymentDue)}
      </p>
      {paymentType && (
        <p className="text-sm text-muted-foreground">(PHP: {'\u20B1'}{formatPhp(totalPaymentDue)})</p>
      )}
      {paymentType === 'tuition_fee_deposit_only' && (
        <div className="space-y-2 mt-4">
          <Label>Remaining balance to pay before the class start date</Label>
          <p data-testid="payment-due-remaining-amount" className="text-lg font-semibold text-[#004097]">
            {currencySymbol}
            {formatCurrency(remainingBalanceToPay)}
          </p>
          <p className="text-sm text-muted-foreground">(PHP: {'\u20B1'}{formatPhp(remainingBalanceToPay)})</p>
        </div>
      )}
    </div>
  );
}
