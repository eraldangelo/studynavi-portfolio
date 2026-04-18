
'use client';

import type { Answers } from "@/lib/core/types";
import type { FinancialCalculationResult } from "@/services/financials/common";
import type { ExchangeRates } from "@/services/exchange-rate-service";
import { getCurrencyInfo } from "@/lib/currency";
import { BookOpenText } from "lucide-react";
import { getNumber } from "@/services/financials/common";
import { formatNumber } from "@/lib/core/utils";
import TableRow from "./table-row";


interface ProgramDetailsSectionProps {
    answers: Answers;
    paymentDetails: FinancialCalculationResult;
    exchangeRates: ExchangeRates;
}

export default function ProgramDetailsSection({ answers, paymentDetails, exchangeRates }: ProgramDetailsSectionProps) {
    const { currencySymbol } = getCurrencyInfo(answers.studyDestination, exchangeRates);
    const hasScholarship = !!(answers.scholarshipAmount || answers.scholarshipPercentage);

    return (
        <table className="w-full text-xs mb-4">
            <thead>
                <tr className="bg-[#004097] text-yellow-100 font-bold">
                    <th colSpan={2} className="p-1.5 text-center">
                        <div className="flex justify-center items-center gap-2">
                            <BookOpenText className="h-4 w-4" />
                            <span>Program Details</span>
                        </div>
                    </th>
                </tr>
            </thead>
            <tbody>
                <TableRow label="Annual Course Fee" value={getNumber(answers.annualTuitionFee)} symbol={currencySymbol} />
                <TableRow label="Total Course Fee" value={paymentDetails.totalCourseFeeBeforeScholarship} symbol={currencySymbol} />
                {hasScholarship && (
                    <>
                    <tr className="border-b">
                        <td className="py-0.5 px-1.5 font-bold text-gray-800">
                            {answers.scholarshipPercentage ? 'Scholarship Percentage' : 'Annual Scholarship'}
                        </td>
                        <td className="py-0.5 px-1.5 text-right font-bold" style={{color: '#004097'}}>
                            {answers.scholarshipPercentage 
                                ? `${answers.scholarshipPercentage}%` 
                                : `${currencySymbol}${formatNumber(getNumber(answers.scholarshipAmount))}`}
                        </td>
                    </tr>
                    <TableRow label="Annual Course Fee w/ Scholarship" value={paymentDetails.totalCourseFeeAfterScholarship / getNumber(answers.programDuration, true)} symbol={currencySymbol} isScholarship={true} />
                    <TableRow label="Total Course Fee w/ Scholarship" value={paymentDetails.totalCourseFeeAfterScholarship} symbol={currencySymbol} isScholarship={true} />
                    </>
                )}
            </tbody>
        </table>
    );
}
