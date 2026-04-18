
'use client';

import type { Answers } from "@/lib/core/types";
import { Skeleton } from "@/components/ui/display/skeleton";
import { format } from 'date-fns';
import type { FinancialCalculationResult, FinancialDocumentCalculationResult } from "@/services/financials/common";
import type { ExchangeRates } from "@/services/exchange-rate-service";
import VisaProcessCard from "@/components/study/cards/visa-process-card";
import ProgramDetailsSection from "../computation/program-details-section";
import InitialExpensesSection from "../computation/initial-expenses-section";
import EvidenceOfFundsSection from "../computation/evidence-of-funds-section";
import RequiredDocumentsSection from "../computation/required-documents-section";
import ComputationSheetFooter from "../computation/computation-sheet-footer";


interface ComputationSheetProps {
  answers: Answers;
  paymentDetails: FinancialCalculationResult | null;
  financialDocuments: FinancialDocumentCalculationResult | null;
  exchangeRates: ExchangeRates | null;
  isLoadingRates: boolean;
  rateError: string | null;
}


export default function ComputationSheet({ answers, paymentDetails, financialDocuments, exchangeRates, isLoadingRates, rateError }: ComputationSheetProps) {

    if (isLoadingRates || !paymentDetails || !financialDocuments || !exchangeRates) {
        return <Skeleton className="h-[1000px] w-full" />
    }
    
    if (rateError) {
        return <p className="text-red-500 text-center">{rateError}</p>
    }

    const generatedDate = format(new Date(), 'dd-MMM-yyyy HH:mm:ss');
    
    return (
        <div id="computation-sheet" className="bg-white pt-4 text-xs">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pdf-section">
                <ProgramDetailsSection answers={answers} paymentDetails={paymentDetails} exchangeRates={exchangeRates} />
                <InitialExpensesSection answers={answers} paymentDetails={paymentDetails} exchangeRates={exchangeRates} />
            </div>

            <div className="mt-4 pdf-section">
                <EvidenceOfFundsSection answers={answers} financialDocuments={financialDocuments} exchangeRates={exchangeRates} />
            </div>
            
            <div className="mt-6 pdf-section">
                <RequiredDocumentsSection answers={answers} />
            </div>

            <div className="my-4 border-t border-gray-200 pdf-section">
                <div className="mt-4 text-[12px] font-medium space-y-2 px-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                        <div className="space-y-2">
                            <div className="flex items-start gap-1.5">
                                <span className="italic text-red-600">※</span>
                                <p className="italic text-red-600">Email all documents in PDF format. They must be in color and high quality.</p>
                            </div>
                            <div className="flex items-start gap-1.5">
                                <span className="italic text-red-600">※</span>
                                <p className="italic text-red-600">Do not use a phone camera as an alternative to a scanner.</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-start gap-1.5">
                                <span className="italic text-red-600">※</span>
                                <p className="italic text-red-600">Documents should be organized and properly labeled.</p>
                            </div>
                            <div className="flex items-start gap-1.5">
                                <span className="italic text-red-600">※</span>
                                <p className="italic text-red-600">Unreadable or cropped scans can cause delays in the school or visa application.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 border-t pt-4 pdf-section">
                <VisaProcessCard answers={answers} showIcons={false} showDescription={false} mini={true}/>
            </div>

            <ComputationSheetFooter generatedDate={generatedDate} answers={answers} exchangeRates={exchangeRates} />
        </div>
    );
}
