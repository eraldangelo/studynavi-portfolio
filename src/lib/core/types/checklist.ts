export type ChecklistInput = {
  studyDestination: string[];
  financialSponsor: string;
  visaAssistance: string;
  ieltsPreparation: string;
  englishTestType?: string;
  englishTestScore?: string;
  highestEducation: string;
  plannedEnglishTest?: string;
  plannedEnglishTestDate?: string;
  numberOfChildren?: number;
  visaRefusal?: string;
};

export type ChecklistOutput = {
  checklist: string;
};
