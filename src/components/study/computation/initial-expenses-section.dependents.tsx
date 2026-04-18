'use client';

import type { FinancialCalculationResult } from '@/services/financials/common';
import { InitialExpensesDependentsAustraliaRows } from '@/components/study/computation/initial-expenses-section.dependents-au';
import { InitialExpensesDependentsNewZealandRows } from '@/components/study/computation/initial-expenses-section.dependents-nz';
import { InitialExpensesDependentsCanadaRows } from '@/components/study/computation/initial-expenses-section.dependents-ca';

interface InitialExpensesDependentsRowsProps {
  paymentDetails: FinancialCalculationResult;
  currencySymbol: string;
  phpRate: number;
  hasDependents: boolean;
  isAustralia: boolean;
  isNewZealand: boolean;
  isCanada: boolean;
}

export function InitialExpensesDependentsRows({
  paymentDetails,
  currencySymbol,
  phpRate,
  hasDependents,
  isAustralia,
  isNewZealand,
  isCanada,
}: InitialExpensesDependentsRowsProps) {
  if (!hasDependents) {
    return null;
  }

  return (
    <>
      {isAustralia && (
        <InitialExpensesDependentsAustraliaRows
          paymentDetails={paymentDetails}
          currencySymbol={currencySymbol}
          phpRate={phpRate}
        />
      )}

      {isNewZealand && (
        <InitialExpensesDependentsNewZealandRows
          paymentDetails={paymentDetails}
          currencySymbol={currencySymbol}
          phpRate={phpRate}
        />
      )}

      {isCanada && (
        <InitialExpensesDependentsCanadaRows
          paymentDetails={paymentDetails}
          currencySymbol={currencySymbol}
          phpRate={phpRate}
        />
      )}
    </>
  );
}
