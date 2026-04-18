
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/layout/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/forms/radio-group";
import { Label } from "@/components/ui/forms/label";
import { Plane } from "lucide-react";
import type { Answers } from "@/lib/core/types";

interface VisitedDestinationCardProps {
  answers: Answers;
  onAnswerChange: (id: keyof Answers, value: string) => void;
}

export default function VisitedDestinationCard({ answers, onAnswerChange: onAnswer }: VisitedDestinationCardProps) {
  const { studyDestination } = answers;

  if (!studyDestination) {
    return null;
  }

  const questionText = `Has the student visited ${studyDestination}?`;

  return (
    <Card className="w-full animate-in fade-in-0 duration-500">
      <CardHeader className="p-4 pb-4 md:p-6 md:pb-4">
        <CardTitle className="flex items-center gap-3 text-xl md:text-2xl text-[#004097]">
          <Plane className="h-7 w-7 text-yellow-500" />
          Previous Visits
        </CardTitle>
        <CardDescription className="pt-0">
          {questionText}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
        <RadioGroup
          onValueChange={(value) => onAnswer('hasVisitedDestination', value)}
          value={answers.hasVisitedDestination ?? ''}
          className="flex flex-col sm:flex-row sm:items-center gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Yes" id="visited-yes" />
            <Label htmlFor="visited-yes" className="cursor-pointer">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="No" id="visited-no" />
            <Label htmlFor="visited-no" className="cursor-pointer">No</Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
