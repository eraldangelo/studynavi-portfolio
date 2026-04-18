
'use client';
import type { Answers, ModalID } from '../../core/types';

export const australiaProgramModalRules: { condition: (answers: Answers, selectedCategory: string) => boolean, modal: ModalID }[] = [
    { condition: (answers, selectedCategory) => answers.highestEducation === 'High School Graduate (Old Curriculum)' && ['Vocational', 'Bachelor'].includes(selectedCategory), modal: 'COURSE_MERIT_HS_OLD' },
    { condition: (answers, selectedCategory) => answers.highestEducation === 'TESDA Certificate' && selectedCategory === 'Vocational', modal: 'TESDA_VOCATIONAL_EQUIVALENT' },
    { condition: (answers, selectedCategory) => {
        const isDowngrade = 
            (answers.highestEducation === 'Associate Degree' && selectedCategory === 'Vocational') ||
            (answers.highestEducation === 'Bachelor Degree (Did Not Finish)' && selectedCategory === 'Vocational') ||
            (answers.highestEducation === "Bachelor's Degree" && selectedCategory === 'Vocational') ||
            (answers.highestEducation === "Master's Degree" && ['Vocational', 'Bachelor'].includes(selectedCategory)) ||
            (answers.highestEducation === 'PhD' && ['Vocational', 'Bachelor'].includes(selectedCategory));
        return isDowngrade;
    }, modal: 'QUALIFICATION_DOWNGRADE' },
    { condition: (answers, selectedCategory) => answers.highestEducation === 'Associate Degree' && selectedCategory === 'Bachelor', modal: 'ASSOCIATE_BACHELOR_UPGRADE' },
    { condition: (answers, selectedCategory) => answers.highestEducation === "Bachelor Degree (Did Not Finish)" && answers.hasWorkExperience === 'Yes' && answers.isCurrentlyWorking === 'Yes' && selectedCategory === 'Bachelor', modal: 'BACHELOR_DNF_WORKING_BACHELOR' },
    { condition: (answers, selectedCategory) => answers.highestEducation === "Bachelor's Degree" && selectedCategory === 'Bachelor', modal: 'BACHELOR_EQUIVALENT' },
];
