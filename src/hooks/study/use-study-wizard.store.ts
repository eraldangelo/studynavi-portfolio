'use client';

import type { Answers } from '@/lib/core/types';

export type WizardAction =
  | { type: 'SET_ANSWER'; payload: { id: keyof Answers; value: any } }
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'RESET_WIZARD' }
  | { type: 'CLEAR_ANSWERS' };

export interface WizardState {
  currentStep: number;
  answers: Answers;
}

export const initialAnswers: Answers = {
  studyDestination: '',
  hasVisitedDestination: '',
  visaRefusal: '',
  financialSponsor: '',
  noSponsorFollowupTriggered: false,
  isShoppingNonGenuine: '',
  maritalStatus: null,
  visaAssistance: null,
  ieltsPreparation: null,
  englishTestType: null,
  englishTestScore: null,
  highestEducation: null,
  plannedEnglishTest: null,
  plannedEnglishTestDate: null,
  plannedEnglishTestMonth: '',
  plannedEnglishTestYear: '',
  numberOfChildren: null,
  children_0_4: '',
  children_5_10: '',
  children_11_14: '',
  children_15_plus: '',
  childAgeCategory: [],
  annualTuitionFee: '',
  programDuration: '',
  paymentType: '1_semester',
  intakeMonth: '',
  intakeYear: '',
  hasBusiness: '',
  ibEntryScore: '',
  isSubsequentEntry: 'false',
  englishTestRequired: 'true',
  isIELTSSelected: 'false',
  hasMOI: 'false',
  isMultipleEntryVisa: 'false',
  financialEvidenceFor1YearOnly: 'false',
  financialEvidenceFor2YearsOnly: 'false',
  schoolWillAssist: 'false',
  schoolApplicationFee: '',
  applicationFeeWaived: 'application_fee_waived_false',
  recommendedSchool: '',
  recommendedProgram: '',
  recommendedProgramDuration: '',
  recommendedEnglishTestRequirement: '',
  recommendedApproximateCost: '',
  recommendedBriefInfo: '',
  nonGenuineRecommendations: [
    {
      recommendedSchool: '',
      recommendedProgram: '',
      programDuration: '',
      englishTestRequirement: '',
      approximateCost: '',
      briefInfo: '',
    },
  ],
};

const getInitialRecommendationEntry = (savedAnswers: Partial<Answers> | undefined) => ({
  recommendedSchool: savedAnswers?.recommendedSchool || '',
  recommendedProgram: savedAnswers?.recommendedProgram || '',
  programDuration: savedAnswers?.recommendedProgramDuration || '',
  englishTestRequirement: savedAnswers?.recommendedEnglishTestRequirement || '',
  approximateCost: savedAnswers?.recommendedApproximateCost || '',
  briefInfo: savedAnswers?.recommendedBriefInfo || '',
});

const wizardReducer = (state: WizardState, action: WizardAction): WizardState => {
  switch (action.type) {
    case 'SET_ANSWER': {
      const { id, value } = action.payload;
      const newAnswers = { ...state.answers, [id]: value };

      if (id === 'studyDestination') {
        if (value === 'Ireland' || value === 'New Zealand') {
          newAnswers.paymentType = '1_year';
        } else if (
          state.answers.paymentType === '1_year'
          && (state.answers.studyDestination === 'Ireland'
            || state.answers.studyDestination === 'New Zealand')
        ) {
          newAnswers.paymentType = '1_semester';
        }
      }
      return { ...state, answers: newAnswers };
    }
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
    case 'RESET_WIZARD':
      return { currentStep: 1, answers: initialAnswers };
    case 'CLEAR_ANSWERS':
      return { currentStep: 1, answers: initialAnswers };
    default:
      return state;
  }
};

const createClientInitialState = (): WizardState => {
  try {
    const savedState = localStorage.getItem('studyWizardState');
    if (!savedState) {
      return { currentStep: 1, answers: initialAnswers };
    }

    const { savedAnswers, savedStep } = JSON.parse(savedState);
    const merged = { ...initialAnswers, ...savedAnswers } as any;

    if (!merged.nonGenuineRecommendations || !Array.isArray(merged.nonGenuineRecommendations)) {
      merged.nonGenuineRecommendations = [getInitialRecommendationEntry(savedAnswers)];
    }

    return {
      currentStep: savedStep || 1,
      answers: merged,
    };
  } catch (error) {
    console.error('Failed to load state from localStorage', error);
    return { currentStep: 1, answers: initialAnswers };
  }
};

const serverSnapshot: WizardState = { currentStep: 1, answers: initialAnswers };

let listeners: (() => void)[] = [];
let wizardState: WizardState =
  typeof window !== 'undefined'
    ? createClientInitialState()
    : { currentStep: 1, answers: initialAnswers };

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export function dispatch(action: WizardAction) {
  wizardState = wizardReducer(wizardState, action);
  emitChange();
}

export function subscribe(listener: () => void): () => void {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((entry) => entry !== listener);
  };
}

export function getSnapshot(): WizardState {
  return wizardState;
}

export function getServerSnapshot(): WizardState {
  return serverSnapshot;
}
