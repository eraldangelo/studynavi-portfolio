'use client';

import { Label } from "@/components/ui/forms/label";

interface ExchangeRateSectionProps {
  currentTime: string | null;
  currencyCode: string;
  phpRate: number;
  countryRates: Record<string, number>;
  totalCashout: number;
  currencySymbol: string;
  hasDependents: boolean;
  isLoading: boolean;
  isIreland: boolean;
  isAustralia: boolean;
  isNewZealand: boolean;
  isCanada: boolean;
}

const ExchangeRateSection = ({
  currentTime,
  currencyCode,
  phpRate,
  countryRates,
  totalCashout,
  currencySymbol,
  hasDependents,
  isLoading,
  isIreland,
  isAustralia,
  isNewZealand,
  isCanada
}: ExchangeRateSectionProps) => {
  
  const formatCurrency = (value: number) => 
    value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  const formatPhp = (value: number) => 
    (value * phpRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="border-t pt-6 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
        <div className="space-y-1 text-left">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading rates...</p>
          ) : (
            <>
              <p className="text-sm font-bold text-muted-foreground">
                As of {currentTime}
              </p>
              {isIreland || isAustralia || isNewZealand || isCanada ? (
                <p className="text-sm text-muted-foreground">{currencyCode} 1.00 = PHP ₱{phpRate.toFixed(2)}</p>
              ) : (
                Object.entries(countryRates).map(([code, rate]) => (
                  <p key={code} className="text-sm text-muted-foreground">{code} 1.00 = PHP ₱{rate.toFixed(2)}</p>
                ))
              )}
            </>
          )}
        </div>
        
        <div className="space-y-2 text-left md:text-right">
          <Label className="text-lg font-bold">
            {hasDependents ? "Total Cashout for Student Visa and Dependent/s" : "Total Cashout for student visa"}
          </Label>
          <p className="text-3xl font-bold text-[#004097]">
            {currencySymbol}{formatCurrency(totalCashout)}
          </p>
          <p className="text-base text-muted-foreground">(PHP: ₱{formatPhp(totalCashout)})</p>
          <p className="text-xs text-red-500 italic">※ Please note that amounts may change due to exchange rate fluctuations or government policies.</p>
        </div>
      </div>
    </div>
  );
};

export default ExchangeRateSection;