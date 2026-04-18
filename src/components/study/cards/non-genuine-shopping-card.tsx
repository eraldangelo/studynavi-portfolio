'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/layout/card';
import { Label } from '@/components/ui/forms/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/forms/radio-group';
import type { Answers, Question } from '@/lib/core/types';

export default function NonGenuineShoppingCard({
  question,
  answers,
  onAnswerChange,
}: {
  question: Question;
  answers: Answers;
  onAnswerChange: (id: keyof Answers, value: any) => void;
}) {
  const value = (answers.isShoppingNonGenuine || '') as string;

  const clearRecommendations = () => {
    onAnswerChange('recommendedSchool', '');
    onAnswerChange('recommendedProgram', '');
    onAnswerChange('recommendedProgramDuration', '');
    onAnswerChange('recommendedEnglishTestRequirement', '');
    onAnswerChange('recommendedApproximateCost', '');
    onAnswerChange('recommendedBriefInfo', '');
  };

  return (
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
      </CardHeader>
      <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
        <RadioGroup
          value={value}
          onValueChange={(next) => {
            onAnswerChange('isShoppingNonGenuine', next);
            if (next !== 'Yes') {
              clearRecommendations();
            }
          }}
          className="flex flex-col space-y-3"
        >
          {(question.options as string[]).map((option) => {
            const optionId = `is-shopping-${option.toLowerCase()}`;
            return (
              <div key={option} className="flex items-center space-x-3">
                <RadioGroupItem value={option} id={optionId} />
                <Label htmlFor={optionId} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
