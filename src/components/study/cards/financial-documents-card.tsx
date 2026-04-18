'use client';

import { Check, FileText } from 'lucide-react';
import type { Answers, ModalID } from '@/lib/core/types';
import { Skeleton } from '@/components/ui/display/skeleton';
import type { FinancialDocumentCalculationResult } from '@/services/financials/common';
import type { ExchangeRates } from '@/services/exchange-rate-service';
import { getCurrencyInfo } from '@/lib/currency';
import { Checkbox } from '@/components/ui/forms/checkbox';
import { Label } from '@/components/ui/forms/label';
import {
  AmountRow,
  FinancialDocumentsCardShell,
  REQUIRED_DOCUMENTS,
  formatCurrency,
} from './financial-documents-card.components';

interface FinancialDocumentsCardProps {
  answers: Answers;
  onAnswerChange: (id: keyof Answers, value: any) => void;
  setModalId: (id: ModalID | null) => void;
  financialDocuments: FinancialDocumentCalculationResult | null;
  isLoading: boolean;
  error: string | null;
  exchangeRates: ExchangeRates | null;
}

export default function FinancialDocumentsCard({
  answers,
  onAnswerChange,
  setModalId,
  financialDocuments,
  isLoading,
  error,
  exchangeRates,
}: FinancialDocumentsCardProps) {
  const { currencyCode, currencySymbol, phpRate } = getCurrencyInfo(
    answers.studyDestination,
    exchangeRates,
  );

  const isIreland = answers.studyDestination === 'Ireland';
  const isNewZealand = answers.studyDestination === 'New Zealand';
  const isAustralia = answers.studyDestination === 'Australia';
  const isCanada = answers.studyDestination === 'Canada';

  if (isLoading) {
    return (
      <FinancialDocumentsCardShell isAustralia={isAustralia} onInfoClick={() => undefined}>
        <Skeleton className="h-[400px] w-full" />
      </FinancialDocumentsCardShell>
    );
  }

  if (error || !financialDocuments || !exchangeRates) {
    return (
      <FinancialDocumentsCardShell isAustralia={isAustralia} onInfoClick={() => undefined}>
        <div className="flex justify-center items-center">
          <p className="text-red-500">{error || 'Could not load financial details.'}</p>
        </div>
      </FinancialDocumentsCardShell>
    );
  }

  const {
    oneYearTuitionFee,
    costOfLiving,
    airfare,
    totalFunds,
    partnerCostOfLiving,
    dependentCostOfLiving,
    nzSchoolAgeCost,
    nzNonSchoolAgeCost,
  } = financialDocuments;

  const oneYearTuitionFeePHP = oneYearTuitionFee * phpRate;
  const costOfLivingPHP = costOfLiving * phpRate;
  const partnerCostOfLivingPHP = partnerCostOfLiving * phpRate;
  const airfarePHP = airfare * phpRate;
  const dependentCostOfLivingPHP = dependentCostOfLiving * phpRate;
  const nzSchoolAgeCostPHP = nzSchoolAgeCost * phpRate;
  const nzNonSchoolAgeCostPHP = nzNonSchoolAgeCost * phpRate;
  const totalFundsPHP = totalFunds * phpRate;

  const bankStatementMonths = isIreland || isCanada || isNewZealand ? '6' : '3';
  const airfareHint = `${currencySymbol}${isNewZealand ? '2,500' : '2,000'}/person`;

  return (
    <FinancialDocumentsCardShell
      isAustralia={isAustralia}
      onInfoClick={() => setModalId('AUSTRALIA_FINANCIAL_CAPACITY_INFO')}
    >
      <div className="space-y-4">
        {isNewZealand && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="financialEvidenceFor1YearOnly"
                checked={answers.financialEvidenceFor1YearOnly === 'true'}
                onCheckedChange={(checked) =>
                  onAnswerChange('financialEvidenceFor1YearOnly', checked ? 'true' : 'false')
                }
              />
              <Label htmlFor="financialEvidenceFor1YearOnly" className="cursor-pointer">
                Financial Evidence for 1 Year Only?
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="financialEvidenceFor2YearsOnly"
                checked={answers.financialEvidenceFor2YearsOnly === 'true'}
                onCheckedChange={(checked) =>
                  onAnswerChange('financialEvidenceFor2YearsOnly', checked ? 'true' : 'false')
                }
              />
              <Label htmlFor="financialEvidenceFor2YearsOnly" className="cursor-pointer">
                Financial Evidence for 2 Years Only?
              </Label>
            </div>
          </div>
        )}

        <p className="text-center text-muted-foreground">
          Funds needed for Student Visa Applicant (in {currencyCode})
        </p>

        {oneYearTuitionFee > 0 && (
          <AmountRow
            label="1 Year Tuition Fee"
            value={oneYearTuitionFee}
            phpValue={oneYearTuitionFeePHP}
            currencySymbol={currencySymbol}
          />
        )}

        <AmountRow
          label={isIreland ? '1 Year Cost of Living' : isCanada ? 'Cost of Living' : 'Student: Cost of Living'}
          value={costOfLiving}
          phpValue={costOfLivingPHP}
          currencySymbol={currencySymbol}
          hint={isNewZealand ? `(${currencySymbol}20,000/year)` : undefined}
        />

        {!isCanada && partnerCostOfLiving > 0 && (
          <AmountRow
            label="Partner: Cost of Living"
            value={partnerCostOfLiving}
            phpValue={partnerCostOfLivingPHP}
            currencySymbol={currencySymbol}
            hint={isNewZealand ? `(${currencySymbol}4,200/year)` : undefined}
          />
        )}

        {!isNewZealand && !isCanada && dependentCostOfLiving > 0 && (
          <AmountRow
            label="Dependent: Cost of Living"
            value={dependentCostOfLiving}
            phpValue={dependentCostOfLivingPHP}
            currencySymbol={currencySymbol}
            hint={`(${currencySymbol}4,449/person/year)`}
          />
        )}

        {isNewZealand && nzSchoolAgeCost > 0 && (
          <AmountRow
            label="Dependent: Cost of Living (School Age)"
            value={nzSchoolAgeCost}
            phpValue={nzSchoolAgeCostPHP}
            currencySymbol={currencySymbol}
            hint={`(${currencySymbol}17,000/person/year)`}
          />
        )}

        {isNewZealand && nzNonSchoolAgeCost > 0 && (
          <AmountRow
            label="Dependent: Cost of Living (Non-School Age)"
            value={nzNonSchoolAgeCost}
            phpValue={nzNonSchoolAgeCostPHP}
            currencySymbol={currencySymbol}
            hint={`(${currencySymbol}4,200/person/year)`}
          />
        )}

        {!isIreland && airfare > 0 && (
          <AmountRow
            label="Airfare (Round Trip)"
            value={airfare}
            phpValue={airfarePHP}
            currencySymbol={currencySymbol}
            hint={`(${airfareHint})`}
          />
        )}

        <hr className="my-4 border-t border-gray-300" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="font-bold">Total Funds</p>
          <div className="text-left sm:text-right">
            <p className="text-lg md:text-2xl font-bold break-words" style={{ color: 'crimson' }}>
              {currencySymbol}
              {formatCurrency(totalFunds)}
            </p>
            <p className="text-xs md:text-sm text-muted-foreground">
              (PHP: {'\u20B1'}{formatCurrency(totalFundsPHP)})
            </p>
          </div>
        </div>
        <hr className="my-4 border-t border-gray-300" />

        <div>
          <div className="flex justify-center items-center mb-2">
            <FileText className="h-6 w-6 mr-2 text-yellow-500" />
            <h4 className="text-center font-semibold" style={{ color: '#004097' }}>
              Documents required by the school or embassy
            </h4>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <li className="flex items-start">
              <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" />
              <span>{REQUIRED_DOCUMENTS[0]}</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" />
              <span>Bank Statement ({bankStatementMonths} months history)</span>
            </li>
            {REQUIRED_DOCUMENTS.slice(1).map((item) => (
              <li key={item} className="flex items-start">
                <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-red-500 italic text-center mt-4 text-sm">
            Note: This is not an exhaustive list. All documents must be in PDF format,
            colored, and high-quality.
          </p>
        </div>
      </div>
    </FinancialDocumentsCardShell>
  );
}

