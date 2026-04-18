
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/layout/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/forms/radio-group";
import { Label } from "@/components/ui/forms/label";
import { DollarSign } from "lucide-react";
import type { Answers, Question, ModalID } from "@/lib/core/types";
import InfoModal from '@/components/common/dialogs/info-modal';
import { MODAL_CONTENT } from '@/lib/modals/content';

export default function FinancialSponsorshipCard({ 
  question, 
  answers, 
  onAnswerChange: onAnswer 
}: { question: Question; answers: Answers; onAnswerChange: (id: keyof Answers, value: any) => void; }) {
  const [modalId, setModalId] = useState<ModalID | string | null>(null);
  const [pendingValue, setPendingValue] = useState<string>('');

  const destination = answers.studyDestination || 'Australia';

  const clearNonGenuineData = () => {
    onAnswer('noSponsorFollowupTriggered', false);
    onAnswer('isShoppingNonGenuine', '');
    onAnswer('recommendedSchool', '');
    onAnswer('recommendedProgram', '');
    onAnswer('recommendedProgramDuration', '');
    onAnswer('recommendedEnglishTestRequirement', '');
    onAnswer('recommendedApproximateCost', '');
    onAnswer('recommendedBriefInfo', '');
  };

  const handleValueChange = (value: string) => {
    setPendingValue(value);
    
    if (value === 'Yes' || value === 'Not yet sure') {
      clearNonGenuineData();
      if (destination === 'Ireland') {
        setModalId('IRELAND_RISK_ACKNOWLEDGEMENT');
      } else if (destination === 'New Zealand') {
        setModalId('NEW_ZEALAND_RISK_ACKNOWLEDGEMENT');
      } else {
        setModalId('AUSTRALIA_RISK_ACKNOWLEDGEMENT');
      }
    } else if (value === 'No') {
      setModalId('NO_SPONSOR_INQUIRY');
    } else {
      // For any other case, just update the answer directly
      onAnswer(question.id, value);
    }
  };

  const handleRiskConfirm = () => {
    onAnswer(question.id, pendingValue);
    setModalId(null);
  };

  const handleModalCancel = () => {
    setModalId(null);
  };

  const handleNoSponsor = () => {
    onAnswer(question.id, 'No');
    onAnswer('noSponsorFollowupTriggered', true);
    setModalId(null);
  };

  const handleNotSureFromNo = () => {
    setPendingValue('Not yet sure');
    onAnswer('noSponsorFollowupTriggered', true);
    if (destination === 'Ireland') {
      setModalId('IRELAND_RISK_ACKNOWLEDGEMENT');
    } else if (destination === 'New Zealand') {
      setModalId('NEW_ZEALAND_RISK_ACKNOWLEDGEMENT');
    } else {
      setModalId('AUSTRALIA_RISK_ACKNOWLEDGEMENT');
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="p-4 pb-0 md:p-6 md:pb-0">
          <CardTitle className="flex items-center gap-3 text-xl md:text-2xl text-[#004097]">
            <DollarSign className="h-7 w-7 text-yellow-500" />
            {question.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2 md:p-6 md:pt-2">
          <p className="text-muted-foreground text-sm">{question.description}</p>

          <RadioGroup 
            value={answers[question.id] as string || ''}
            onValueChange={handleValueChange}
            className="flex flex-col space-y-3 mt-4"
          >
            {(question.options as string[]).map(option => {
              const optionId = `sponsor-${option.replace(/\s+/g, '-')}`;
              return (
                <div key={option} className="flex items-center space-x-3">
                  <RadioGroupItem value={option} id={optionId} />
                  <Label htmlFor={optionId} className="flex-1 cursor-pointer">{option}</Label>
                </div>
              );
            })}
          </RadioGroup>

        </CardContent>
      </Card>
      
      <InfoModal
        isOpen={!!modalId}
        content={modalId ? MODAL_CONTENT[modalId as ModalID] : null}
        onClose={handleModalCancel}
        onConfirm={modalId?.includes('RISK_ACKNOWLEDGEMENT') ? handleRiskConfirm : handleNotSureFromNo}
        onCancel={modalId === 'NO_SPONSOR_INQUIRY' ? handleNoSponsor : handleModalCancel}
      />
    </>
  );
}
