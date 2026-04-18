'use client';
import { useEffect, useState } from 'react';
import { QUESTIONS } from '@/lib/core/constants';
import { Loader2 } from 'lucide-react';
import type { useStudyWizard } from '@/hooks/study/use-study-wizard';
import { WizardContent } from './wizard-content';
import { WizardNavigation } from './wizard-navigation';
import { preloadPdfAssetsForDestination } from '@/lib/pdf/pdf-assets';
import InfoModal from '@/components/common/dialogs/info-modal';
import { MODAL_CONTENT } from '@/lib/modals/content';
import { WizardCompleteView, WizardReviewView } from './study-wizard-views';
import {
  canDownloadNonGenuineRecommendations,
  isReviewStepActive,
} from './study-wizard.utils';
import { useWizardPdfFlow } from './pdf/use-wizard-pdf-flow';
import { useNonGenuinePdfFlow } from './pdf/use-non-genuine-pdf-flow';
import { isE2EMockDataEnabled } from '@/lib/env/runtime-flags';

type StudyWizardProps = {
  wizard: ReturnType<typeof useStudyWizard>;
};

export function StudyWizard({ wizard }: StudyWizardProps) {
  const {
    currentStep,
    answers,
    isLoading,
    isComplete,
    isHydrated,
    isAnswered,
    modalId,
    setModalId,
    isNonGenuineFlow,
    effectiveTotalSteps,
    handleAnswerChange,
    handleNext,
    handleBack,
    handleReset,
    handleClearAnswers,
    paymentDetails,
    financialDocuments,
    isLoadingRates,
    rateError,
    exchangeRates,
    handleFormSubmit,
  } = wizard;

  const [isIos, setIsIos] = useState(false);
  const isE2EMockData = isE2EMockDataEnabled();

  useEffect(() => {
    setIsIos(/iPad|iPhone|iPod/.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    preloadPdfAssetsForDestination(answers.studyDestination);
  }, [isHydrated, answers.studyDestination]);

  const isReviewStep = isReviewStepActive(isNonGenuineFlow, currentStep, effectiveTotalSteps);
  const canDownloadNonGenuine = canDownloadNonGenuineRecommendations(answers);
  const {
    pdfUrl,
    isPreviewLoading,
    isDownloading,
    handleDownloadPdf,
  } = useWizardPdfFlow({
    answers,
    exchangeRates,
    paymentDetails,
    financialDocuments,
    isReviewStep,
    isLoadingRates,
    onComplete: handleFormSubmit,
  });

  const { isNonGenuineDownloading, handleDownloadNonGenuinePdf } = useNonGenuinePdfFlow({
    answers,
    exchangeRates,
    paymentDetails,
    financialDocuments,
    canPrepare: isNonGenuineFlow && canDownloadNonGenuine,
    onComplete: handleFormSubmit,
    isE2EMockData,
  });

  if (!isHydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 pb-24 pt-6 sm:pb-12 sm:pt-8">
      <main className="mx-auto max-w-4xl">
        {isComplete ? (
          <WizardCompleteView schoolName={answers.schoolName} onCreateAnother={handleClearAnswers} />
        ) : isReviewStep ? (
          <WizardReviewView
            pdfUrl={pdfUrl}
            isPreviewLoading={isPreviewLoading}
            isIos={isIos}
            isDownloading={isDownloading}
            onBack={handleBack}
            onStartOver={handleClearAnswers}
            onDownload={handleDownloadPdf}
          />
        ) : (
          <div key={currentStep} className="space-y-4 animate-in fade-in-0 duration-500">
            <WizardContent
              currentStep={currentStep}
              answers={answers}
              handleAnswerChange={handleAnswerChange}
              setModalId={setModalId}
              questions={QUESTIONS}
              paymentDetails={paymentDetails}
              financialDocuments={financialDocuments}
              isLoadingRates={isLoadingRates}
              rateError={rateError}
              exchangeRates={exchangeRates}
            />
            <WizardNavigation
              currentStep={currentStep}
              effectiveTotalSteps={effectiveTotalSteps}
              isComplete={isComplete}
              isAnswered={isAnswered}
              isLoading={isLoading}
              handleBack={handleBack}
              handleNext={handleNext}
              handleReset={handleReset}
              handleFinish={handleFormSubmit}
              isNonGenuineFlow={isNonGenuineFlow}
              onDownloadNonGenuine={handleDownloadNonGenuinePdf}
              canDownloadNonGenuine={canDownloadNonGenuine}
              isDownloadingNonGenuine={isNonGenuineDownloading}
            />
          </div>
        )}
      </main>
      <InfoModal
        isOpen={!!modalId}
        content={modalId ? MODAL_CONTENT[modalId as any] : null}
        onClose={() => setModalId(null)}
        onConfirm={() => setModalId(null)}
        answers={answers}
      />
    </div>
  );
}
