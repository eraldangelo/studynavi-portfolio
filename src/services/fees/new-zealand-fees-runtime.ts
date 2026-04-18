export type NzDurationKey = '1' | '1.5' | '2' | '2.5' | '3' | '3.5' | '4' | '4.5' | '5';

export type NewZealandFeesRuntime = {
  insuranceSingleNZD: Record<NzDurationKey, number>;
  insuranceCoupleNZD: Record<NzDurationKey, number>;

  visaStudentNZD: number;
  visaPathwayStudentNZD: number;
  dependentVisaSpouse18PlusNZD: number;
  dependentVisaChildSchoolAgeNZD: number;
  dependentVisaChildNonSchoolAgeNZD: number;

  medicalExamFeePHP: number;
  dependentMedicalExamFeePHP: number;

  englishTestFeePHP: number;

  assistancePerDependentPHP: number;
  assistancePerDependentSubsequentEntryPHP: number;

  evidenceStudentPerYearNZD: number;
  evidencePartnerPerYearNZD: number;
  evidenceChildSchoolAgePerYearNZD: number;
  evidenceChildNonSchoolAgePerYearNZD: number;
  airfarePerPersonNZD: number;
};

export const NZ_FEES_DEFAULTS: NewZealandFeesRuntime = {
  insuranceSingleNZD: {
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
  insuranceCoupleNZD: {
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

  visaStudentNZD: 850,
  visaPathwayStudentNZD: 750,
  dependentVisaSpouse18PlusNZD: 1630,
  dependentVisaChildSchoolAgeNZD: 750,
  dependentVisaChildNonSchoolAgeNZD: 341,

  medicalExamFeePHP: 14550,
  dependentMedicalExamFeePHP: 14550,

  englishTestFeePHP: 14000,

  assistancePerDependentPHP: 15000,
  assistancePerDependentSubsequentEntryPHP: 25000,

  evidenceStudentPerYearNZD: 20000,
  evidencePartnerPerYearNZD: 4200,
  evidenceChildSchoolAgePerYearNZD: 17000,
  evidenceChildNonSchoolAgePerYearNZD: 4200,
  airfarePerPersonNZD: 2500,
};

const DURATION_KEYS: NzDurationKey[] = ['1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5'];

function num(value: any, fallback: number): number {
  return typeof value === 'number' ? value : fallback;
}

function normalizeDurations(input: any, defaults: Record<NzDurationKey, number>): Record<NzDurationKey, number> {
  const out = {} as Record<NzDurationKey, number>;
  for (const k of DURATION_KEYS) {
    out[k] = num(input?.[k], defaults[k]);
  }
  return out;
}

export function getNewZealandFeesRuntime(feesDoc: any | null | undefined): NewZealandFeesRuntime {
  const insurance = feesDoc?.nzInsuranceNZD;
  const visa = feesDoc?.nzVisaFeesNZD;
  const medical = feesDoc?.nzMedicalExamFeesPHP;
  const english = feesDoc?.nzEnglishTestFeesPHP;
  const assistance = feesDoc?.nzAssistanceFeesPHP;
  const evidence = feesDoc?.nzEvidenceOfFundsNZD;

  return {
    insuranceSingleNZD: normalizeDurations(insurance?.single, NZ_FEES_DEFAULTS.insuranceSingleNZD),
    insuranceCoupleNZD: normalizeDurations(insurance?.couple, NZ_FEES_DEFAULTS.insuranceCoupleNZD),

    visaStudentNZD: num(visa?.studentVisaFee, NZ_FEES_DEFAULTS.visaStudentNZD),
    visaPathwayStudentNZD: num(visa?.pathwayStudentVisaFee, NZ_FEES_DEFAULTS.visaPathwayStudentNZD),
    dependentVisaSpouse18PlusNZD: num(visa?.dependentVisaFeeSpouse18Plus, NZ_FEES_DEFAULTS.dependentVisaSpouse18PlusNZD),
    dependentVisaChildSchoolAgeNZD: num(visa?.dependentVisaFeeSchoolAge, NZ_FEES_DEFAULTS.dependentVisaChildSchoolAgeNZD),
    dependentVisaChildNonSchoolAgeNZD: num(visa?.dependentVisaFeeNonSchoolAge, NZ_FEES_DEFAULTS.dependentVisaChildNonSchoolAgeNZD),

    medicalExamFeePHP: num(medical?.medicalExamFee, NZ_FEES_DEFAULTS.medicalExamFeePHP),
    dependentMedicalExamFeePHP: num(medical?.dependentMedicalExamFeePerDependent, NZ_FEES_DEFAULTS.dependentMedicalExamFeePHP),

    englishTestFeePHP: num(english?.englishTestFee, NZ_FEES_DEFAULTS.englishTestFeePHP),

    assistancePerDependentPHP: num(assistance?.perDependent, NZ_FEES_DEFAULTS.assistancePerDependentPHP),
    assistancePerDependentSubsequentEntryPHP: num(assistance?.perDependentSubsequentEntry, NZ_FEES_DEFAULTS.assistancePerDependentSubsequentEntryPHP),

    evidenceStudentPerYearNZD: num(evidence?.studentCostOfLivingPerYear, NZ_FEES_DEFAULTS.evidenceStudentPerYearNZD),
    evidencePartnerPerYearNZD: num(evidence?.partnerCostOfLivingPerYear, NZ_FEES_DEFAULTS.evidencePartnerPerYearNZD),
    evidenceChildSchoolAgePerYearNZD: num(evidence?.childSchoolAgeCostPerYear, NZ_FEES_DEFAULTS.evidenceChildSchoolAgePerYearNZD),
    evidenceChildNonSchoolAgePerYearNZD: num(evidence?.childNonSchoolAgeCostPerYear, NZ_FEES_DEFAULTS.evidenceChildNonSchoolAgePerYearNZD),
    airfarePerPersonNZD: num(evidence?.airfarePerPerson, NZ_FEES_DEFAULTS.airfarePerPersonNZD),
  };
}
