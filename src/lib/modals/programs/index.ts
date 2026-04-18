
'use client';

import type { Answers, ModalID } from '../../core/types';
import { commonProgramModalRules } from './common';
import { australiaProgramModalRules } from './australia';
import { irelandProgramModalRules } from './ireland';
import { newZealandProgramModalRules } from './new-zealand';
import { canadaProgramModalRules } from './canada';

export const getModalIdForProgramCategory = (
    answers: Answers, 
    selectedCategory: string
): ModalID | null => {
    let rules: { condition: (answers: Answers, selectedCategory: string) => boolean, modal: ModalID }[] = [];

    switch (answers.studyDestination) {
        case 'Ireland':
            rules = [...commonProgramModalRules, ...irelandProgramModalRules];
            break;
        case 'New Zealand':
            rules = [...commonProgramModalRules, ...newZealandProgramModalRules];
            break;
        case 'Canada':
            rules = [...commonProgramModalRules, ...canadaProgramModalRules];
            break;
        case 'Australia':
        default:
            rules = [...commonProgramModalRules, ...australiaProgramModalRules];
            break;
    }

    const rule = rules.find(r => r.condition(answers, selectedCategory));
    return rule ? rule.modal : null;
};
