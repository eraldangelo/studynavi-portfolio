export type CanadaTierKey = '1' | '2' | '3' | '4' | '5' | '6' | '7';

export type CanadaFeesRuntime = {
  studentVisaFeeCAD: number;
  biometricsSoloCAD: number;
  biometricsFamilyCAD: number;
  dependentVisaFeeSpouseOWPCAD: number;
  dependentVisaFeeVisitorChild0to4CAD: number;
  dependentStudyPermitFeeChild5PlusCAD: number;

  studentMedicalExamFeePHP: number;
  spouseMedicalExamFeePHP: number;
  childMedical0to4PHP: number;
  childMedical5to10PHP: number;
  childMedical11to14PHP: number;
  childMedical15plusPHP: number;

  englishTestIeltsFeePHP: number;

  assistancePerDependentPHP: number;
  assistancePerDependentSubsequentEntryPHP: number;

  costOfLivingTierCAD: Record<CanadaTierKey, number>;
  additionalMemberCostCAD: number;
  airfarePerPersonCAD: number;
};

export const CANADA_FEES_DEFAULTS: CanadaFeesRuntime = {
  studentVisaFeeCAD: 150,
  biometricsSoloCAD: 85,
  biometricsFamilyCAD: 170,
  dependentVisaFeeSpouseOWPCAD: 255,
  dependentVisaFeeVisitorChild0to4CAD: 100,
  dependentStudyPermitFeeChild5PlusCAD: 150,

  studentMedicalExamFeePHP: 13270,
  spouseMedicalExamFeePHP: 13270,
  childMedical0to4PHP: 3220,
  childMedical5to10PHP: 4140,
  childMedical11to14PHP: 6100,
  childMedical15plusPHP: 13270,

  englishTestIeltsFeePHP: 14000,

  assistancePerDependentPHP: 15000,
  assistancePerDependentSubsequentEntryPHP: 25000,

  costOfLivingTierCAD: {
    '1': 22895,
    '2': 28502,
    '3': 35040,
    '4': 42543,
    '5': 48252,
    '6': 54420,
    '7': 60589,
  },
  additionalMemberCostCAD: 5559,
  airfarePerPersonCAD: 2000,
};

const TIER_KEYS: CanadaTierKey[] = ['1', '2', '3', '4', '5', '6', '7'];

function normalizeNumber(value: any, fallback: number): number {
  return typeof value === 'number' ? value : fallback;
}

function normalizeTier(input: any): Record<CanadaTierKey, number> {
  const out = {} as Record<CanadaTierKey, number>;
  for (const key of TIER_KEYS) {
    out[key] = normalizeNumber(input?.[key], CANADA_FEES_DEFAULTS.costOfLivingTierCAD[key]);
  }
  return out;
}

export function getCanadaFeesRuntime(feesDoc: any | null | undefined): CanadaFeesRuntime {
  const visaBio = feesDoc?.canadaVisaAndBiometricsCAD;
  const med = feesDoc?.canadaMedicalExamFeesPHP;
  const eng = feesDoc?.canadaEnglishTestFeesPHP;
  const asst = feesDoc?.canadaAssistanceFeesPHP;
  const eof = feesDoc?.canadaEvidenceOfFundsCAD;

  return {
    studentVisaFeeCAD: normalizeNumber(visaBio?.studentVisaFee, CANADA_FEES_DEFAULTS.studentVisaFeeCAD),
    biometricsSoloCAD: normalizeNumber(visaBio?.biometricsSolo, CANADA_FEES_DEFAULTS.biometricsSoloCAD),
    biometricsFamilyCAD: normalizeNumber(visaBio?.biometricsFamily, CANADA_FEES_DEFAULTS.biometricsFamilyCAD),
    dependentVisaFeeSpouseOWPCAD: normalizeNumber(visaBio?.dependentVisaFeeSpouseOWP, CANADA_FEES_DEFAULTS.dependentVisaFeeSpouseOWPCAD),
    dependentVisaFeeVisitorChild0to4CAD: normalizeNumber(visaBio?.dependentVisaFeeVisitorChild0to4, CANADA_FEES_DEFAULTS.dependentVisaFeeVisitorChild0to4CAD),
    dependentStudyPermitFeeChild5PlusCAD: normalizeNumber(visaBio?.dependentStudyPermitFeeChild5Plus, CANADA_FEES_DEFAULTS.dependentStudyPermitFeeChild5PlusCAD),

    studentMedicalExamFeePHP: normalizeNumber(med?.studentMedicalExamFee, CANADA_FEES_DEFAULTS.studentMedicalExamFeePHP),
    spouseMedicalExamFeePHP: normalizeNumber(med?.spouseMedicalExamFee, CANADA_FEES_DEFAULTS.spouseMedicalExamFeePHP),
    childMedical0to4PHP: normalizeNumber(med?.childMedical0to4, CANADA_FEES_DEFAULTS.childMedical0to4PHP),
    childMedical5to10PHP: normalizeNumber(med?.childMedical5to10, CANADA_FEES_DEFAULTS.childMedical5to10PHP),
    childMedical11to14PHP: normalizeNumber(med?.childMedical11to14, CANADA_FEES_DEFAULTS.childMedical11to14PHP),
    childMedical15plusPHP: normalizeNumber(med?.childMedical15plus, CANADA_FEES_DEFAULTS.childMedical15plusPHP),

    englishTestIeltsFeePHP: normalizeNumber(eng?.ieltsFee, CANADA_FEES_DEFAULTS.englishTestIeltsFeePHP),

    assistancePerDependentPHP: normalizeNumber(asst?.perDependent, CANADA_FEES_DEFAULTS.assistancePerDependentPHP),
    assistancePerDependentSubsequentEntryPHP: normalizeNumber(asst?.perDependentSubsequentEntry, CANADA_FEES_DEFAULTS.assistancePerDependentSubsequentEntryPHP),

    costOfLivingTierCAD: normalizeTier(eof?.costOfLivingTier),
    additionalMemberCostCAD: normalizeNumber(eof?.additionalMemberCost, CANADA_FEES_DEFAULTS.additionalMemberCostCAD),
    airfarePerPersonCAD: normalizeNumber(eof?.airfarePerPerson, CANADA_FEES_DEFAULTS.airfarePerPersonCAD),
  };
}
