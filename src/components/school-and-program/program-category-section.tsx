// @/components/school-and-program/program-category-section.tsx
import { Label } from "@/components/ui/forms/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/forms/select";
import { Button } from "@/components/ui/forms/button";
import { Info } from "lucide-react";
import type { Answers } from "@/lib/core/types";

interface ProgramCategorySectionProps {
  answers: Answers;
  onAnswerChange: (id: keyof Answers, value: any) => void;
  onModalOpen: (modalId: string) => void;
  programCategories: string[];
  onProgramCategoryChange: (value: string) => void;
}

export const ProgramCategorySection = ({
  answers,
  onAnswerChange,
  onModalOpen,
  programCategories,
  onProgramCategoryChange
}: ProgramCategorySectionProps) => {
  
  const handleWorkRightsInfoClick = () => {
    const { maritalStatus, visaAssistance, programCategory } = answers;
    const hasPartner = ['De Facto / Common Law', 'Married'].includes(maritalStatus || '');
    const isBringingPartner = ['Spouse/De Facto', 'Spouse/De Facto and Child/ren'].includes(visaAssistance || '');
    
    if (programCategory === 'ELICOS') {
      onModalOpen(isBringingPartner && hasPartner ? 'ELICOS_WORK_RIGHTS_DEPENDENT' : 'ELICOS_WORK_RIGHTS_SINGLE');
    } else if (programCategory === 'Vocational') {
      onModalOpen(isBringingPartner && hasPartner ? 'WORK_RIGHTS_VOCATIONAL_DEPENDENT' : 'WORK_RIGHTS_VOCATIONAL_SINGLE');
    } else if (programCategory === 'Bachelor') {
      onModalOpen(isBringingPartner && hasPartner ? 'BACHELOR_WORK_RIGHTS_DEPENDENT' : 'BACHELOR_WORK_RIGHTS_SINGLE');
    } else if (['Pre-Masters Program', 'Master Coursework'].includes(programCategory || '')) {
      onModalOpen(isBringingPartner && hasPartner ? 'MASTERS_WORK_RIGHTS_DEPENDENT' : 'MASTERS_WORK_RIGHTS_SINGLE');
    } else if (programCategory === 'Master Research') {
      onModalOpen('MASTERS_RESEARCH_WORK_RIGHTS');
    } else if (programCategory === 'PhD') {
      onModalOpen('PHD_WORK_RIGHTS');
    } else {
      onModalOpen('WORK_RIGHTS_VOCATIONAL_SINGLE');
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="programCategory" className="flex items-center gap-2">
        Program Category
        {answers.studyDestination === 'Australia' && (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onModalOpen('AUSTRALIA_AGE_LIMIT_INFO')}>
            <Info className="h-4 w-4 text-blue-500" />
          </Button>
        )}
      </Label>
      
      <Select
        value={answers.programCategory ?? ''}
        onValueChange={onProgramCategoryChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          {programCategories.map(category => (
            <SelectItem key={category} value={category}>{category}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* Destination-specific work rights info */}
      {answers.studyDestination === 'Australia' && !['Foundation Studies', 'Secondary School'].includes(answers.programCategory || '') && (
        <DestinationWorkRightsButton
          label="Work Rights Information"
          onClick={handleWorkRightsInfoClick}
        />
      )}
      
      {answers.studyDestination === 'Ireland' && (
        <DestinationWorkRightsButton
          label="Work Rights Information"
          onClick={() => onModalOpen('IRELAND_WORK_RIGHTS')}
        />
      )}
      
      {answers.studyDestination === 'Canada' && (
        <DestinationWorkRightsButton
          label="Work Rights Information"
          onClick={() => onModalOpen('CANADA_WORK_RIGHTS_INFO')}
        />
      )}
      
      {answers.studyDestination === 'New Zealand' && (
        <div className="mt-2 space-y-0">
          <div className="flex items-center gap-2">
            <span className="text-sm italic text-red-600">Work Rights Information</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onModalOpen('NZ_WORK_RIGHTS_INFO')}>
              <Info className="h-4 w-4 text-blue-500" />
            </Button>
          </div>
          <a 
            href="https://www.immigration.govt.nz/work/requirements-for-work-visas/green-list-occupations-qualifications-and-skills/green-list-roles-jobs-we-need-people-for-in-new-zealand/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm text-blue-600 hover:underline block"
          >
            Check Green List for New Zealand
          </a>
        </div>
      )}
    </div>
  );
};

const DestinationWorkRightsButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <div className='mt-2 space-y-2'>
    <div className="flex items-center gap-2">
      <span className="text-sm italic text-red-600">{label}</span>
      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClick}>
        <Info className="h-4 w-4 text-blue-500" />
      </Button>
    </div>
  </div>
);
