'use client';

import { Globe, CircleDollarSign, BookUser, Languages, GraduationCap, School, Landmark, ShieldAlert, FileText, FileCheck2, Heart, Plane, ListChecks, AlertTriangle } from 'lucide-react';
import type { Question } from '@/lib/core/types';

import QuestionCard from '@/components/study/cards/question-card';
import VisaRefusalCard from '@/components/study/cards/visa-refusal-card';
import FinancialSponsorshipCard from '@/components/study/cards/financial-sponsorship-card';
import BringingDependentsCard from '@/components/study/cards/bringing-dependents-card';
import SchoolAndProgramCard from '@/components/school-and-program/school-and-program-card-refactored';
import PaymentDetailsCard from '@/components/study/cards/payment-details-card';
import FinancialDocumentsCard from '@/components/study/cards/financial-documents-card';
import EnglishTestCard from '@/components/study/cards/english-test-card';
import RequiredDocumentsCard from '@/components/study/cards/required-documents-card';
import ComputationSheet from '@/components/study/views/computation-sheet';
import VisitedDestinationCard from '@/components/study/cards/visited-destination-card';
import VisaProcessCard from '@/components/study/cards/visa-process-card';
import NonGenuineShoppingCard from '@/components/study/cards/non-genuine-shopping-card';
import NonGenuineRecommendationCard from '@/components/study/cards/non-genuine-recommendation-card';


export const QUESTIONS: Question[] = [
  {
    id: 'studyDestination',
    step: 1,
    title: 'Study Destination',
    icon: Globe,
    type: 'radio',
    component: QuestionCard,
    options: [
        { name: 'Australia', flagUrl: 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/au.svg' },
        { name: 'Canada', flagUrl: 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/ca.svg' },
        { name: 'Ireland', flagUrl: 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/ie.svg' },
        { name: 'New Zealand', flagUrl: 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/nz.svg' },
    ],
    description: "Select the student's preferred destination."
  },
  {
    id: 'hasVisitedDestination',
    step: 1,
    title: 'Previous Visits',
    icon: Plane,
    component: VisitedDestinationCard,
  },
  {
    id: 'visaRefusal',
    step: 1,
    title: 'Visa Refusal History',
    icon: ShieldAlert,
    component: VisaRefusalCard,
    description: 'Have you had a visa application refused by any country in the past 10 years?'
  },
  {
    id: 'financialSponsor',
    step: 2,
    title: 'Financial Sponsorship',
    icon: CircleDollarSign,
    component: FinancialSponsorshipCard,
    options: ['Yes', 'No', 'Not yet sure'],
    description: 'Does the student have a sponsor for their financial needs?'
  },
  {
    id: 'isShoppingNonGenuine',
    step: 2,
    title: 'Non-Genuine / Shopping Check',
    icon: AlertTriangle,
    component: NonGenuineShoppingCard,
    options: ['Yes', 'No'],
    description: 'Do you feel that the student is just shopping or Non-Genuine Student?'
  },
  {
    id: 'maritalStatus',
    step: 3,
    title: 'Marital Status',
    icon: Heart,
    type: 'radio',
    component: QuestionCard,
    options: [
      'Never Married',
      'Single Parent',
      'De Facto / Common Law',
      'Married',
      'Divorced',
      'Widowed'
    ],
    description: "Please select the student's current marital status."
  },
  {
    id: 'visaAssistance',
    step: 3,
    title: 'Bringing Dependents',
    icon: BookUser,
    component: BringingDependentsCard,
    options: [
        'Spouse/De Facto',
        'Child/ren',
        'Spouse/De Facto and Child/ren',
        'No'
    ],
  },
  {
    id: 'ieltsPreparation',
    step: 4,
    title: 'English Test Status',
    icon: Languages,
    component: EnglishTestCard,
    options: ['Yes', 'No', 'Student has MOI', 'Will sit for an English Test'],
  },
  {
    id: 'highestEducation',
    step: 5,
    title: 'Highest Education Attainment',
    icon: GraduationCap,
    type: 'radio',
    component: QuestionCard,
    options: [
        'Junior High School',
        'High School Graduate (Old Curriculum)',
        'Senior High School',
        'International Baccalaureate / GCE A-Levels',
        'TESDA Certificate',
        'Associate Degree',
        'Bachelor Degree (Did Not Finish)',
        "Bachelor's Degree",
        'Master Degree',
        'PhD'
    ],
    workExperienceQuestions: [
        {
            id: 'hasWorkExperience',
            prompt: 'Has the student worked before?',
            options: ['Yes', 'No'],
        },
        {
            id: 'isCurrentlyWorking',
            prompt: 'Is the student currently working?',
            options: ['Yes', 'No'],
        },
        {
            id: 'hasBusiness',
            prompt: 'Does the student own or manage a business?',
            options: ['Yes', 'No'],
        },
        {
            id: 'hasStudyWorkGap',
            prompt: 'Has the student had a study or work gap of more than 6 months?',
            options: ['Yes', 'No'],
        },
    ]
  },
  {
    id: 'schoolAndProgram',
    step: 6,
    title: 'Target School & Program',
    icon: School,
    component: SchoolAndProgramCard,
  },
  {
    id: 'nonGenuineRecommendation',
    step: 6,
    title: 'Non-Genuine Recommendation',
    icon: ShieldAlert,
    component: NonGenuineRecommendationCard,
  },
  {
    id: 'paymentDetails',
    step: 7,
    title: 'Tuition Fee Details',
    icon: CircleDollarSign,
    component: PaymentDetailsCard,
  },
  {
    id: 'financialDocuments',
    step: 8,
    title: 'Financial Documents Details',
    icon: Landmark,
    component: FinancialDocumentsCard,
  },
  {
    id: 'requiredDocuments',
    step: 9,
    title: 'School & Visa Application Required Documents',
    icon: FileText,
    component: RequiredDocumentsCard,
  },
  {
    id: 'visaProcess',
    step: 10,
    title: 'Student Visa Process',
    icon: ListChecks,
    component: VisaProcessCard,
  },
  {
    id: 'review',
    step: 11,
    title: 'Review and Download',
    icon: FileCheck2,
    component: ComputationSheet,
  },
];

export const TOTAL_STEPS = QUESTIONS.map(q => q.step).reduce((max, current) => Math.max(max, current), 0);
