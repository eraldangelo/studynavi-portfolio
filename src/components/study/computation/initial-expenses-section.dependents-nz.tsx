'use client';

import type { FinancialCalculationResult } from '@/services/financials/common';
import { formatNumber } from '@/lib/core/utils';
import TableRow from '@/components/study/computation/table-row';

interface InitialExpensesDependentsNewZealandRowsProps {
  paymentDetails: FinancialCalculationResult;
  currencySymbol: string;
  phpRate: number;
}

export function InitialExpensesDependentsNewZealandRows({
  paymentDetails,
  currencySymbol,
  phpRate,
}: InitialExpensesDependentsNewZealandRowsProps) {
  return (
    <>
      <TableRow label="Additional Fees for Dependents" isSubHeader />
      <TableRow
        label={(
          <div>
            <span>Dependent Medical</span>
            <span className="block text-xs font-normal text-muted-foreground">
              ({currencySymbol}
              {formatNumber(7680 / phpRate)}
              /person)
            </span>
          </div>
        )}
        value={paymentDetails.dependentMedicalExamFee}
        phpValue={paymentDetails.dependentMedicalExamFee * phpRate}
        symbol={currencySymbol}
      />
      <TableRow
        label={(
          <div>
            <span>Dependent Visa</span>
            <span className="block text-xs font-normal text-muted-foreground">(18 and over)</span>
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
            <span className="block text-xs font-normal text-muted-foreground">(Non-School Age)</span>
          </div>
        )}
        value={paymentDetails.dependentVisaFeeNonSchoolAge}
        phpValue={paymentDetails.dependentVisaFeeNonSchoolAge * phpRate}
        symbol={currencySymbol}
      />
      <TableRow
        label={(
          <div>
            <span>Dependent Visa</span>
            <span className="block text-xs font-normal text-muted-foreground">(School Age)</span>
          </div>
        )}
        value={paymentDetails.dependentVisaFeeSchoolAge}
        phpValue={paymentDetails.dependentVisaFeeSchoolAge * phpRate}
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
