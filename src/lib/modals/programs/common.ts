
'use client';
import type { Answers, ModalID } from '../../core/types';

export const commonProgramModalRules: { condition: (answers: Answers, selectedCategory: string) => boolean, modal: ModalID }[] = [
    { condition: (_answers, selectedCategory) => selectedCategory === 'ELICOS', modal: 'ELICOS_INFO' },
];
