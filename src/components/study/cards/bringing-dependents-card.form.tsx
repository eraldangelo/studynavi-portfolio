'use client';

import { Info } from 'lucide-react';
import { Button } from '@/components/ui/forms/button';
import { Checkbox } from '@/components/ui/forms/checkbox';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/forms/radio-group';
import type { Answers, ModalID } from '@/lib/core/types';

interface BringingDependentsFormProps {
  selectedValue: string;
  filteredOptions: string[];
  isNewZealand: boolean;
  showCanadaChildOptions: boolean;
  showNzChildOptions: boolean;
  showChildrenCount: boolean;
  answers: Answers;
  onValueChange: (value: string) => void;
  onInfoClick: (e: React.MouseEvent, id: ModalID) => void;
  onCanadaAgeGroupChange: (e: React.ChangeEvent<HTMLInputElement>, ageGroup: keyof Answers) => void;
  isSchoolAgeChecked: boolean;
  isNonSchoolAgeChecked: boolean;
  onNzChildCategoryChange: (checked: boolean, category: 'school_age' | 'non_school_age') => void;
  onNzChildrenCountChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'school_age' | 'non_school_age',
  ) => void;
  onChildrenChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function BringingDependentsForm({
  selectedValue,
  filteredOptions,
  isNewZealand,
  showCanadaChildOptions,
  showNzChildOptions,
  showChildrenCount,
  answers,
  onValueChange,
  onInfoClick,
  onCanadaAgeGroupChange,
  isSchoolAgeChecked,
  isNonSchoolAgeChecked,
  onNzChildCategoryChange,
  onNzChildrenCountChange,
  onChildrenChange,
}: BringingDependentsFormProps) {
  return (
    <>
      <RadioGroup value={selectedValue} onValueChange={onValueChange} className="flex flex-col space-y-3">
        {filteredOptions.map((option) => {
          const optionId = option.replace(/\s+/g, '-');
          const showSpouseInfo =
            isNewZealand && (option === 'Spouse/De Facto' || option === 'Spouse/De Facto and Child/ren');

          return (
            <div key={option} className="flex items-center space-x-3">
              <RadioGroupItem value={option} id={optionId} />
              <Label htmlFor={optionId} className="flex items-center gap-2 flex-1 cursor-pointer">
                {option}
                {showSpouseInfo && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => onInfoClick(e, 'NZ_SPOUSE_VISA_INFO')}
                  >
                    <Info className="h-4 w-4 text-blue-500" />
                  </Button>
                )}
              </Label>
            </div>
          );
        })}
      </RadioGroup>

      {showCanadaChildOptions && (
        <div className="mt-6 space-y-4 animate-in fade-in-0 duration-500">
          <Label>Number of child/ren by age group</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="children_0_4" className="text-sm text-muted-foreground">0-4 years</Label>
              <Input
                id="children_0_4"
                type="number"
                placeholder="0"
                value={answers.children_0_4 || ''}
                onChange={(e) => onCanadaAgeGroupChange(e, 'children_0_4')}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="children_5_10" className="text-sm text-muted-foreground">5-10 years</Label>
              <Input
                id="children_5_10"
                type="number"
                placeholder="0"
                value={answers.children_5_10 || ''}
                onChange={(e) => onCanadaAgeGroupChange(e, 'children_5_10')}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="children_11_14" className="text-sm text-muted-foreground">11-14 years</Label>
              <Input
                id="children_11_14"
                type="number"
                placeholder="0"
                value={answers.children_11_14 || ''}
                onChange={(e) => onCanadaAgeGroupChange(e, 'children_11_14')}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="children_15_plus" className="text-sm text-muted-foreground">15+ years</Label>
              <Input
                id="children_15_plus"
                type="number"
                placeholder="0"
                value={answers.children_15_plus || ''}
                onChange={(e) => onCanadaAgeGroupChange(e, 'children_15_plus')}
                className="mt-1"
              />
            </div>
          </div>
        </div>
      )}

      {showNzChildOptions && (
        <div className="mt-6 space-y-4 animate-in fade-in-0 duration-500">
          <Label>Child/Children of Student Visa</Label>
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="school_age"
                  checked={isSchoolAgeChecked}
                  onCheckedChange={(checked) => onNzChildCategoryChange(checked as boolean, 'school_age')}
                />
                <Label htmlFor="school_age" className="flex items-center gap-2 flex-1 cursor-pointer">
                  School Age (5 to 19 Years Old)
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => onInfoClick(e, 'NZ_CHILD_SCHOOL_AGE')}
                  >
                    <Info className="h-4 w-4 text-blue-500" />
                  </Button>
                </Label>
              </div>

              {isSchoolAgeChecked && (
                <div className="ml-0 sm:ml-6">
                  <Label
                    htmlFor="numberOfSchoolAgeChildren"
                    className="text-sm text-muted-foreground mb-1 block"
                  >
                    Number of child/ren
                  </Label>
                  <Input
                    id="numberOfSchoolAgeChildren"
                    type="number"
                    value={answers.numberOfSchoolAgeChildren || ''}
                    onChange={(e) => onNzChildrenCountChange(e, 'school_age')}
                    placeholder="0"
                    className="w-full sm:max-w-[100px]"
                    min="0"
                    max="5"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="non_school_age"
                  checked={isNonSchoolAgeChecked}
                  onCheckedChange={(checked) => onNzChildCategoryChange(checked as boolean, 'non_school_age')}
                />
                <Label htmlFor="non_school_age" className="flex items-center gap-2 flex-1 cursor-pointer">
                  Non-School Age (Under 5 Years Old)
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => onInfoClick(e, 'NZ_CHILD_NON_SCHOOL_AGE')}
                  >
                    <Info className="h-4 w-4 text-blue-500" />
                  </Button>
                </Label>
              </div>

              {isNonSchoolAgeChecked && (
                <div className="ml-0 sm:ml-6">
                  <Label
                    htmlFor="numberOfNonSchoolAgeChildren"
                    className="text-sm text-muted-foreground mb-1 block"
                  >
                    Number of child/ren
                  </Label>
                  <Input
                    id="numberOfNonSchoolAgeChildren"
                    type="number"
                    value={answers.numberOfNonSchoolAgeChildren || ''}
                    onChange={(e) => onNzChildrenCountChange(e, 'non_school_age')}
                    placeholder="0"
                    className="w-full sm:max-w-[100px]"
                    min="0"
                    max="5"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showChildrenCount && (
        <div className="mt-6 space-y-2 animate-in fade-in-0 duration-500">
          <Label htmlFor="numberOfChildren">Number of child/ren</Label>
          <Input
            id="numberOfChildren"
            type="number"
            value={answers.numberOfChildren || ''}
            onChange={onChildrenChange}
            placeholder="Enter number of children"
            className="w-full sm:max-w-xs"
            max="5"
          />
        </div>
      )}
    </>
  );
}
