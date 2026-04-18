// @/components/school-and-program/intake-date-section.tsx
import { Label } from "@/components/ui/forms/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/forms/select";
import { Button } from "@/components/ui/forms/button";
import { Info } from "lucide-react";
import type { Answers } from "@/lib/core/types";

interface IntakeDateSectionProps {
  answers: Answers;
  onAnswerChange: (id: keyof Answers, value: any) => void;
  onModalOpen: (modalId: string) => void;
  years: number[];
  months: Array<{value: string, label: string}>;
}

export const IntakeDateSection = ({ 
  answers, 
  onAnswerChange, 
  onModalOpen, 
  years, 
  months 
}: IntakeDateSectionProps) => {
  
  const handleCanadaPgwpInfoClick = () => {
    const diplomaCategories = ['Certificate', 'Diploma', 'Advanced Diploma', 'Post-Graduate Certificate', 'Post-Graduate Diploma', 'Associate Degree'];
    const degreeCategories = ['Bachelor’s Degree', 'Professional Degree'];
    const mastersPhdCategories = ["Master Degree", "Doctorate (PhD)"];
    
    if (diplomaCategories.includes(answers.programCategory || '')) {
      onModalOpen('CANADA_PGWP_DIPLOMA_INFO');
    } else if (degreeCategories.includes(answers.programCategory || '')) {
      onModalOpen('CANADA_PGWP_DEGREE_INFO');
    } else if (mastersPhdCategories.includes(answers.programCategory || '')) {
      onModalOpen('CANADA_PGWP_MASTERS_INFO');
    } else {
      onModalOpen('CANADA_PGWP_DIPLOMA_INFO');
    }
  };

  return (
    <div className="space-y-2">
      <Label>Planned intake date</Label>
      <div className="grid grid-cols-2 gap-4 mt-2">
        <Select onValueChange={(val) => onAnswerChange('intakeYear', val)} value={answers.intakeYear ?? ''}>
          <SelectTrigger>
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map(year => (
              <SelectItem key={year} value={String(year)}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={(val) => onAnswerChange('intakeMonth', val)} value={answers.intakeMonth ?? ''}>
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
      
      {/* Destination-specific info buttons */}
      {answers.studyDestination === 'Australia' && !['ELICOS', 'Foundation Studies', 'Secondary School'].includes(answers.programCategory || '') && (
        <DestinationInfoButton
          label="Subclass 485: Temporary Graduate Visa Information"
          onClick={() => {
            if (answers.programCategory === 'Vocational') {
              onModalOpen('AUSTRALIA_POST_GRADUATE_VISA_VOCATIONAL_INFO');
            } else if (['Master Research', 'PhD'].includes(answers.programCategory || '')) {
              onModalOpen('AUSTRALIA_POST_GRADUATE_VISA_RESEARCH_INFO');
            } else {
              onModalOpen('AUSTRALIA_POST_GRADUATE_VISA_INFO');
            }
          }}
        />
      )}
      
      {answers.studyDestination === 'New Zealand' && (
        <DestinationInfoButton
          label="Post-Study Work Visa Information"
          onClick={() => onModalOpen('NZ_POST_STUDY_WORK_VISA')}
        />
      )}
      
      {answers.studyDestination === 'Ireland' && (
        <DestinationInfoButton
          label="Post-Graduate Visa Information"
          onClick={() => onModalOpen('IRELAND_POST_STUDY_WORK_VISA')}
        />
      )}
      
      {answers.studyDestination === 'Canada' && (
        <DestinationInfoButton
          label="Post-Graduation Work Permit information"
          onClick={handleCanadaPgwpInfoClick}
        />
      )}
    </div>
  );
};

const DestinationInfoButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <div className='mt-2 space-y-2'>
    <div className="flex items-center gap-2">
      <span className="text-sm italic text-red-600">{label}</span>
      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClick}>
        <Info className="h-4 w-4 text-blue-500" />
      </Button>
    </div>
  </div>
);
