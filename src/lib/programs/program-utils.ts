// @/lib/programs/program-utils.ts
import { ALL_MONTHS } from './program-constants';
import type { Answers } from '../core/types';

export const getYears = (): number[] => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 2100 - currentYear + 1 }, (_, i) => currentYear + i);
};

export const getMonths = (selectedYear: string | undefined): Array<{value: string, label: string}> => {
  const currentYear = new Date().getFullYear();
  const selectedYearNum = Number(selectedYear);
  
  if (selectedYearNum === currentYear) {
    const currentMonth = new Date().getMonth() + 1;
    return ALL_MONTHS.filter(month => Number(month.value) >= currentMonth);
  }
  return ALL_MONTHS;
};

export const shouldShowDuolingo = (studyDestination?: string): boolean => {
  return ['Ireland', 'Canada'].includes(studyDestination || '');
};

export const shouldShowSatActFields = (highestEducation?: string): boolean => {
  const eligible = [
    'Senior High School',
    'Associate Degree', 'Bachelor Degree (Did Not Finish)'
  ];
  return eligible.includes(highestEducation || '') && 
         highestEducation !== 'International Baccalaureate / GCE A-Levels';
};

export const shouldShowIbFields = (highestEducation?: string): boolean => {
  return highestEducation === 'International Baccalaureate / GCE A-Levels';
};

export const shouldShowEnglishTestRequirement = (highestEducation?: string): boolean => {
  return highestEducation !== 'International Baccalaureate / GCE A-Levels';
};

export const calculatePredictedIbScore = (ibEntryScore?: string): number | null => {
  const entryScore = parseInt(ibEntryScore || '', 10);
  if (!isNaN(entryScore)) {
    return entryScore + 3;
  }
  return null;
};
