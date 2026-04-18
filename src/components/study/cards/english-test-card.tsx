
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/layout/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/forms/radio-group";
import { Label } from "@/components/ui/forms/label";
import { Languages } from 'lucide-react';
import type { Answers, Question, ModalID, WizardStepProps } from "@/lib/core/types";
import InfoModal from '@/components/common/dialogs/info-modal';
import { MODAL_CONTENT } from '@/lib/modals/content';
import EnglishTestDetailsCard from './english-test-details-card';
import PlannedEnglishTestCard from './planned-english-test-card';

export default function EnglishTestCard({ question, answers, onAnswerChange }: WizardStepProps) {
    const [modalId, setModalId] = useState<ModalID | null>(null);
    const [pendingValue, setPendingValue] = useState('');

    const answer = answers[question.id];
    const destination = answers.studyDestination || 'Australia';

    const handleValueChange = (value: string) => {
        const triggersModal = value === 'No' || value === 'Student has MOI';

        if (triggersModal) {
            setPendingValue(value);
            if (destination === 'Ireland') {
                setModalId('IRELAND_VISA_REQUIREMENT_INFO');
            } else if (destination === 'New Zealand') {
                setModalId('NEW_ZEALAND_VISA_REQUIREMENT_INFO');
            } else if (destination === 'Canada') {
                setModalId('CANADA_VISA_REQUIREMENT_INFO');
            }
            else {
                setModalId('VISA_REQUIREMENT_INFO');
            }
        } else {
            onAnswerChange(question.id, value);
        }
    };
    
    const handleConfirm = () => {
        onAnswerChange(question.id, pendingValue);
        setModalId(null);
    };

    return (
        <div className="space-y-8">
            <Card className="w-full">
                <CardHeader className="p-4 pb-4 md:p-6 md:pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl md:text-2xl text-[#004097]">
                        <Languages className="h-7 w-7 text-yellow-500" />
                        {question.title}
                    </CardTitle>
                    {question.description && <CardDescription className="pt-0">{question.description}</CardDescription>}
                </CardHeader>
                <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                    <RadioGroup
                        value={answer as string || ''}
                        onValueChange={handleValueChange}
                        className="flex flex-col space-y-3"
                    >
                        {(question.options as string[]).map(option => {
                            const optionId = `ielts-${option.replace(/\s+/g, '-')}`;
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

            {answer === 'Yes' && (
                <div className="animate-in fade-in-0 duration-500">
                    <EnglishTestDetailsCard answers={answers} onAnswerChange={onAnswerChange} />
                </div>
            )}
            {answer === 'Will sit for an English Test' && (
                <div className="animate-in fade-in-0 duration-500">
                    <PlannedEnglishTestCard answers={answers} onAnswerChange={onAnswerChange} />
                </div>
            )}

            <InfoModal
                isOpen={!!modalId}
                content={modalId ? MODAL_CONTENT[modalId] : null}
                onClose={() => setModalId(null)}
                onConfirm={handleConfirm}
            />
        </div>
    );
}
