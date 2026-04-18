'use client';

import type { Answers } from '@/lib/core/types';

export function canDownloadNonGenuineRecommendations(answers: Answers): boolean {
  const recs =
    answers.nonGenuineRecommendations && Array.isArray(answers.nonGenuineRecommendations)
      ? answers.nonGenuineRecommendations
      : [
          {
            recommendedSchool: answers.recommendedSchool || '',
            recommendedProgram: answers.recommendedProgram || '',
            programDuration: answers.recommendedProgramDuration || '',
            englishTestRequirement: answers.recommendedEnglishTestRequirement || '',
            approximateCost: answers.recommendedApproximateCost || '',
            briefInfo: answers.recommendedBriefInfo || '',
          },
        ];

  return (
    recs.length > 0
    && recs.every((entry) => {
      const hasSchool = !!(entry.recommendedSchool || '').toString().trim();
      const hasProgram = !!(entry.recommendedProgram || '').toString().trim();
      const briefLen = (entry.briefInfo || '').trim().length;
      return hasSchool && hasProgram && briefLen >= 150;
    })
  );
}

export function isReviewStepActive(
  isNonGenuineFlow: boolean,
  currentStep: number,
  effectiveTotalSteps: number,
): boolean {
  return !isNonGenuineFlow && currentStep === effectiveTotalSteps;
}

type PdfPreviewPrerequisites = {
  isReviewStep: boolean;
  isLoadingRates: boolean;
  exchangeRates: unknown;
  paymentDetails: unknown;
  financialDocuments: unknown;
};

export function shouldGeneratePdfPreview({
  isReviewStep,
  isLoadingRates,
  exchangeRates,
  paymentDetails,
  financialDocuments,
}: PdfPreviewPrerequisites): boolean {
  return (
    isReviewStep
    && !isLoadingRates
    && !!exchangeRates
    && !!paymentDetails
    && !!financialDocuments
  );
}

export function isDownloadPdfDisabled(isDownloading: boolean, pdfUrl: string | null): boolean {
  return isDownloading || !pdfUrl;
}

export const waitForNextPaint = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });
