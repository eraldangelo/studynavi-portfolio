
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/layout/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/forms/radio-group";
import { Label } from "@/components/ui/forms/label";
import { ShieldAlert, Info } from "lucide-react";
import type { Answers, ModalID } from "@/lib/core/types";
import InfoModal from '@/components/common/dialogs/info-modal';
import { MODAL_CONTENT } from '@/lib/modals/content';
import { Button } from '@/components/ui/forms/button';


interface VisaRefusalCardProps {
  answers: Answers;
  onAnswerChange: (id: keyof Answers, value: string) => void;
}

export default function VisaRefusalCard({ answers, onAnswerChange: onAnswer }: VisaRefusalCardProps) {
  const [modalId, setModalId] = useState<ModalID | null>(null);
  const [pendingValue, setPendingValue] = useState<string | null>(null);

  const { studyDestination } = answers;
  const isCanada = studyDestination === 'Canada';
  const description = isCanada
    ? "Has the student recently had a visa refusal for a Canadian student visa?"
    : "Has the student had a visa application refused by any country within the past 10 years?";

  const handleValueChange = (value: string) => {
    setPendingValue(value);
    if (value === 'Yes') {
        if (answers.studyDestination === 'Australia') {
            setModalId('VISA_REFUSAL_ACKNOWLEDGEMENT');
        } else if (answers.studyDestination === 'Canada') {
            setModalId('CANADA_VISA_REFUSAL_WITH_PAL_INFO');
        } else {
            onAnswer('visaRefusal', value);
        }
    } else {
      onAnswer('visaRefusal', value);
    }
  };

  const handleProceed = () => {
    if (pendingValue) {
        onAnswer('visaRefusal', pendingValue);
    }
    setModalId(null);
    setPendingValue(null);
  };

  const handleCancel = () => {
      setModalId(null);
      setPendingValue(null);
  };

  const handleInfoClick = (id: ModalID) => {
    setModalId(id);
  }

  return (
    <>
      <Card className="w-full">
          <CardHeader className="p-4 pb-4 md:p-6 md:pb-4">
              <CardTitle className="flex items-center gap-3 text-xl md:text-2xl text-[#004097]">
                  <ShieldAlert className="h-7 w-7 text-yellow-500" />
                  Visa Refusal
              </CardTitle>
              <CardDescription className="pt-2">
                  {description}
              </CardDescription>
              {isCanada && (
                <div className="space-y-0">
                    <div className="flex items-center gap-2">
                        <p className="text-sm italic text-red-600">Provincial Attestation Letter Single Use Rule</p>
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleInfoClick('CANADA_PAL_RULE_INFO')}>
                            <Info className="h-4 w-4 text-blue-500" />
                        </Button>
                    </div>
                </div>
              )}
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
              <RadioGroup onValueChange={handleValueChange} value={answers.visaRefusal ?? ''} className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Yes" id="visa-refusal-yes" />
                      <Label htmlFor="visa-refusal-yes" className="cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                      <RadioGroupItem value="No" id="visa-refusal-no" />
                      <Label htmlFor="visa-refusal-no" className="cursor-pointer">No</Label>
                  </div>
              </RadioGroup>
          </CardContent>
      </Card>

      <InfoModal
        isOpen={!!modalId}
        content={modalId ? MODAL_CONTENT[modalId as any] : null}
        onClose={handleCancel}
        onConfirm={handleProceed}
        onCancel={handleCancel}
      />
    </>
  );
}

    
