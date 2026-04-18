
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/layout/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/forms/radio-group";
import { Label } from "@/components/ui/forms/label";
import type { Answers, Question, ModalID } from "@/lib/core/types";
import { Briefcase, CalendarOff, AlertTriangle, Info } from 'lucide-react';
import InfoModal from '@/components/common/dialogs/info-modal';
import { MODAL_CONTENT } from '@/lib/modals/content';
import { Button } from '@/components/ui/forms/button';
import { getEducationLabel } from '@/lib/education/education-labels';


interface QuestionCardProps {
  question: Question;
  answers: Answers;
  onAnswerChange: (id: keyof Answers, value: any) => void;
}

export default function QuestionCard({ question, answers, onAnswerChange }: QuestionCardProps) {
    const [modalId, setModalId] = useState<ModalID | null>(null);
    const [pendingValue, setPendingValue] = useState('');
    const [previousValue, setPreviousValue] = useState<string>('');

    const answer = answers[question.id];
    const destination = answers.studyDestination;

    const handleValueChange = (value: string) => {
        // Store current value before changing it
        setPreviousValue(answers[question.id] as string || '');
        
        // Update the answer immediately so the radio button reflects the choice
        onAnswerChange(question.id, value);

        if (question.id === 'maritalStatus' && destination === 'Ireland' && value !== 'Never Married') {
            setPendingValue(value);
            setModalId('IRELAND_DEPENDENT_INFO');
        }

        const isIreland = destination === 'Ireland';
        const isHighestEducation = question.id === 'highestEducation';
        const triggersQualificationModal = [
            'Junior High School',
            'Senior High School',
            'TESDA Certificate',
            'Associate Degree',
            'High School Graduate (Old Curriculum)',
            'Bachelor Degree (Did Not Finish)'
        ].includes(value);

        if (isIreland && isHighestEducation && triggersQualificationModal) {
            setPendingValue(value);
            setModalId('IRELAND_QUALIFICATION_INFO');
        }

        if (isIreland && isHighestEducation && (value === "Bachelor's Degree" || value === "Master's Degree" || value === "PhD")) {
            setPendingValue(value);
            setModalId('IRELAND_MASTER_DEGREE_INFO');
        }
    };

    const handleSubQuestionChange = (subQuestionId: keyof Answers, value: string) => {
        onAnswerChange(subQuestionId, value);
        if (subQuestionId === 'hasStudyWorkGap' && value === 'Yes') {
            setPendingValue(value);
            setModalId('STUDY_WORK_GAP');
        }
    };
    
    const handleConfirm = () => {
        // Answer is already set, just close modal
        setModalId(null);
    };
    
    const handleInfoClick = (id: ModalID) => {
        setModalId(id);
    }

    const handleModalClose = () => {
        if (question.id === 'maritalStatus') {
            // Revert to previous value if cancelled
            onAnswerChange(question.id, previousValue);
        }
        setModalId(null);
    }

    const isHighestEducationQuestion = question.id === 'highestEducation';
    const isMaritalStatusQuestion = question.id === 'maritalStatus';
    const isCanada = destination === 'Canada';

    const workExperienceQs = question.workExperienceQuestions?.filter(q => q.id !== 'hasStudyWorkGap');
    const studyGapQ = question.workExperienceQuestions?.find(q => q.id === 'hasStudyWorkGap');

    return (
        <>
            <Card className="w-full">
                <CardHeader className="p-4 pb-4 md:p-6 md:pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl md:text-2xl text-[#004097]">
                        {question.icon && <question.icon className="h-7 w-7 text-yellow-500" />}
                        {question.title}
                    </CardTitle>
                    {question.description && (
                        <CardDescription className="pt-0">
                            {question.description}
                        </CardDescription>
                    )}
                     {isMaritalStatusQuestion && isCanada && (
                        <div className="space-y-1 mt-2">
                            <div className="flex items-center gap-2">
                                <p className="text-sm italic text-red-600">Who can bring their Spouse (with an Open Work Permit)?</p>
                                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleInfoClick('CANADA_SPOUSE_OWP_INFO')}>
                                    <Info className="h-4 w-4 text-blue-500" />
                                </Button>
                            </div>
                             <div className="flex items-center gap-2">
                                <p className="text-sm italic text-red-600">Who can bring their Children?</p>
                                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleInfoClick('CANADA_CHILDREN_DEPENDENT_INFO')}>
                                    <Info className="h-4 w-4 text-blue-500" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                    {question.type === 'radio' && (
                        <RadioGroup
                            value={answer as string || ''}
                            onValueChange={handleValueChange}
                            className={isHighestEducationQuestion ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col space-y-3"}
                        >
                            {question.options?.map(option => {
                                const isString = typeof option === 'string';
                                const optionValue = isString ? option : option.name;
                                const optionId = `${question.id}-${optionValue.replace(/[\s/()]/g, '')}`;
                                const isDisabled = !isString && !!option.disabled;
                                const flagUrl = !isString ? option.flagUrl : null;
                                const status = !isString ? option.status : null;

                                return (
                                    <div key={optionValue} className="flex items-center space-x-3">
                                        <RadioGroupItem value={optionValue} id={optionId} className="w-5 h-5" disabled={isDisabled} />
                                        {flagUrl && <img src={flagUrl} alt={`${optionValue} flag`} className="w-6 h-4" />}
                                        <Label htmlFor={optionId} className={`flex-1 text-base cursor-pointer flex items-center gap-2 ${isDisabled ? 'text-muted-foreground' : ''}`}>
                                                    <span>{typeof optionValue === 'string' ? getEducationLabel(optionValue) : optionValue}</span>
                                            {isDisabled && status === 'under-construction' && (
                                                <div className="flex items-center gap-1">
                                                    <span className="text-xs font-normal text-muted-foreground">(Coming soon:</span>
                                                    <AlertTriangle className="h-4 w-4 text-destructive animate-blink" />
                                                    <span className="text-xs font-medium text-primary">Under Construction)</span>
                                                </div>
                                            )}
                                            {isDisabled && status !== 'under-construction' && (
                                                <span className="text-xs font-normal text-muted-foreground">(Coming soon)</span>
                                            )}
                                        </Label>
                                    </div>
                                );
                            })}
                        </RadioGroup>
                    )}
                </CardContent>
            </Card>

            {isHighestEducationQuestion && workExperienceQs && (
                <Card className="w-full animate-in fade-in-0 duration-500">
                    <CardHeader className="p-4 pb-4 md:p-6 md:pb-4">
                        <CardTitle className="flex items-center gap-3 text-xl md:text-2xl text-[#004097]">
                            <Briefcase className="h-7 w-7 text-yellow-500" />
                            Work Experience
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                        <div className="space-y-6">
                            {workExperienceQs.map((subQuestion) => {
                                if (subQuestion.id === 'isCurrentlyWorking' && answers.hasWorkExperience !== 'Yes') {
                                    return null;
                                }

                                return (
                                    <div key={subQuestion.id}>
                                        <p className="font-medium mb-2">{subQuestion.prompt}</p>
                                        <RadioGroup
                                            value={answers[subQuestion.id] || ''}
                                            onValueChange={(value) => onAnswerChange(subQuestion.id, value)}
                                            className="flex flex-col sm:flex-row sm:items-center gap-3"
                                        >
                                            {subQuestion.options.map((option) => {
                                                const subOptionId = `${subQuestion.id}-${option}`;
                                                return (
                                                <div key={option} className="flex items-center space-x-2">
                                                    <RadioGroupItem value={option} id={subOptionId} />
                                                    <Label htmlFor={subOptionId} className="cursor-pointer">{option}</Label>
                                                </div>
                                                );
                                            })}
                                        </RadioGroup>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {isHighestEducationQuestion && studyGapQ && (
                <Card className="w-full animate-in fade-in-0 duration-500">
                     <CardHeader className="p-4 pb-4 md:p-6 md:pb-4">
                        <CardTitle className="flex items-center gap-3 text-xl md:text-2xl text-[#004097]">
                            <CalendarOff className="h-7 w-7 text-yellow-500" />
                            Study or Work Gap
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                        <div>
                            <p className="font-medium mb-2">{studyGapQ.prompt}</p>
                            <RadioGroup
                                value={answers[studyGapQ.id] || ''}
                                onValueChange={(value) => handleSubQuestionChange(studyGapQ.id, value)}
                                className="flex flex-col sm:flex-row sm:items-center gap-3"
                            >
                                {studyGapQ.options.map((option) => {
                                    const gapOptionId = `${studyGapQ.id}-${option}`;
                                    return (
                                    <div key={option} className="flex items-center space-x-2">
                                        <RadioGroupItem value={option} id={gapOptionId} />
                                        <Label htmlFor={gapOptionId} className="cursor-pointer">{option}</Label>
                                    </div>
                                    );
                                })}
                            </RadioGroup>
                        </div>
                    </CardContent>
                </Card>
            )}

            <InfoModal
                isOpen={!!modalId}
                content={modalId ? MODAL_CONTENT[modalId] : null}
                onClose={handleModalClose}
                onConfirm={handleConfirm}
                onCancel={handleModalClose}
            />
        </>
    );
}
