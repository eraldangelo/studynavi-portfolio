
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/layout/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/forms/select";
import { Input } from "@/components/ui/forms/input";
import { Languages } from "lucide-react";
import type { Answers } from "@/lib/core/types";

interface EnglishTestDetailsCardProps {
  answers: Answers;
  onAnswerChange: (id: keyof Answers, value: string) => void;
}

export default function EnglishTestDetailsCard({ answers, onAnswerChange: onAnswer }: EnglishTestDetailsCardProps) {
  const isIreland = answers.studyDestination === 'Ireland';
  
  return (
    <Card className="w-full">
        <CardHeader className="p-4 pb-4 md:p-6 md:pb-4">
            <CardTitle className="flex items-center gap-3 text-xl md:text-2xl text-[#004097]">
                <Languages className="h-7 w-7 text-yellow-500" />
                What English test did the student take?
            </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select onValueChange={(val) => onAnswer('englishTestType', val)} value={answers.englishTestType ?? ''}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a test" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="IELTS">IELTS</SelectItem>
                        <SelectItem value="PTE">PTE</SelectItem>
                        <SelectItem value="TOEFL">TOEFL</SelectItem>
                        {isIreland && <SelectItem value="Duolingo">Duolingo</SelectItem>}
                    </SelectContent>
                </Select>
                <Input 
                    placeholder="Overall Score"
                    value={answers.englishTestScore ?? ''}
                    onChange={(e) => onAnswer('englishTestScore', e.target.value)}
                />
            </div>
        </CardContent>
    </Card>
  );
}

    
