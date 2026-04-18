// @/components/school-and-program/program-duration-location.tsx
import { Input } from "@/components/ui/forms/input";
import { Label } from "@/components/ui/forms/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/forms/select";
import type { Answers } from "@/lib/core/types";

interface ProgramDurationLocationProps {
  answers: Answers;
  onAnswerChange: (id: keyof Answers, value: any) => void;
  programDurations: string[];
}

export const ProgramDurationLocation = ({ 
  answers, 
  onAnswerChange, 
  programDurations 
}: ProgramDurationLocationProps) => {
  
  const handleDurationChange = (value: string) => {
    onAnswerChange('programDuration', value);
  };

  return (
    <>
      <div>
        <Label htmlFor="programDuration">Program Duration</Label>
        <Select
          value={answers.programDuration ?? ''}
          onValueChange={handleDurationChange}
        >
          <SelectTrigger className="w-full mt-2">
            <SelectValue placeholder="Select program duration" />
          </SelectTrigger>
          <SelectContent>
            {programDurations.map(duration => (
              <SelectItem key={duration} value={duration}>{duration}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="campusLocation">Campus/Location</Label>
        <Input 
          id="campusLocation"
          placeholder="Enter campus or location"
          value={answers.campusLocation ?? ''}
          onChange={(e) => onAnswerChange('campusLocation', e.target.value)}
          className="mt-2"
        />
      </div>
    </>
  );
};
