'use client';

import { Landmark, Info } from 'lucide-react';
import { Button } from '@/components/ui/forms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';

type AmountRowProps = {
  label: string;
  value: number;
  phpValue: number;
  currencySymbol: string;
  hint?: string;
};

export const REQUIRED_DOCUMENTS = [
  'Bank Certificate',
  'Affidavit of Support / Statutory Declaration',
  'Proof of relationship to the sponsor',
  '2 valid IDs of the sponsor',
  'Proof of Ongoing Income (Employment Certificate, Income Tax Return, Business Permit)',
];

export const formatCurrency = (value: number) =>
  value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function FinancialDocumentsCardShell(props: {
  isAustralia: boolean;
  onInfoClick: () => void;
  children: React.ReactNode;
}) {
  const { isAustralia, onInfoClick, children } = props;
  return (
    <Card className="w-full">
      <CardHeader className="p-4 pb-4 md:p-6 md:pb-4">
        <div className="flex items-center space-x-4">
          <Landmark className="h-8 w-8 text-yellow-500" />
          <CardTitle className="flex items-center gap-2" style={{ color: '#004097' }}>
            Financial Documents Details
            {isAustralia && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onInfoClick}
              >
                <Info className="h-4 w-4 text-blue-500" />
              </Button>
            )}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 md:p-6 md:pt-0">{children}</CardContent>
    </Card>
  );
}

export function AmountRow({ label, value, phpValue, currencySymbol, hint }: AmountRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div>
        <p className="font-medium">{label}</p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      <div className="text-left sm:text-right">
        <p className="text-lg md:text-2xl font-bold break-words" style={{ color: '#004097' }}>
          {currencySymbol}
          {formatCurrency(value)}
        </p>
        <p className="text-xs md:text-sm text-muted-foreground">
          (PHP: ₱{formatCurrency(phpValue)})
        </p>
      </div>
    </div>
  );
}
