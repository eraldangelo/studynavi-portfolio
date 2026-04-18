
'use client';

import type { Answers } from '../core/types';
import { getAustraliaProgramCategories } from './australia';
import { getIrelandProgramCategories } from './ireland';
import { getNewZealandProgramCategories } from './new-zealand';
import { getCanadaProgramCategories } from './canada';

export const getProgramCategories = (answers: Answers): string[] => {
    const { studyDestination, highestEducation } = answers;

    switch (studyDestination) {
        case 'Ireland':
            return getIrelandProgramCategories(highestEducation);
        case 'New Zealand':
            return getNewZealandProgramCategories(highestEducation);
        case 'Canada':
            return getCanadaProgramCategories(highestEducation);
        case 'Australia':
        default:
            return getAustraliaProgramCategories(highestEducation);
    }
};
