
'use client';
import type { Answers, ModalID } from '../../core/types';

export const canadaProgramModalRules: { condition: (answers: Answers, selectedCategory: string) => boolean, modal: ModalID }[] = [
    { 
        condition: (answers, selectedCategory) => {
            const hasHigherEd = ["Bachelor's Degree", "Master Degree", "PhD"].includes(answers.highestEducation || '');
            const isLowerProgram = ['Certificate', 'Diploma', 'Advanced Diploma', 'Associate Degree'].includes(selectedCategory);
            return hasHigherEd && isLowerProgram;
        }, 
        modal: 'CANADA_ACADEMIC_REGRESSION_WARNING' 
    },
    {
        condition: (answers, selectedCategory) => {
            return answers.highestEducation === "Bachelor's Degree" && selectedCategory === 'Bachelor’s Degree';
        },
        modal: 'CANADA_BACHELOR_TO_BACHELOR_WARNING'
    }
];
