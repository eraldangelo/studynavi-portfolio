// @/hooks/programs/use-program-categories.ts
import { useMemo } from 'react';
import { getProgramCategories } from '@/lib/program-categories';
import type { Answers } from '@/lib/core/types';

export const useProgramCategories = (answers: Answers) => {
  return useMemo(() => getProgramCategories(answers), [answers]);
};
