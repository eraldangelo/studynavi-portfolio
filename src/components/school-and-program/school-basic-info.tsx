// @/components/school-and-program/school-basic-info.tsx
import { Input } from "@/components/ui/forms/input";
import { Label } from "@/components/ui/forms/label";
import { Checkbox } from "@/components/ui/forms/checkbox";
import type { Answers } from "@/lib/core/types";
import { SchoolAutocompleteInput } from '@/components/common/forms/school-autocomplete-input';
import { shouldShowSatActFields, shouldShowIbFields, calculatePredictedIbScore } from "@/lib/programs/program-utils";

interface SchoolBasicInfoProps {
  answers: Answers;
  onAnswerChange: (id: keyof Answers, value: any) => void;
  onModalOpen: (modalId: string) => void;
}

export const SchoolBasicInfo = ({ answers, onAnswerChange, onModalOpen }: SchoolBasicInfoProps) => {
  const showSatActFields = shouldShowSatActFields(answers.highestEducation ?? undefined);
  const showIbFields = shouldShowIbFields(answers.highestEducation ?? undefined);
  const predictedIbScore = calculatePredictedIbScore(answers.ibEntryScore);

  const handleSatActChange = (checked: boolean | string) => {
    const isChecked = checked === true || checked === 'true';
    onAnswerChange('satActRequired', isChecked ? 'true' : 'false');
    if (isChecked) {
      onModalOpen('SAT_ACT_PATHWAY');
    } else {
      onAnswerChange('satActScore', '');
    }
  };

  return (
    <>
      <div>
        <Label htmlFor="schoolName">Name of desired school</Label>
        <SchoolAutocompleteInput
          id="schoolName"
          value={answers.schoolName ?? ''}
          onChange={(value) => onAnswerChange('schoolName', value)}
          placeholder="Enter school name"
          className="mt-2"
        />
      </div>
      
      <div>
        <Label htmlFor="program">Program</Label>
        <Input 
          id="program"
          placeholder="Enter program"
          value={answers.program ?? ''}
          onChange={(e) => onAnswerChange('program', e.target.value)}
          className="mt-2"
        />
      </div>

      {showSatActFields && (
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="flex items-center gap-3">
            <Checkbox
              id="satActRequired"
              checked={answers.satActRequired === 'true'}
              onCheckedChange={handleSatActChange}
            />
            <Label htmlFor="satActRequired" className="text-sm font-medium leading-none cursor-pointer">
              SAT/ACT required?
            </Label>
          </div>
          {answers.satActRequired === 'true' && (
            <div>
              <Label htmlFor="satActScore">Required SAT/ACT Score</Label>
              <Input 
                id="satActScore"
                placeholder="Enter score"
                value={answers.satActScore ?? ''}
                onChange={(e) => onAnswerChange('satActScore', e.target.value)}
                className="mt-2"
              />
            </div>
          )}
        </div>
      )}
      
      {showIbFields && (
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <Label htmlFor="ibEntryScore">IB Entry Score</Label>
            <Input 
              id="ibEntryScore"
              type="number"
              placeholder="Enter score"
              value={answers.ibEntryScore ?? ''}
              onChange={(e) => onAnswerChange('ibEntryScore', e.target.value)}
              className="mt-2"
            />
          </div>
          <div className="mt-6">
            <Label>IB Predicted Grades</Label>
            {predictedIbScore !== null ? (
              <p className="text-lg font-semibold text-[#004097]">{predictedIbScore}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Needed</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};
