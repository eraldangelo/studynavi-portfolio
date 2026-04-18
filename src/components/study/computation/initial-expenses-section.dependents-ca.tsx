'use client';

import type { FinancialCalculationResult } from '@/services/financials/common';
import { formatNumber } from '@/lib/core/utils';
import TableRow from '@/components/study/computation/table-row';

interface InitialExpensesDependentsCanadaRowsProps {
  paymentDetails: FinancialCalculationResult;
  currencySymbol: string;
  phpRate: number;
}

export function InitialExpensesDependentsCanadaRows({
  paymentDetails,
  currencySymbol,
  phpRate,
}: InitialExpensesDependentsCanadaRowsProps) {
  return (
    <>
      <TableRow label="Additional Fees for Dependents" isSubHeader />
      <TableRow
        label={(
          <div>
            <span>Dependent Visa</span>
            <span className="block text-xs font-normal text-muted-foreground">(Spouse w/ OWP)</span>
          </div>
        )}
        value={paymentDetails.dependentVisaFeeOver18}
        phpValue={paymentDetails.dependentVisaFeeOver18 * phpRate}
        symbol={currencySymbol}
      />
      <TableRow
        label={(
          <div>
            <span>Dependent Visa</span>
            <span className="block text-xs font-normal text-muted-foreground">(Study Permit)</span>
          </div>
        )}
        value={paymentDetails.dependentStudyPermitFee}
        phpValue={paymentDetails.dependentStudyPermitFee * phpRate}
        symbol={currencySymbol}
      />
      <TableRow
        label={(
          <div>
            <span>Dependent Visa</span>
            <span className="block text-xs font-normal text-muted-foreground">(Visitor)</span>
          </div>
        )}
        value={paymentDetails.dependentVisaFee}
        phpValue={paymentDetails.dependentVisaFee * phpRate}
        symbol={currencySymbol}
      />
      <TableRow
        label={(
          <div>
            <span>Medical</span>
            <span className="block text-xs font-normal text-muted-foreground">(0-4 years old)</span>
          </div>
        )}
        value={paymentDetails.medical0to4Fee}
        phpValue={(paymentDetails.medical0to4Fee ?? 0) * phpRate}
        symbol={currencySymbol}
      />
      <TableRow
        label={(
          <div>
            <span>Medical</span>
            <span className="block text-xs font-normal text-muted-foreground">(5-10 years old)</span>
          </div>
        )}
        value={paymentDetails.medical5to10Fee}
        phpValue={(paymentDetails.medical5to10Fee ?? 0) * phpRate}
        symbol={currencySymbol}
      />
      <TableRow
        label={(
          <div>
            <span>Medical</span>
            <span className="block text-xs font-normal text-muted-foreground">(11-14 years old)</span>
          </div>
        )}
        value={paymentDetails.medical11to14Fee}
        phpValue={(paymentDetails.medical11to14Fee ?? 0) * phpRate}
        symbol={currencySymbol}
      />
      <TableRow
        label={(
          <div>
            <span>Medical</span>
            <span className="block text-xs font-normal text-muted-foreground">(15+ years old)</span>
          </div>
        )}
        value={paymentDetails.medical15plusFee}
        phpValue={(paymentDetails.medical15plusFee ?? 0) * phpRate}
        symbol={currencySymbol}
      />
      <TableRow
        label={(
          <div>
            <span>Medical</span>
            <span className="block text-xs font-normal text-muted-foreground">(Spouse)</span>
          </div>
        )}
        value={paymentDetails.dependentMedicalExamFee}
        phpValue={paymentDetails.dependentMedicalExamFee * phpRate}
        symbol={currencySymbol}
      />
      <TableRow
        label={(
          <div>
            <span>Agency Assistance Fee</span>
            <span className="block text-xs font-normal text-muted-foreground">
              ({currencySymbol}
              {formatNumber(15000 / phpRate)}
              /person)
            </span>
          </div>
        )}
        value={paymentDetails.agencyAssistanceFee}
        phpValue={paymentDetails.agencyAssistanceFee * phpRate}
        symbol={currencySymbol}
      />
    </>
  );
}
