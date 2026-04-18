// @/components/school-and-program/english-test-section.tsx
import { Label } from "@/components/ui/forms/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/forms/select";
import { Checkbox } from "@/components/ui/forms/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/display/alert";
import { Info } from "lucide-react";
import { IELTS_SCORES } from "@/lib/programs/program-constants";
import type { Answers } from "@/lib/core/types";

interface EnglishTestSectionProps {
  answers: Answers;
  onAnswerChange: (id: keyof Answers, value: any) => void;
  showEnglishTestRequirement: boolean;
  showDuolingo: boolean;
}

export const EnglishTestSection = ({
  answers,
  onAnswerChange,
  showEnglishTestRequirement,
  showDuolingo
}: EnglishTestSectionProps) => {
  
  if (!showEnglishTestRequirement) {
    return (
      <div className="md:col-span-2">
        <Alert>
          <Info className="h-4 w-4" color="red" />
          <AlertTitle className="font-bold text-[#004097]">English Test Requirements</AlertTitle>
          <AlertDescription>
            Some courses may waive the English test requirement for students who have completed the International Baccalaureate / GCE A-Levels. Please coordinate with the school representative after the consultation to determine if the student requires an English Placement Test.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="md:col-span-2 space-y-4">
      <Label className="text-base font-medium">English Test Requirement</Label>
      <div className={`grid grid-cols-2 ${showDuolingo ? 'sm:grid-cols-4' : 'sm:grid-cols-3'} gap-x-4 sm:gap-x-8 gap-y-4`}>
        <div>
          <Label htmlFor="ieltsScore">IELTS</Label>
          <Select
            value={answers.ieltsScore ?? ''}
            onValueChange={(value) => onAnswerChange('ieltsScore', value)}
          >
            <SelectTrigger className="w-full mt-2">
              <SelectValue placeholder="Select score" />
            </SelectTrigger>
            <SelectContent>
              {IELTS_SCORES.map(score => (
                <SelectItem key={score} value={score}>{score}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="pteScore">PTE</Label>
          <p className="mt-2 text-lg font-semibold text-[#004097] h-10 flex items-center">
            {answers.pteScore ?? ''}
          </p>
        </div>
        
        <div>
          <Label htmlFor="toeflScore">TOEFL iBT</Label>
          <p className="mt-2 text-lg font-semibold text-[#004097] h-10 flex items-center">
            {answers.toeflScore ?? ''}
          </p>
        </div>
        
        {showDuolingo && (
          <div>
            <Label htmlFor="duolingoScore">Duolingo</Label>
            <p className="mt-2 text-lg font-semibold text-[#004097] h-10 flex items-center">
              {answers.duolingoScore ?? ''}
            </p>
          </div>
        )}
      </div>
      
      <div className="flex items-center mt-4">
        <Checkbox
          id="isOverallScore"
          checked={answers.isOverallScore === 'true'}
          onCheckedChange={(checked) => onAnswerChange('isOverallScore', checked ? 'true' : 'false')}
        />
        <Label
          htmlFor="isOverallScore"
          className="ml-3 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          Is this for all bands or just overall?
        </Label>
      </div>
    </div>
  );
};
