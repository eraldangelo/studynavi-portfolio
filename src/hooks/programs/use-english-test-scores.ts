// @/hooks/programs/use-english-test-scores.ts
import { useEffect } from 'react';
import { 
  IELTS_TO_PTE_MAP, 
  IELTS_TO_TOEFL_MAP, 
  IELTS_TO_DUOLINGO_MAP 
} from '@/lib/programs/program-constants';
import { shouldShowDuolingo, shouldShowEnglishTestRequirement } from '@/lib/programs/program-utils';
import type { Answers } from '@/lib/core/types';

export const useEnglishTestScores = (
  answers: Answers,
  onAnswerChange: (id: keyof Answers, value: any) => void
) => {
  const showEnglishTestRequirement = shouldShowEnglishTestRequirement(answers.highestEducation ?? undefined);
  const showDuolingo = shouldShowDuolingo(answers.studyDestination);

  useEffect(() => {
    if (showEnglishTestRequirement) {
      onAnswerChange('pteScore', answers.ieltsScore ? IELTS_TO_PTE_MAP[answers.ieltsScore] || '' : '');
      onAnswerChange('toeflScore', answers.ieltsScore ? IELTS_TO_TOEFL_MAP[answers.ieltsScore] || '' : '');
      if (showDuolingo) {
        onAnswerChange('duolingoScore', answers.ieltsScore ? IELTS_TO_DUOLINGO_MAP[answers.ieltsScore] || '' : '');
      }
    } else {
      ['ieltsScore', 'pteScore', 'toeflScore', 'duolingoScore'].forEach(key => 
        onAnswerChange(key as keyof Answers, '')
      );
    }
  }, [answers.ieltsScore, onAnswerChange, showEnglishTestRequirement, showDuolingo]);

  return { showEnglishTestRequirement, showDuolingo };
};
