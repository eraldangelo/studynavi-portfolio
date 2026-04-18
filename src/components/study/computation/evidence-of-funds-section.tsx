
'use client';

import type { Answers } from "@/lib/core/types";
import type { ExchangeRates } from "@/services/exchange-rate-service";
import type { FinancialDocumentCalculationResult } from "@/services/financials/common";
import { getCurrencyInfo } from "@/lib/currency";
import { Landmark } from "lucide-react";
import { formatNumber } from "@/lib/core/utils";
import EvidenceOfFundsDocumentsList from "@/components/study/computation/evidence-of-funds-documents-list";


interface EvidenceOfFundsSectionProps {
    answers: Answers;
    financialDocuments: FinancialDocumentCalculationResult;
    exchangeRates: ExchangeRates;
}

export default function EvidenceOfFundsSection({ answers, financialDocuments, exchangeRates }: EvidenceOfFundsSectionProps) {
    const { currencySymbol, phpRate } = getCurrencyInfo(answers.studyDestination, exchangeRates);
    const isIreland = answers.studyDestination === 'Ireland';
    const isNewZealand = answers.studyDestination === 'New Zealand';
    const isCanada = answers.studyDestination === 'Canada';
    const isAustralia = answers.studyDestination === 'Australia';

    let evidenceOfFundsTitle = "Evidence of Funds";
    if (isNewZealand) {
        if (answers.financialEvidenceFor1YearOnly === 'true') {
            evidenceOfFundsTitle = "Evidence of Funds for 1 year";
        } else if (answers.financialEvidenceFor2YearsOnly === 'true') {
            evidenceOfFundsTitle = "Evidence of Funds for 2 years";
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <table className="w-full text-xs border">
                <thead>
                    <tr className="bg-[#004097] text-yellow-100 font-bold">
                        <th colSpan={2} className="p-1.5 text-center">
                            <div className="flex justify-center items-center gap-2">
                                <Landmark className="h-4 w-4" />
                                <span>{evidenceOfFundsTitle}</span>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {isIreland ? (
                        <tr className="border-b">
                            <td className="p-1.5 w-[60%] font-bold text-gray-700">1 Year Cost of Living</td>
                            <td className="p-1.5 text-right">
                                <div>
                                    <span className="font-bold" style={{color: '#004097'}}>{currencySymbol}{formatNumber(financialDocuments.costOfLiving)}</span>
                                    <span className="block text-xs font-normal text-[#004097]">({`₱${formatNumber(financialDocuments.costOfLiving * phpRate)}`})</span>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        <>
                            {financialDocuments.oneYearTuitionFee > 0 && (
                                <tr className="border-b">
                                    <td className="p-1.5 w-[60%] font-bold text-gray-700">1 Year Tuition Fee</td>
                                    <td className="p-1.5 text-right">
                                        <div>
                                            <span className="font-bold" style={{color: '#004097'}}>{currencySymbol}{formatNumber(financialDocuments.oneYearTuitionFee)}</span>
                                            <span className="block text-xs font-normal text-[#004097]">({`₱${formatNumber(financialDocuments.oneYearTuitionFee * phpRate)}`})</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            <tr className="border-b">
                                <td className="p-1.5 font-bold text-gray-700">
                                <div>
                                    {isAustralia ? (
                                        <div>
                                            <span>Cost of Living</span>
                                            <span className="block text-xs font-normal text-muted-foreground">(Student)</span>
                                        </div>
                                    ) : (
                                        <>
                                            <span>{isCanada ? 'Cost of Living' : 'Student: Cost of Living'}</span>
                                            {isNewZealand && (
                                            <span className="block text-xs font-normal text-muted-foreground">({currencySymbol}20,000/year)</span>
                                            )}
                                        </>
                                    )}
                                </div>
                                </td>
                                <td className="p-1.5 text-right">
                                    <div>
                                        <span className="font-bold" style={{color: '#004097'}}>{currencySymbol}{formatNumber(financialDocuments.costOfLiving)}</span>
                                        <span className="block text-xs font-normal text-[#004097]">({`₱${formatNumber(financialDocuments.costOfLiving * phpRate)}`})</span>
                                    </div>
                                </td>
                            </tr>
                            {financialDocuments.partnerCostOfLiving > 0 && (
                                <tr className="border-b">
                                    <td className="p-1.5 font-bold text-gray-700">
                                    <div>
                                        {isAustralia ? (
                                            <div>
                                                <span>Cost of Living</span>
                                                <span className="block text-xs font-normal text-muted-foreground">(Partner)</span>
                                            </div>
                                        ) : (
                                            <>
                                                <span>Partner: Cost of Living</span>
                                                {isNewZealand && (
                                                <span className="block text-xs font-normal text-muted-foreground">({currencySymbol}4,200/year)</span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    </td>
                                    <td className="p-1.5 text-right">
                                        <div>
                                            <span className="font-bold" style={{color: '#004097'}}>{currencySymbol}{formatNumber(financialDocuments.partnerCostOfLiving)}</span>
                                            <span className="block text-xs font-normal text-[#004097]">({`₱${formatNumber(financialDocuments.partnerCostOfLiving * phpRate)}`})</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {isNewZealand && financialDocuments.nzSchoolAgeCost > 0 && (
                                <tr className="border-b">
                                    <td className="p-1.5 font-bold text-gray-700">
                                        <div>
                                            <span>Dependent: Cost of Living (School Age)</span>
                                            <span className="block text-xs font-normal text-muted-foreground">
                                            ({currencySymbol}17,000/person/year)
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-1.5 text-right">
                                        <div>
                                            <span className="font-bold" style={{color: '#004097'}}>{currencySymbol}{formatNumber(financialDocuments.nzSchoolAgeCost)}</span>
                                            <span className="block text-xs font-normal text-[#004097]">({`₱${formatNumber(financialDocuments.nzSchoolAgeCost * phpRate)}`})</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {isNewZealand && financialDocuments.nzNonSchoolAgeCost > 0 && (
                                <tr className="border-b">
                                    <td className="p-1.5 font-bold text-gray-700">
                                        <div>
                                            <span>Dependent: Cost of Living (Non-School Age)</span>
                                            <span className="block text-xs font-normal text-muted-foreground">
                                            ({currencySymbol}4,200/person/year)
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-1.5 text-right">
                                        <div>
                                            <span className="font-bold" style={{color: '#004097'}}>{currencySymbol}{formatNumber(financialDocuments.nzNonSchoolAgeCost)}</span>
                                            <span className="block text-xs font-normal text-[#004097]">({`₱${formatNumber(financialDocuments.nzNonSchoolAgeCost * phpRate)}`})</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {!isNewZealand && financialDocuments.dependentCostOfLiving > 0 && (
                                <tr className="border-b">
                                    <td className="p-1.5 font-bold text-gray-700">
                                    <div>
                                        {isAustralia ? (
                                            <div>
                                                <span>Cost of Living</span>
                                                <span className="block text-xs font-normal text-muted-foreground">(Dependent)</span>
                                            </div>
                                        ) : (
                                            <>
                                                <span>Dependent: Cost of Living</span>
                                                {!isAustralia && (
                                                    <span className="block text-xs font-normal text-muted-foreground">
                                                        ({currencySymbol}4,449/person/year)
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    </td>
                                    <td className="p-1.5 text-right">
                                        <div>
                                            <span className="font-bold" style={{color: '#004097'}}>{currencySymbol}{formatNumber(financialDocuments.dependentCostOfLiving)}</span>
                                            <span className="block text-xs font-normal text-[#004097]">({`₱${formatNumber(financialDocuments.dependentCostOfLiving * phpRate)}`})</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {financialDocuments.airfare > 0 && (
                                <tr className="border-b">
                                    <td className="p-1.5 font-bold text-gray-700">
                                        <div>
                                            <span>Airfare (Round Trip)</span>
                                            <span className="block text-xs font-normal text-muted-foreground">({currencySymbol}{isNewZealand ? '2,500' : '2,000'}/person)</span>
                                        </div>
                                    </td>
                                    <td className="p-1.5 text-right">
                                        <div>
                                            <span className="font-bold" style={{color: '#004097'}}>{currencySymbol}{formatNumber(financialDocuments.airfare)}</span>
                                            <span className="block text-xs font-normal text-[#004097]">({`₱${formatNumber(financialDocuments.airfare * phpRate)}`})</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </>
                    )}
                    <tr className="bg-green-800 text-white">
                        <td className="p-1.5 font-bold">Total Funds in the bank</td>
                        <td className="p-1.5 text-right font-bold">
                            <div>
                                <span className="text-lg">{currencySymbol}{formatNumber(financialDocuments.totalFunds)}</span>
                                <span className="block text-xs font-normal">({`₱${formatNumber(financialDocuments.totalFunds * phpRate)}`})</span>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div>
                <EvidenceOfFundsDocumentsList
                    isCanada={isCanada}
                    isIreland={isIreland}
                    isNewZealand={isNewZealand}
                />
            </div>
        </div>
    );
}
