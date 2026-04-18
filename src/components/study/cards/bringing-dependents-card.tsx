
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/layout/card";
import { Users } from "lucide-react";
import type { Answers, ModalID, Question } from "@/lib/core/types";
import InfoModal from '@/components/common/dialogs/info-modal';
import { MODAL_CONTENT } from '@/lib/modals/content';
import { DESTINATION_CONFIG } from '@/lib/destination-config';
import { getNumber } from '@/services/financials/common';
import { BringingDependentsForm } from '@/components/study/cards/bringing-dependents-card.form';

export default function BringingDependentsCard({ 
  question, 
  answers, 
  onAnswerChange: onAnswer 
}: { question: Question; answers: Answers; onAnswerChange: (id: keyof Answers, value: any) => void; }) {
  const [modalId, setModalId] = useState<ModalID | string | null>(null);
  const [pendingValue, setPendingValue] = useState<string>('');
  
  const selectedValue = answers[question.id] as string || '';
  const destination = answers.studyDestination;
  const config = (destination && DESTINATION_CONFIG[destination]) || DESTINATION_CONFIG['Australia'];
  const isNewZealand = destination === 'New Zealand';
  const isCanada = destination === 'Canada';

  const filteredOptions = useMemo(() => {
    const allOptions = (question.options as string[]) || [];
    const statusesWithoutSpouse = ['Single Parent', 'Divorced', 'Widowed'];
    if (answers.maritalStatus && statusesWithoutSpouse.includes(answers.maritalStatus)) {
      return allOptions.filter(opt => opt !== 'Spouse/De Facto' && opt !== 'Spouse/De Facto and Child/ren');
    }
    return allOptions;
  }, [question.options, answers.maritalStatus]);

  const handleValueChange = (value: string) => {
    if (value === 'No') {
      onAnswer(question.id, value);
      onAnswer('numberOfChildren', '');
      onAnswer('children_0_4', '');
      onAnswer('children_5_10', '');
      onAnswer('children_11_14', '');
      onAnswer('children_15_plus', '');
      onAnswer('childAgeCategory', []); 
      onAnswer('numberOfSchoolAgeChildren', '');
      onAnswer('numberOfNonSchoolAgeChildren', '');
      return;
    }
    
    if (destination && !config.dependents.allowed) {
        setPendingValue(value);
        setModalId('IRELAND_NO_DEPENDENTS');
        return;
    }

    setPendingValue(value);
    setModalId('DEPENDENT_VISA');
  };

  const handleConfirm = () => {
    onAnswer(question.id, pendingValue);
    
    if (pendingValue === 'Child/ren' || pendingValue === 'Spouse/De Facto and Child/ren') {
        if (!isNewZealand && !answers.numberOfChildren) {
            onAnswer('numberOfChildren', '1');
        }
    } else {
        onAnswer('numberOfChildren', '');
        onAnswer('children_0_4', '');
        onAnswer('children_5_10', '');
        onAnswer('children_11_14', '');
        onAnswer('children_15_plus', '');
        onAnswer('childAgeCategory', []);
        onAnswer('numberOfSchoolAgeChildren', '');
        onAnswer('numberOfNonSchoolAgeChildren', '');
    }
    setModalId(null);
  };

  const handleCancel = () => {
    setModalId(null);
  };

  const handleChildrenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const num = parseInt(value, 10);

    if (value === '') {
        onAnswer('numberOfChildren', '');
    } else if (!isNaN(num)) {
        if (num > 5) {
            onAnswer('numberOfChildren', '5');
        } else {
            onAnswer('numberOfChildren', value);
        }
    }
  };

  const handleCanadaAgeGroupChange = (e: React.ChangeEvent<HTMLInputElement>, ageGroup: keyof Answers) => {
    const value = e.target.value;
    const num = parseInt(value, 10);
    if (value === '' || (!isNaN(num) && num >= 0)) {
      onAnswer(ageGroup, value);
    }
  };
  
  useEffect(() => {
    if(isCanada){
      const total = 
        getNumber(answers.children_0_4) +
        getNumber(answers.children_5_10) +
        getNumber(answers.children_11_14) +
        getNumber(answers.children_15_plus);
      onAnswer('numberOfChildren', total > 0 ? String(total) : '');
    }
  }, [
    isCanada, 
    answers.children_0_4, 
    answers.children_5_10, 
    answers.children_11_14, 
    answers.children_15_plus, 
    onAnswer
  ]);

  const handleNzChildCategoryChange = (checked: boolean, category: 'school_age' | 'non_school_age') => {
    const currentCategories = (answers.childAgeCategory as string[]) || [];
    let newCategories: string[];

    if (checked) {
        newCategories = [...currentCategories, category];
    } else {
        newCategories = currentCategories.filter(c => c !== category);
        // Clear specific count when unchecked
        if (category === 'school_age') onAnswer('numberOfSchoolAgeChildren', '');
        if (category === 'non_school_age') onAnswer('numberOfNonSchoolAgeChildren', '');
    }
    onAnswer('childAgeCategory', newCategories);
  };

  const handleNzChildrenCountChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'school_age' | 'non_school_age') => {
    const value = e.target.value;
    const num = parseInt(value, 10);
    const otherType = type === 'school_age' ? 'numberOfNonSchoolAgeChildren' : 'numberOfSchoolAgeChildren';
    const otherCount = parseInt(answers[otherType] as string || '0', 10);
    
    if (value === '') {
        onAnswer(type === 'school_age' ? 'numberOfSchoolAgeChildren' : 'numberOfNonSchoolAgeChildren', '');
    } else if (!isNaN(num)) {
        const total = num + otherCount;
        if (total > 5) {
             // If total exceeds 5, adjust this input so total is 5
             const allowed = 5 - otherCount;
             onAnswer(type === 'school_age' ? 'numberOfSchoolAgeChildren' : 'numberOfNonSchoolAgeChildren', allowed.toString());
        } else {
             onAnswer(type === 'school_age' ? 'numberOfSchoolAgeChildren' : 'numberOfNonSchoolAgeChildren', value);
        }
    }
  };
  
  // Calculate total children for NZ whenever sub-counts change
  useEffect(() => {
    if (isNewZealand) {
        const schoolAge = parseInt(answers.numberOfSchoolAgeChildren as string || '0', 10);
        const nonSchoolAge = parseInt(answers.numberOfNonSchoolAgeChildren as string || '0', 10);
        const total = schoolAge + nonSchoolAge;
        if (total > 0) {
            onAnswer('numberOfChildren', total.toString());
        } else if (answers.numberOfChildren) { // Only clear if it was set
             onAnswer('numberOfChildren', '');
        }
    }
  }, [answers.numberOfSchoolAgeChildren, answers.numberOfNonSchoolAgeChildren, isNewZealand, onAnswer, answers.numberOfChildren]);


  const handleInfoClick = (e: React.MouseEvent, id: ModalID) => {
    e.stopPropagation(); // Prevent the radio button from being selected
    setModalId(id);
  }

  const showChildrenCount = (selectedValue === 'Child/ren' || selectedValue === 'Spouse/De Facto and Child/ren') && !isNewZealand && !isCanada;
  const showNzChildOptions = (selectedValue === 'Child/ren' || selectedValue === 'Spouse/De Facto and Child/ren') && isNewZealand;
  const showCanadaChildOptions = (selectedValue === 'Child/ren' || selectedValue === 'Spouse/De Facto and Child/ren') && isCanada;
  
  const isSchoolAgeChecked = (answers.childAgeCategory as string[])?.includes('school_age');
  const isNonSchoolAgeChecked = (answers.childAgeCategory as string[])?.includes('non_school_age');

  return (
    <>
      <Card className="w-full">
        <CardHeader className="p-4 pb-4 md:p-6 md:pb-4">
          <CardTitle className="flex items-center gap-3 text-xl md:text-2xl text-[#004097]">
            <Users className="h-7 w-7 text-yellow-500" />
            {question.title}
          </CardTitle>
          <CardDescription className="pt-0">
            Only a spouse, de facto/common-law partner, and children are considered dependents.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
          <BringingDependentsForm
            selectedValue={selectedValue}
            filteredOptions={filteredOptions}
            isNewZealand={isNewZealand}
            showCanadaChildOptions={showCanadaChildOptions}
            showNzChildOptions={showNzChildOptions}
            showChildrenCount={showChildrenCount}
            answers={answers}
            onValueChange={handleValueChange}
            onInfoClick={handleInfoClick}
            onCanadaAgeGroupChange={handleCanadaAgeGroupChange}
            isSchoolAgeChecked={isSchoolAgeChecked}
            isNonSchoolAgeChecked={isNonSchoolAgeChecked}
            onNzChildCategoryChange={handleNzChildCategoryChange}
            onNzChildrenCountChange={handleNzChildrenCountChange}
            onChildrenChange={handleChildrenChange}
          />
        </CardContent>
      </Card>
      
      <InfoModal
        isOpen={!!modalId}
        content={modalId ? MODAL_CONTENT[modalId as ModalID] || MODAL_CONTENT['DEPENDENT_VISA'] : null}
        onClose={() => setModalId(null)}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        answers={answers}
      />
    </>
  );
}
