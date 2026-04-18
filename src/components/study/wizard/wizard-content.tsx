
'use client';


import { useState, useEffect } from 'react';
import type { Answers, Question, ModalID } from "@/lib/core/types";
import type { FinancialCalculationResult, FinancialDocumentCalculationResult } from "@/services/financials/common";
import type { ExchangeRates } from "@/services/exchange-rate-service";

interface WizardContentProps {
  currentStep: number;
  answers: Answers;
  handleAnswerChange: (id: keyof Answers, value: any) => void;
  setModalId: (id: ModalID | null) => void;
  questions: Question[];
  paymentDetails: FinancialCalculationResult | null;
  financialDocuments: FinancialDocumentCalculationResult | null;
  isLoadingRates: boolean;
  rateError: string | null;
  exchangeRates: ExchangeRates | null;
}

export function WizardContent({ 
    currentStep, 
    answers, 
    handleAnswerChange, 
    setModalId,
    questions,
    paymentDetails,
    financialDocuments,
    isLoadingRates,
    rateError,
    exchangeRates
}: WizardContentProps) {
  const currentQuestions = questions.filter(q => q.step === currentStep);

  const destination = answers.studyDestination;
  const sponsor = answers.financialSponsor;
  const isNonGenuineFlow = sponsor === 'No' || ((sponsor === 'Yes' || sponsor === 'Not yet sure') && answers.isShoppingNonGenuine === 'Yes');

  // This check ensures the dependents card is shown only when:
  // 1. A marital status is selected
  // 2. The status is not "Never Married"
  // 3. The destination is NOT Ireland
  const showBringingDependents = 
    !!answers.maritalStatus && 
    answers.maritalStatus !== 'Never Married' &&
    answers.studyDestination !== 'Ireland';

  // Show Australia-specific modals on step 8 and 9
  // Only show once per step (not on every re-render)
  // Use a ref to avoid repeated modal triggers
  const [lastModalStep, setLastModalStep] = useState<number | null>(null);
  useEffect(() => {
    if (destination === 'Australia') {
      if (currentStep === 8 && lastModalStep !== 8) {
        setModalId('AUSTRALIA_EVIDENCE_OF_FUNDS');
        setLastModalStep(8);
      } else if (currentStep === 9 && lastModalStep !== 9) {
        setModalId('AUSTRALIA_MD115_INFO');
        setLastModalStep(9);
      }
    }
  }, [currentStep, destination, lastModalStep, setModalId]);

  return (
    <div className="space-y-8">
      {currentQuestions.map(question => {
          // Rule to hide the dependents card if conditions aren't met
          if (question.id === 'visaAssistance' && !showBringingDependents) {
            return null;
          }
          // Rule to hide the previous visits card if no destination is selected
          if (question.id === 'hasVisitedDestination' && !destination) {
            return null;
          }
          
          if (question.id === 'schoolAndProgram' && isNonGenuineFlow) {
            return null;
          }
          if (question.id === 'nonGenuineRecommendation' && !isNonGenuineFlow) {
            return null;
          }

          const StepComponent = question.component;
          return (
            <StepComponent 
              key={question.id}
              question={question} 
              answers={answers} 
              onAnswerChange={handleAnswerChange}
              setModalId={setModalId}
              paymentDetails={paymentDetails}
              financialDocuments={financialDocuments}
              isLoadingRates={isLoadingRates}
              rateError={rateError}
              exchangeRates={exchangeRates}
            />
          )
      })}
    </div>
  );
}
