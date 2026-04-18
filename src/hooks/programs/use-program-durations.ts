// @/hooks/programs/use-program-durations.ts
import { useMemo } from 'react';
import { ALL_PROGRAM_DURATIONS } from '@/lib/programs/program-constants';
import type { Answers } from '@/lib/core/types';

export const useProgramDurations = (answers: Answers) => {
  return useMemo(() => {
    if (answers.studyDestination === 'Ireland') {
      return ALL_PROGRAM_DURATIONS.filter(d => parseFloat(d) <= 3);
    }
    return ALL_PROGRAM_DURATIONS;
  }, [answers.studyDestination]);
};
