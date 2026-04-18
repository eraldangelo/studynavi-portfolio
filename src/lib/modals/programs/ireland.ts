'use client';
import type { Answers, ModalID } from '../../core/types';

export const irelandProgramModalRules: { condition: (answers: Answers, selectedCategory: string) => boolean, modal: ModalID }[] = [
    { condition: (answers, selectedCategory) => answers.highestEducation === "Bachelor's Degree" && selectedCategory === 'Bachelor', modal: 'IRELAND_BACHELOR_LEVEL7_PROGRAM_DURATION' },
    { condition: (answers, selectedCategory) => answers.highestEducation === "Bachelor's Degree" && selectedCategory === 'Bachelor (Honours)', modal: 'IRELAND_BACHELOR_LEVEL8_PROGRAM_DURATION' },
];
