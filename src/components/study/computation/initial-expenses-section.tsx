
'use client';

import type { Answers } from "@/lib/core/types";
import type { FinancialCalculationResult } from "@/services/financials/common";
import type { ExchangeRates } from "@/services/exchange-rate-service";
import { getCurrencyInfo } from "@/lib/currency";
import { Wallet } from "lucide-react";
import TableRow from "./table-row";
import { InitialExpensesDependentsRows } from "@/components/study/computation/initial-expenses-section.dependents";

interface InitialExpensesSectionProps {
    answers: Answers;
    paymentDetails: FinancialCalculationResult;
    exchangeRates: ExchangeRates;
}

export default function InitialExpensesSection({ answers, paymentDetails, exchangeRates }: InitialExpensesSectionProps) {
    const { currencySymbol, phpRate } = getCurrencyInfo(answers.studyDestination, exchangeRates);

    const paymentTypeLabels: { [key: string]: string } = {
        '3_months': '1st Payment Fee',
        '1_semester': '1 Semester Fee',
        '1_year': '1 Year School Fee',
        'tuition_fee_deposit_only': 'Deposit Amount',
        'manual': 'Tuition Fee'
    };
    const paymentLabel = paymentTypeLabels[answers.paymentType || ''] || '1 Semester Fee';

    const hasScholarship = !!(answers.scholarshipAmount || answers.scholarshipPercentage);
    const scholarshipOnInitialPayment = paymentDetails.totalPaymentDueBeforeScholarship - paymentDetails.totalPaymentDue;
    const hasDependents = !!(answers.visaAssistance && answers.visaAssistance !== 'No');
    const isIreland = answers.studyDestination === 'Ireland';
    const isNewZealand = answers.studyDestination === 'New Zealand';
    const isAustralia = answers.studyDestination === 'Australia';
    const isCanada = answers.studyDestination === 'Canada';

    return (
        <table className="w-full text-xs mb-4">
            <thead>
                <tr className="bg-[#004097] text-yellow-100 font-bold">
                    <th colSpan={2} className="p-1.5 text-center">
                        <div className="flex justify-center items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            <span>Summary of Initial Expenses</span>
                        </div>
                    </th>
                </tr>
            </thead>
            <tbody>
                <TableRow label={paymentLabel} value={paymentDetails.totalPaymentDueBeforeScholarship} phpValue={paymentDetails.totalPaymentDueBeforeScholarship * phpRate} symbol={currencySymbol} />
                {hasScholarship && scholarshipOnInitialPayment > 0 && (
                    <TableRow label="Scholarship" value={-scholarshipOnInitialPayment} phpValue={-(scholarshipOnInitialPayment * phpRate)} symbol={currencySymbol} isScholarship={true} />
                )}
                {paymentDetails.insuranceCost > 0 && (
                    <TableRow 
                        label={
                            isAustralia ? (
                                <div>
                                    <span>OSHC</span>
                                    <span className="block text-xs font-normal text-muted-foreground">(Insurance)</span>
                                </div>
                            ) : "Insurance"
                        }
                        value={paymentDetails.insuranceCost} 
                        phpValue={paymentDetails.insuranceCost * phpRate} 
                        symbol={currencySymbol} 
                    />
                )}
                {paymentDetails.protectionOfEnrolledLearnersFee > 0 && (
                <TableRow label="Protection of Enrolled Learners" value={paymentDetails.protectionOfEnrolledLearnersFee} phpValue={paymentDetails.protectionOfEnrolledLearnersFee * phpRate} symbol={currencySymbol} />
                )}
                {paymentDetails.englishTestFee > 0 && (
                     <TableRow 
                        label={
                            <div>
                                <span>English Test</span>
                                <span className="block text-xs font-normal text-muted-foreground">(IELTS/PTE)</span>
                            </div>
                        } 
                        value={paymentDetails.englishTestFee} 
                        phpValue={paymentDetails.englishTestFee * phpRate} 
                        symbol={currencySymbol} 
                    />
                )}
                {paymentDetails.visaFee > 0 && (
                    <TableRow label="Student Visa fee" value={paymentDetails.visaFee} phpValue={paymentDetails.visaFee * phpRate} symbol={currencySymbol} />
                )}
                {isCanada && (
                    <>
                        <TableRow 
                            label={
                                <div>
                                    <span>Medical Exam</span>
                                    {answers.requiredTBTest === 'true' && (
                                        <span className="block text-xs font-normal text-red-600">(with TB Test)</span>
                                    )}
                                </div>
                            } 
                            value={paymentDetails.medicalExaminationFee} 
                            phpValue={(paymentDetails.medicalExaminationFee * phpRate)} 
                            symbol={currencySymbol}
                        />
                        {paymentDetails.biometricsFee > 0 && (
                             <TableRow 
                                label={hasDependents ? "Family Biometrics Fee" : "Biometrics Fee"}
                                value={paymentDetails.biometricsFee} 
                                phpValue={(paymentDetails.biometricsFee * phpRate)} 
                                symbol={currencySymbol} 
                            />
                        )}
                    </>
                )}
                 {!isIreland && !isCanada && (
                    <>
                        <TableRow 
                            label={
                                <div>
                                    <span>Medical Exam</span>
                                    {answers.requiredTBTest === 'true' && (
                                        <span className="block text-xs font-normal text-red-600">(with TB Test)</span>
                                    )}
                                </div>
                            } 
                            value={paymentDetails.medicalExaminationFee} 
                            phpValue={(paymentDetails.medicalExaminationFee * phpRate)} 
                            symbol={currencySymbol}
                        />
                        {paymentDetails.biometricsFee > 0 && (
                            <TableRow 
                                label={"Biometrics Fee"}
                                value={paymentDetails.biometricsFee} 
                                phpValue={(paymentDetails.biometricsFee * phpRate)} 
                                symbol={currencySymbol} 
                            />
                        )}
                    </>
                )}
                
                <InitialExpensesDependentsRows
                    paymentDetails={paymentDetails}
                    currencySymbol={currencySymbol}
                    phpRate={phpRate}
                    hasDependents={hasDependents}
                    isAustralia={isAustralia}
                    isNewZealand={isNewZealand}
                    isCanada={isCanada}
                />

                <TableRow label="TOTAL INITIAL CASHOUT" value={paymentDetails.totalCashout} phpValue={paymentDetails.totalCashout * phpRate} symbol={currencySymbol} isTotal={true} />
            </tbody>
        </table>
    );
}
