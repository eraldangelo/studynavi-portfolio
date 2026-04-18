import type { Page } from '@playwright/test';

const E2E_AUTH_KEY = '__e2e_auth_user__';
const WIZARD_STATE_KEY = 'studyWizardState';

export type WizardAnswers = Record<string, string | number | boolean | null | unknown[]>;

export function baseAnswers(): WizardAnswers {
  return {
    studyDestination: 'Australia',
    financialSponsor: 'Yes',
    isShoppingNonGenuine: 'No',
    maritalStatus: 'Married',
    visaAssistance: 'Spouse/De Facto and Child/ren',
    numberOfChildren: '2',
    numberOfSchoolAgeChildren: '1',
    numberOfNonSchoolAgeChildren: '1',
    children_0_4: '1',
    children_5_10: '1',
    children_11_14: '0',
    children_15_plus: '0',
    annualTuitionFee: '20000',
    programDuration: '2',
    paymentType: '1_semester',
    schoolApplicationFee: '100',
    applicationFeeWaived: 'application_fee_waived_false',
    scholarshipAmount: '0',
    scholarshipPercentage: '0',
    scholarshipType: 'none',
    englishTestRequired: 'true',
    ieltsPreparation: 'No',
    highestEducation: 'College',
    requiredTBTest: 'false',
    isSubsequentEntry: 'false',
    isIELTSSelected: 'false',
    hasMOI: 'false',
    isMultipleEntryVisa: 'false',
    financialEvidenceFor1YearOnly: 'false',
    financialEvidenceFor2YearsOnly: 'false',
    recommendedSchool: '',
    recommendedProgram: '',
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
}

export async function clearLocalStorage(page: Page) {
  await page.addInitScript(() => localStorage.clear());
}

export async function setAuthenticated(page: Page, email = 'e2e@example.test') {
  await page.addInitScript((payload) => {
    localStorage.setItem(payload.key, JSON.stringify(payload.user));
  }, {
    key: E2E_AUTH_KEY,
    user: { uid: 'e2e-user', email },
  });
}

export async function setWizardState(page: Page, savedStep: number, answers: WizardAnswers) {
  await page.addInitScript((payload) => {
    localStorage.setItem(payload.key, JSON.stringify(payload.state));
  }, {
    key: WIZARD_STATE_KEY,
    state: { savedStep, savedAnswers: answers },
  });
}
