'use client';

import { Label } from "@/components/ui/forms/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/forms/select";
import { CurrencyInput } from "@/components/ui/forms/currency-input";
import { PercentageInput } from "@/components/ui/forms/percentage-input";
import type { Answers } from "@/lib/core/types";

interface ScholarshipSectionProps {
  answers: Answers;
  onAnswer: (id: keyof Answers, value: any) => void;
  scholarshipInputType: 'percentage' | 'amount';
  setScholarshipInputType: (type: 'percentage' | 'amount') => void;
  currencySymbol: string;
  currencyCode: string;
  totalCourseFeeBeforeScholarship: number;
  totalCourseFeeAfterScholarship: number;
  scholarshipAmount: number;
  phpRate: number;
}

export default function ScholarshipSection({
  answers,
  onAnswer,
  scholarshipInputType,
  setScholarshipInputType,
  currencySymbol,
  currencyCode,
  totalCourseFeeBeforeScholarship,
  totalCourseFeeAfterScholarship,
  scholarshipAmount,
  phpRate,
}: ScholarshipSectionProps) {

  const formatCurrency = (value: number) => 
    value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  const formatPhp = (value: number) => 
    (value * phpRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 border-t pt-6 mt-6 border-b pb-6 mb-6">
      <div className="space-y-2">
        <Label htmlFor="scholarshipInputType">Scholarship Input Type</Label>
        <Select 
          onValueChange={(val: 'percentage' | 'amount') => setScholarshipInputType(val)} 
          value={scholarshipInputType}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select input type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">Percentage</SelectItem>
            <SelectItem value="amount">Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="scholarshipType">Scholarship Type</Label>
        <Select 
          onValueChange={(val) => onAnswer('scholarshipType', val)} 
          value={answers.scholarshipType ?? ''}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select scholarship type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="upfront">Upfront</SelectItem>
            <SelectItem value="next_semester">Next Semester</SelectItem>
            <SelectItem value="first_year_only">1st Year Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {scholarshipInputType === 'percentage' ? (
        <div className="space-y-2">
          <Label htmlFor="scholarshipPercentage">Scholarship (%)</Label>
          <PercentageInput 
            id="scholarshipPercentage"
            placeholder="Enter scholarship percentage"
            value={answers.scholarshipPercentage ?? ''}
            onChange={(value) => onAnswer('scholarshipPercentage', value)}
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="scholarshipAmount">Scholarship Amount Annually ({currencyCode})</Label>
          <CurrencyInput 
            id="scholarshipAmount"
            placeholder="Enter scholarship amount"
            value={answers.scholarshipAmount ?? ''}
            onChange={(value) => onAnswer('scholarshipAmount', value)}
            symbol={currencySymbol}
          />
        </div>
      )}

      {/* Scholarship Summary Display removed as it is redundant */}
    </div>
  );
}
