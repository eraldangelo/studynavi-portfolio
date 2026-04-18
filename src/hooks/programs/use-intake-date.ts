// @/hooks/programs/use-intake-date.ts
import { useEffect, useMemo } from 'react';
import { getMonths, getYears } from '@/lib/programs/program-utils';
import type { Answers } from '@/lib/core/types';

export const useIntakeDate = (answers: Answers, onAnswerChange: (id: keyof Answers, value: any) => void) => {
  const years = useMemo(() => getYears(), []);
  const months = useMemo(() => getMonths(answers.intakeYear), [answers.intakeYear]);

  useEffect(() => {
    if (answers.intakeMonth && answers.intakeYear) {
      onAnswerChange('intakeDate', `${answers.intakeYear}-${answers.intakeMonth}-01`);
    }
  }, [answers.intakeMonth, answers.intakeYear, onAnswerChange]);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const selectedYear = Number(answers.intakeYear);
    if (selectedYear === currentYear) {
      const currentMonth = new Date().getMonth() + 1;
      const selectedMonth = Number(answers.intakeMonth);
      if (selectedMonth < currentMonth) {
        onAnswerChange('intakeMonth', '');
      }
    }
  }, [answers.intakeYear, answers.intakeMonth, onAnswerChange]);

  return { years, months };
};
