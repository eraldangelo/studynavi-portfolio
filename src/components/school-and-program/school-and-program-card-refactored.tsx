// @/components/school-and-program/school-and-program-card-refactored.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/layout/card";
import { School } from "lucide-react";
import type { Answers, ModalID } from "@/lib/core/types";
import InfoModal from '../common/dialogs/info-modal';
import { MODAL_CONTENT } from '@/lib/modals/content';
import { getModalIdForProgramCategory } from '@/lib/modals/programs';

// Custom hooks
import { useProgramCategories } from '@/hooks/programs/use-program-categories';
import { useProgramDurations } from '@/hooks/programs/use-program-durations';
import { useIntakeDate } from '@/hooks/programs/use-intake-date';
import { useEnglishTestScores } from '@/hooks/programs/use-english-test-scores';

// Sub-components
import { SchoolBasicInfo } from './school-basic-info';
import { ProgramDurationLocation } from './program-duration-location';
import { IntakeDateSection } from './intake-date-section';
import { ProgramCategorySection } from './program-category-section';
import { EnglishTestSection } from './english-test-section';

interface SchoolAndProgramCardProps {
  answers: Answers;
  onAnswerChange: (id: keyof Answers, value: any) => void;
}

export default function SchoolAndProgramCardRefactored({ answers, onAnswerChange }: SchoolAndProgramCardProps) {
  const [modalId, setModalId] = useState<ModalID | null>(null);
  const [pendingCategory, setPendingCategory] = useState<string | null>(null);

  // Custom hooks
  const programCategories = useProgramCategories(answers);
  const programDurations = useProgramDurations(answers);
  const { years, months } = useIntakeDate(answers, onAnswerChange);
  const { showEnglishTestRequirement, showDuolingo } = useEnglishTestScores(answers, onAnswerChange);

  // Effect to validate program category
  useEffect(() => {
    if (answers.programCategory && !programCategories.includes(answers.programCategory)) {
      onAnswerChange('programCategory', '');
    }
  }, [programCategories, answers.programCategory, onAnswerChange]);

  const handleProgramCategoryChange = (value: string) => {
    const { highestEducation, studyDestination } = answers;
    const isNewZealand = studyDestination === 'New Zealand';

    // Check for special NZ rule
    const higherEducationLevels = [
      'Associate Degree', 
      'Bachelor Degree (Did Not Finish)', 
      "Bachelor's Degree", 
      "Master's Degree", 
      'PhD'
    ];
    const lowerLevelPrograms = [
      'Level 4: Certificate', 
      'Level 5: Diploma / Certificate', 
      'Level 6: Diploma'
    ];

    if (isNewZealand && 
        highestEducation && 
        higherEducationLevels.includes(highestEducation) && 
        lowerLevelPrograms.includes(value)) {
      
      setPendingCategory(value);
      setModalId('NZ_LOWER_QUALIFICATION_RISK');
      return;
    }

    setPendingCategory(null);
    onAnswerChange('programCategory', value);
    
    const modalToOpen = getModalIdForProgramCategory(answers, value);
    if (modalToOpen) {
      setModalId(modalToOpen);
    }
  };

  const handleModalOpen = (id: string) => {
    setModalId(id as ModalID);
  };

  const handleConfirm = () => {
    if (pendingCategory) {
      onAnswerChange('programCategory', pendingCategory);
      setPendingCategory(null);
    }
    setModalId(null);
  };
  
  const handleCancel = () => {
    setPendingCategory(null);
    setModalId(null);
  };

  return (
    <>
      <Card className="w-full animate-in fade-in-0 duration-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl md:text-2xl text-[#004097]">
            <School className="h-7 w-7 text-yellow-500" />
            What school and program is the student targeting?
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* School Basic Info */}
            <SchoolBasicInfo 
              answers={answers}
              onAnswerChange={onAnswerChange}
              onModalOpen={handleModalOpen}
            />

            {/* Program Duration & Location */}
            <ProgramDurationLocation 
              answers={answers}
              onAnswerChange={onAnswerChange}
              programDurations={programDurations}
            />

            {/* Intake Date & Program Category Section */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <IntakeDateSection 
                  answers={answers}
                  onAnswerChange={onAnswerChange}
                  onModalOpen={handleModalOpen}
                  years={years}
                  months={months}
                />
                
                <ProgramCategorySection 
                  answers={answers}
                  onAnswerChange={onAnswerChange}
                  onModalOpen={handleModalOpen}
                  programCategories={programCategories}
                  onProgramCategoryChange={handleProgramCategoryChange}
                />
              </div>
            </div>

            {/* English Test Section */}
            <EnglishTestSection 
              answers={answers}
              onAnswerChange={onAnswerChange}
              showEnglishTestRequirement={showEnglishTestRequirement}
              showDuolingo={showDuolingo}
            />
          </div>
        </CardContent>
      </Card>

      {/* Info Modal */}
      <InfoModal
        isOpen={!!modalId}
        content={modalId ? MODAL_CONTENT[modalId] : null}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        answers={answers}
      />
    </>
  );
}
