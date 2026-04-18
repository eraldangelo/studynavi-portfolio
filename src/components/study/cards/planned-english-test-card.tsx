
'use client';

import { useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/layout/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/forms/select";
import { Languages } from "lucide-react";
import type { Answers } from "@/lib/core/types";

interface PlannedEnglishTestCardProps {
  answers: Answers;
  onAnswerChange: (id: keyof Answers, value: any) => void;
}

const allMonths = [
    { value: '01', label: 'January' }, { value: '02', label: 'February' },
    { value: '03', label: 'March' }, { value: '04', label: 'April' },
    { value: '05', label: 'May' }, { value: '06', label: 'June' },
    { value: '07', label: 'July' }, { value: '08', label: 'August' },
    { value: '09', label: 'September' }, { value: '10', label: 'October' },
    { value: '11', 'label': 'November' }, { value: '12', 'label': 'December' },
];

export default function PlannedEnglishTestCard({ answers, onAnswerChange: onAnswer }: PlannedEnglishTestCardProps) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-indexed
  const isIreland = answers.studyDestination === 'Ireland';

  const years = Array.from({ length: 2100 - currentYear + 1 }, (_, i) => currentYear + i);
  const months = useMemo(() => {
    const selectedYear = Number(answers.plannedEnglishTestYear);
    if (selectedYear === currentYear) {
      return allMonths.filter(month => Number(month.value) >= currentMonth);
    }
    return allMonths;
  }, [answers.plannedEnglishTestYear, currentYear, currentMonth]);

  useEffect(() => {
    const selectedYear = Number(answers.plannedEnglishTestYear);
    if (selectedYear === currentYear) {
      const selectedMonth = Number(answers.plannedEnglishTestMonth);
      if (selectedMonth < currentMonth) {
        onAnswer('plannedEnglishTestMonth', '');
      }
    }
  }, [answers.plannedEnglishTestYear, answers.plannedEnglishTestMonth, currentYear, currentMonth, onAnswer]);

  return (
    <Card className="w-full">
        <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl md:text-2xl text-[#004097]">
                <Languages className="h-7 w-7 text-yellow-500" />
                When is the student planning to take an English test?
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select onValueChange={(val) => onAnswer('plannedEnglishTest', val)} value={answers.plannedEnglishTest ?? ''}>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select onValueChange={(val) => onAnswer('plannedEnglishTestYear', val)} value={answers.plannedEnglishTestYear ?? ''}>
                        <SelectTrigger>
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map(year => (
                                <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select onValueChange={(val) => onAnswer('plannedEnglishTestMonth', val)} value={answers.plannedEnglishTestMonth ?? ''}>
                        <SelectTrigger>
                            <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map(month => (
                                <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </CardContent>
    </Card>
  );
}

    
