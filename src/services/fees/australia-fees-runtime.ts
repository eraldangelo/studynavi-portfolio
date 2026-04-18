// src/services/fees/australia-fees-runtime.ts

export type DurationKey = '1'|'1.5'|'2'|'2.5'|'3'|'3.5'|'4'|'4.5'|'5';

export type AustraliaFeesRuntime = {
  // OSHC maps (AUD)
  insuranceCostsAloneAUD: Record<DurationKey, number>;
  insuranceCostsCoupleAUD: Record<DurationKey, number>;
  insuranceCostsFamilyAUD: Record<DurationKey, number>;
  insuranceCostsSingleParentWithChildrenAUD: Record<DurationKey, number>;

  // Visa fees (AUD)
  studentVisaFeeAUD: number;
  dependentVisaFeeSpouse18PlusAUD: number;
  dependentVisaFeeChildUnder18AUD: number;

  // Medical (PHP base -> you still divide by phpRate inside calculator)
  medicalExamFeePHP: number;
  medicalExamFeeWithTBPHP: number;
  dependentMedicalExamFeePHP: number;

  // Biometrics (PHP)
  biometricsFeePHP: number;
  dependentBiometricsFeePHP: number;

  // English test (PHP)
  englishTestFeePHP: number;

  // Assistance (PHP per dependent)
  assistancePerDependentPHP: number;
  assistancePerDependentSubsequentEntryPHP: number;

  // Evidence of funds (AUD)
  studentCostOfLivingAUD: number;
  partnerCostOfLivingAUD: number;
  costOfLivingPerChildAUD: number;
  airfarePerPersonAUD: number;
};

// These are the CURRENT hardcoded defaults from src/services/financials/australia.ts
const DEFAULTS: AustraliaFeesRuntime = {
  insuranceCostsAloneAUD: {
    '1': 768, '1.5': 1152, '2': 1536, '2.5': 1920, '3': 2304, '3.5': 2688, '4': 3072, '4.5': 3456, '5': 3840,
  },
  insuranceCostsCoupleAUD: {
    '1': 4224, '1.5': 6336, '2': 8448, '2.5': 10560, '3': 12672, '3.5': 14784, '4': 16896, '4.5': 19008, '5': 21120,
  },
  insuranceCostsFamilyAUD: {
    '1': 5400, '1.5': 8100, '2': 10800, '2.5': 13500, '3': 16200, '3.5': 18900, '4': 21600, '4.5': 24300, '5': 27000,
  },
  insuranceCostsSingleParentWithChildrenAUD: {
    '1': 3295.50, '1.5': 4943.25, '2': 6591, '2.5': 8238.75, '3': 9886.50, '3.5': 11534.25, '4': 13182, '4.5': 14829.75, '5': 16477.50,
  },

  studentVisaFeeAUD: 2000,
  dependentVisaFeeSpouse18PlusAUD: 1225,
  dependentVisaFeeChildUnder18AUD: 400,

  medicalExamFeePHP: 7680,
  medicalExamFeeWithTBPHP: 15000,
  dependentMedicalExamFeePHP: 7680,

  biometricsFeePHP: 650,
  dependentBiometricsFeePHP: 650,

  englishTestFeePHP: 14000,

  assistancePerDependentPHP: 15000,
  assistancePerDependentSubsequentEntryPHP: 25000,

  studentCostOfLivingAUD: 29710,
  partnerCostOfLivingAUD: 10394,
  costOfLivingPerChildAUD: 4449,
  airfarePerPersonAUD: 2000,
};

const DURATION_KEYS: DurationKey[] = ['1','1.5','2','2.5','3','3.5','4','4.5','5'];

function normalizeDurationMap(input: any): Record<DurationKey, number> {
  const out = {} as Record<DurationKey, number>;
  for (const k of DURATION_KEYS) {
    const v = input?.[k];
    out[k] = typeof v === 'number' ? v : DEFAULTS.insuranceCostsAloneAUD[k];
  }
  return out;
}

export function getAustraliaFeesRuntime(feesDoc: any | null | undefined): AustraliaFeesRuntime {
  const visa = feesDoc?.visaFeesAUD;
  const med = feesDoc?.medicalExamFeesPHP;
  const bio = feesDoc?.biometricsFeesPHP;
  const eng = feesDoc?.englishTestFeesPHP;
  const asst = feesDoc?.assistanceFeesPHP;
  const eof = feesDoc?.evidenceOfFundsAUD;

  return {
    insuranceCostsAloneAUD: normalizeDurationMap(feesDoc?.insuranceCostsAloneAUD ?? DEFAULTS.insuranceCostsAloneAUD),
    insuranceCostsCoupleAUD: normalizeDurationMap(feesDoc?.insuranceCostsCoupleAUD ?? DEFAULTS.insuranceCostsCoupleAUD),
    insuranceCostsFamilyAUD: normalizeDurationMap(feesDoc?.insuranceCostsFamilyAUD ?? DEFAULTS.insuranceCostsFamilyAUD),
    insuranceCostsSingleParentWithChildrenAUD: normalizeDurationMap(feesDoc?.insuranceCostsSingleParentWithChildrenAUD ?? DEFAULTS.insuranceCostsSingleParentWithChildrenAUD),

    studentVisaFeeAUD: typeof visa?.studentVisaFee === 'number' ? visa.studentVisaFee : DEFAULTS.studentVisaFeeAUD,
    dependentVisaFeeSpouse18PlusAUD: typeof visa?.dependentVisaFeeSpouse18Plus === 'number' ? visa.dependentVisaFeeSpouse18Plus : DEFAULTS.dependentVisaFeeSpouse18PlusAUD,
    dependentVisaFeeChildUnder18AUD: typeof visa?.dependentVisaFeeChildUnder18 === 'number' ? visa.dependentVisaFeeChildUnder18 : DEFAULTS.dependentVisaFeeChildUnder18AUD,

    medicalExamFeePHP: typeof med?.medicalExamFee === 'number' ? med.medicalExamFee : DEFAULTS.medicalExamFeePHP,
    medicalExamFeeWithTBPHP: typeof med?.medicalExamFeeWithTB === 'number' ? med.medicalExamFeeWithTB : DEFAULTS.medicalExamFeeWithTBPHP,
    dependentMedicalExamFeePHP: typeof med?.dependentMedicalExamFee === 'number' ? med.dependentMedicalExamFee : DEFAULTS.dependentMedicalExamFeePHP,

    biometricsFeePHP: typeof bio?.biometricsFee === 'number' ? bio.biometricsFee : DEFAULTS.biometricsFeePHP,
    dependentBiometricsFeePHP: typeof bio?.dependentBiometricsFee === 'number' ? bio.dependentBiometricsFee : DEFAULTS.dependentBiometricsFeePHP,

    englishTestFeePHP: typeof eng?.englishTestFee === 'number' ? eng.englishTestFee : DEFAULTS.englishTestFeePHP,

    assistancePerDependentPHP: typeof asst?.perDependent === 'number' ? asst.perDependent : DEFAULTS.assistancePerDependentPHP,
    assistancePerDependentSubsequentEntryPHP: typeof asst?.perDependentSubsequentEntry === 'number' ? asst.perDependentSubsequentEntry : DEFAULTS.assistancePerDependentSubsequentEntryPHP,

    studentCostOfLivingAUD: typeof eof?.studentCostOfLiving === 'number' ? eof.studentCostOfLiving : DEFAULTS.studentCostOfLivingAUD,
    partnerCostOfLivingAUD: typeof eof?.partnerCostOfLiving === 'number' ? eof.partnerCostOfLiving : DEFAULTS.partnerCostOfLivingAUD,
    costOfLivingPerChildAUD: typeof eof?.costOfLivingPerChild === 'number' ? eof.costOfLivingPerChild : DEFAULTS.costOfLivingPerChildAUD,
    airfarePerPersonAUD: typeof eof?.airfarePerPerson === 'number' ? eof.airfarePerPerson : DEFAULTS.airfarePerPersonAUD,
  };
}
