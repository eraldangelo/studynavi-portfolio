'use client';

import {
  ArrowRight,
  CheckCircle2,
  Info,
  Plane,
  UserCheck,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/forms/button';
import { Checkbox } from '@/components/ui/forms/checkbox';
import { Label } from '@/components/ui/forms/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/layout/card';
import type { Answers } from '@/lib/core/types';
import type { VisaProcessStep } from '@/components/study/cards/visa-process-card.types';

interface VisaProcessCardFullViewProps {
  answers: Answers;
  regularSteps: VisaProcessStep[];
  branchStep?: VisaProcessStep;
  isAustraliaResearch: boolean;
  isNewZealand: boolean;
  isCanada: boolean;
  showIcons: boolean;
  showDescription: boolean;
  flagUrl: string | null;
  onIconClick: (id?: string) => void;
  isStepClickable: (stepId: string) => boolean;
  onSchoolAssistToggle?: (checked: boolean) => void;
}

export function VisaProcessCardFullView({
  answers,
  regularSteps,
  branchStep,
  isAustraliaResearch,
  isNewZealand,
  isCanada,
  showIcons,
  showDescription,
  flagUrl,
  onIconClick,
  isStepClickable,
  onSchoolAssistToggle,
}: VisaProcessCardFullViewProps) {
  return (
    <Card className="w-full animate-in fade-in-0 duration-500">
      <CardHeader>
        <CardTitle className="flex items-center justify-start gap-3 text-xl md:text-2xl text-[#004097]">
          {showIcons && <Plane className="h-7 w-7 text-yellow-500" />}
          Student Visa Process Flow for
          {flagUrl && <img src={flagUrl} alt={`${answers.studyDestination} flag`} className="w-8 h-6 rounded-sm" />}
          {answers.studyDestination}
        </CardTitle>
        <CardDescription className="pt-2 text-sm text-muted-foreground">
          Click the icons for important details. Please note that steps 1 and 2 are not interactive.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isAustraliaResearch && onSchoolAssistToggle && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-6">
            <Checkbox
              id="schoolWillAssist"
              checked={answers.schoolWillAssist === 'true'}
              onCheckedChange={(checked) => onSchoolAssistToggle(!!checked)}
            />
            <Label htmlFor="schoolWillAssist">
              Does the school assist in looking for a topic and a supervisor after the school application?
            </Label>
          </div>
        )}

        <div className="space-y-8 w-full">
          {regularSteps.map((step, index) => {
            const Icon = step.icon;
            const isClickable = isStepClickable(step.id);

            return (
              <div key={index} className="flex justify-center">
                <div
                  className={`flex items-center z-10 ${isClickable ? 'cursor-pointer' : ''}`}
                  onClick={() => onIconClick(step.id)}
                >
                  {showIcons && (
                    <div className="flex h-12 w-12 md:h-14 md:w-14 shrink-0 items-center justify-center rounded-full border shadow-sm transition-transform hover:scale-110 bg-white border-gray-200">
                      <Icon className="h-6 w-6 md:h-7 md:w-7 text-yellow-500" />
                    </div>
                  )}
                  <div className="ml-4 w-full sm:w-96">
                    <h3 className="flex items-center gap-2 text-lg md:text-xl font-bold text-[#004097]">
                      {index + 1}
                      .&nbsp;
                      {step.title}
                    </h3>
                    {showDescription && step.description && (
                      <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {branchStep && (
            <div className="flex flex-col items-center mt-8">
              <div className="flex items-center justify-center cursor-pointer" onClick={() => onIconClick(branchStep.id)}>
                {showIcons && (
                  <div className="flex h-12 w-12 md:h-14 md:w-14 shrink-0 items-center justify-center rounded-full border shadow-sm transition-transform hover:scale-110 bg-white border-gray-200">
                    <branchStep.icon className="h-6 w-6 md:h-7 md:w-7 text-yellow-500" />
                  </div>
                )}
                <div className="ml-4 w-full sm:w-96">
                  <h3 className="text-lg md:text-xl font-bold text-[#004097]">
                    {regularSteps.length + 1}
                    .&nbsp;
                    {branchStep.title}
                  </h3>
                  {showDescription && branchStep.description && (
                    <p className="text-sm text-muted-foreground mt-1">{branchStep.description}</p>
                  )}
                </div>
              </div>

              <div className="mt-8 w-full max-w-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <div className="flex flex-col items-center text-center p-4 rounded-lg border bg-green-50 border-green-200">
                    <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border bg-white border-green-200 shadow-sm mb-3">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-bold text-green-700 text-base mb-1">Visa Granted</h4>
                    <div className="flex flex-col items-start gap-2 text-sm text-green-800">
                      {isNewZealand && (
                        <div className="space-y-1 text-left">
                          <div className="flex items-center gap-1">
                            <ArrowRight className="h-4 w-4 flex-shrink-0" />
                            <span className="font-medium">Approval in Principle (AIP)</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => onIconClick('approval-in-principle')}
                            >
                              <Info className="h-4 w-4 text-blue-500" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-1">
                            <ArrowRight className="h-4 w-4 flex-shrink-0" />
                            <span>Pre-Departure Orientation</span>
                          </div>
                        </div>
                      )}

                      {isCanada ? (
                        <div className="space-y-1 text-left">
                          <div className="flex items-center gap-1">
                            <ArrowRight className="h-4 w-4 flex-shrink-0" />
                            <span className="font-medium">Passport Submission Request</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 ml-0.5"
                              onClick={() => onIconClick('passport-submission')}
                            >
                              <Info className="h-4 w-4 text-blue-500" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-1">
                            <ArrowRight className="h-4 w-4 flex-shrink-0" />
                            <span className="font-medium">POE Introduction Letter</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 ml-0.5"
                              onClick={() => onIconClick('poe-letter')}
                            >
                              <Info className="h-4 w-4 text-blue-500" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-1">
                            <ArrowRight className="h-4 w-4 flex-shrink-0" />
                            <span>Pre-Departure Orientation</span>
                          </div>
                        </div>
                      ) : (
                        !isNewZealand && (
                          <div className="flex items-center gap-1">
                            <ArrowRight className="h-4 w-4" />
                            <span>Pre-Departure Orientation</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-center text-center p-4 rounded-lg border bg-red-50 border-red-200">
                    <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border bg-white border-red-200 shadow-sm mb-3">
                      <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <h4 className="font-bold text-red-700 text-base mb-1">Visa Refused</h4>
                    <div className="flex items-center gap-2 text-sm text-red-800">
                      <ArrowRight className="h-4 w-4" />
                      <span>Refund Assistance</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 rounded-xl bg-blue-50 p-5 border border-blue-100 text-blue-800 flex items-center justify-center text-center gap-3">
          <div className="text-sm max-w-2xl">
            <p className="font-bold mb-1 flex items-center justify-center gap-2">
              {showIcons && <UserCheck className="h-4 w-4" />}
              Important Note:
            </p>
            <p>
              This is a general guide. Processing times and specific requirements may vary depending on individual circumstances, document gathering, and visa application processing times. Our team will guide the student through each step to ensure a smooth application.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
