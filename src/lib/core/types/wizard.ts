import type { LucideIcon } from 'lucide-react';
import type { ComponentType } from 'react';
import type {
  FinancialCalculationResult,
  FinancialDocumentCalculationResult,
} from '@/services/financials/common';
import type { ExchangeRates } from '@/services/exchange-rate-service';
import type { ModalID } from './modal';

export interface Answers {
  studyDestination?: string;
  hasVisitedDestination?: string;
  visaRefusal?: string;
  financialSponsor?: string;
  noSponsorFollowupTriggered?: boolean;
  isShoppingNonGenuine?: '' | 'Yes' | 'No';
  maritalStatus?: string | null;
  visaAssistance?: string | null;
  numberOfChildren?: string | null;
  children_0_4?: string;
  children_5_10?: string;
  children_11_14?: string;
  children_15_plus?: string;
  numberOfSchoolAgeChildren?: string | null;
  numberOfNonSchoolAgeChildren?: string | null;
  childAgeCategory?: string[];
  ieltsPreparation?: string | null;
  englishTestType?: string | null;
  englishTestScore?: string | null;
  englishTestDate?: string;
  plannedEnglishTest?: string | null;
  plannedEnglishTestDate?: string | null;
  plannedEnglishTestMonth?: string;
  plannedEnglishTestYear?: string;
  highestEducation?: string | null;
  hasWorkExperience?: string;
  isCurrentlyWorking?: string;
  hasBusiness?: string;
  hasStudyWorkGap?: string;
  schoolName?: string;
  program?: string;
  programDuration?: string;
  campusLocation?: string;
  intakeDate?: string | null;
  intakeMonth?: string;
  intakeYear?: string;
  programCategory?: string;
  ieltsScore?: string;
  pteScore?: string;
  toeflScore?: string;
  duolingoScore?: string;
  isOverallScore?: string;
  satActRequired?: string;
  satActScore?: string;
  ibEntryScore?: string;
  paymentType?: string;
  annualTuitionFee?: string;
  scholarshipType?: string;
  scholarshipPercentage?: string;
  scholarshipAmount?: string;
  tuitionFeeDeposit?: string;
  manualPayment?: string;
  requiredTBTest?: string;
  englishTestRequired?: string;
  isSubsequentEntry?: string;
  isIELTSSelected?: string;
  hasMOI?: string;
  isMultipleEntryVisa?: string;
  financialEvidenceFor1YearOnly?: string;
  financialEvidenceFor2YearsOnly?: string;
  schoolWillAssist?: string;
  schoolApplicationFee?: string;
  applicationFeeWaived?: string;
  recommendedSchool?: string;
  recommendedProgram?: string;
  recommendedProgramDuration?: string;
  recommendedEnglishTestRequirement?: string;
  recommendedApproximateCost?: string;
  recommendedBriefInfo?: string;
  nonGenuineRecommendations?: {
    recommendedSchool: string;
    recommendedProgram: string;
    programDuration: string;
    englishTestRequirement: string;
    approximateCost: string;
    briefInfo: string;
  }[];
  [key: string]: any;
}

type QuestionOption =
  | string
  | {
      name: string;
      flagUrl?: string;
      disabled?: boolean;
      status?: 'under-construction';
    };

export interface Question {
  id:
    | keyof Answers
    | 'schoolAndProgram'
    | 'nonGenuineRecommendation'
    | 'paymentDetails'
    | 'financialDocuments'
    | 'requiredDocuments'
    | 'review'
    | 'visaProcess';
  step: number;
  title: string;
  icon: LucideIcon;
  component: ComponentType<any>;
  options?: QuestionOption[];
  type?: 'radio';
  description?: string;
  workExperienceQuestions?: {
    id: keyof Answers;
    prompt: string;
    options: string[];
  }[];
}

export interface WizardStepProps {
  question: Question;
  answers: Answers;
  onAnswerChange: (id: keyof Answers, value: any) => void;
  setModalId: (id: ModalID | null) => void;
  paymentDetails?: FinancialCalculationResult | null;
  financialDocuments?: FinancialDocumentCalculationResult | null;
  isLoadingRates?: boolean;
  rateError?: string | null;
  exchangeRates?: ExchangeRates | null;
}
