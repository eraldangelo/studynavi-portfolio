export const DURATION_KEYS = ['1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5'] as const;

export const PLAN_OPTIONS = [
  { label: 'Single', value: 'single', field: 'insuranceCostsAloneAUD' },
  { label: 'Couple', value: 'couple', field: 'insuranceCostsCoupleAUD' },
  { label: 'Family', value: 'family', field: 'insuranceCostsFamilyAUD' },
  { label: 'Single Parents', value: 'singleParents', field: 'insuranceCostsSingleParentWithChildrenAUD' },
] as const;

export type OshcPlan = typeof PLAN_OPTIONS[number]['field'];

export const australiaSeed = {
  insuranceType: 'OSHC',
  insuranceCostsAloneAUD: {},
  insuranceCostsCoupleAUD: {},
  insuranceCostsFamilyAUD: {},
  insuranceCostsSingleParentWithChildrenAUD: {},
  visaFeesAUD: {
    studentVisaFee: 2000,
    dependentVisaFeeSpouse18Plus: 1225,
    dependentVisaFeeChildUnder18: 400,
  },
  medicalExamFeesPHP: {
    medicalExamFee: 7680,
    medicalExamFeeWithTB: 15000,
    dependentMedicalExamFee: 7680,
  },
  biometricsFeesPHP: {
    biometricsFee: 650,
    dependentBiometricsFee: 650,
  },
  englishTestFeesPHP: {
    englishTestFee: 14000,
  },
  assistanceFeesPHP: {
    perDependent: 15000,
    perDependentSubsequentEntry: 25000,
  },
  evidenceOfFundsAUD: {
    studentCostOfLiving: 29710,
    partnerCostOfLiving: 10394,
    costOfLivingPerChild: 4449,
    airfarePerPerson: 2000,
  },
};

export const irelandSeed = {
  irelandFeesEUR: {
    studentInsurancePerYear: 160,
    visaFeeSingleEntry: 60,
    visaFeeMultipleEntry: 100,
    protectionOfEnrolledLearnersFee: 437.5,
  },
  englishTestFees: {
    ieltsFeePHP: 14000,
    duolingoFeeUSD: 70,
  },
  evidenceOfFundsEUR: {
    costOfLiving: 12000,
  },
};

export const newZealandSeed = {
  nzInsuranceNZD: {
    single: {
      '1': 728,
      '1.5': 1110,
      '2': 1480,
      '2.5': 1850,
      '3': 2220,
      '3.5': 2600,
      '4': 3000,
      '4.5': 3350,
      '5': 3700,
    },
    couple: {
      '1': 1480,
      '1.5': 2220,
      '2': 2960,
      '2.5': 3700,
      '3': 4440,
      '3.5': 5180,
      '4': 5900,
      '4.5': 6650,
      '5': 7400,
    },
  },
  nzVisaFeesNZD: {
    studentVisaFee: 850,
    pathwayStudentVisaFee: 750,
    dependentVisaFeeSpouse18Plus: 1630,
    dependentVisaFeeSchoolAge: 750,
    dependentVisaFeeNonSchoolAge: 341,
  },
  nzMedicalExamFeesPHP: {
    medicalExamFee: 14550,
    dependentMedicalExamFeePerDependent: 14550,
  },
  nzEnglishTestFeesPHP: {
    englishTestFee: 14000,
  },
  nzAssistanceFeesPHP: {
    perDependent: 15000,
    perDependentSubsequentEntry: 25000,
  },
  nzEvidenceOfFundsNZD: {
    studentCostOfLivingPerYear: 20000,
    partnerCostOfLivingPerYear: 4200,
    childSchoolAgeCostPerYear: 17000,
    childNonSchoolAgeCostPerYear: 4200,
    airfarePerPerson: 2500,
  },
};

export const canadaSeed = {
  canadaVisaAndBiometricsCAD: {
    studentVisaFee: 150,
    biometricsSolo: 85,
    biometricsFamily: 170,
    dependentVisaFeeSpouseOWP: 255,
    dependentVisaFeeVisitorChild0to4: 100,
    dependentStudyPermitFeeChild5Plus: 150,
  },
  canadaMedicalExamFeesPHP: {
    studentMedicalExamFee: 13270,
    spouseMedicalExamFee: 13270,
    childMedical0to4: 3220,
    childMedical5to10: 4140,
    childMedical11to14: 6100,
    childMedical15plus: 13270,
  },
  canadaEnglishTestFeesPHP: {
    ieltsFee: 14000,
  },
  canadaAssistanceFeesPHP: {
    perDependent: 15000,
    perDependentSubsequentEntry: 25000,
  },
  canadaEvidenceOfFundsCAD: {
    costOfLivingTier: {
      '1': 22895,
      '2': 28502,
      '3': 35040,
      '4': 42543,
      '5': 48252,
      '6': 54420,
      '7': 60589,
    },
    additionalMemberCost: 5559,
    airfarePerPerson: 2000,
  },
};
