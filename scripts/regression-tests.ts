import assert from 'node:assert/strict';
import * as financialsModuleRaw from '../src/services/financials/index';
import * as wizardUtilsModuleRaw from '../src/components/study/wizard/study-wizard.utils';
import { isPdfPerfWithinBudget } from '../src/lib/pdf/perf/metrics';
import { FIXTURE_EXCHANGE_RATES, FIXTURE_FEES_DOCS } from './regression-fixtures';
type ModuleLike = {
  [key: string]: unknown;
  default?: Record<string, unknown>;
  'module.exports'?: Record<string, unknown>;
};

type FeesDocs = {
  australia?: unknown;
  canada?: unknown;
  ireland?: unknown;
  newZealand?: unknown;
};

type FinancialFn = (
  answers: Record<string, unknown>,
  exchangeRates: Record<string, number>,
  feesDocs?: FeesDocs,
) => Record<string, unknown>;
type CanDownloadFn = (answers: Record<string, unknown>) => boolean;
type IsReviewStepFn = (isNonGenuineFlow: boolean, currentStep: number, effectiveTotalSteps: number) => boolean;
type ShouldPreviewFn = (args: {
  isReviewStep: boolean;
  isLoadingRates: boolean;
  exchangeRates: unknown;
  paymentDetails: unknown;
  financialDocuments: unknown;
}) => boolean;
type IsDownloadDisabledFn = (isDownloading: boolean, pdfUrl: string | null) => boolean;
function getModuleExport<T>(moduleObject: ModuleLike, key: string): T {
  if (typeof moduleObject[key] !== 'undefined') {
    return moduleObject[key] as T;
  }
  if (moduleObject.default && typeof moduleObject.default[key] !== 'undefined') {
    return moduleObject.default[key] as T;
  }
  if (moduleObject['module.exports'] && typeof moduleObject['module.exports'][key] !== 'undefined') {
    return moduleObject['module.exports'][key] as T;
  }
  throw new Error(`Missing export: ${key}`);
}
const calculateFinancials = getModuleExport<FinancialFn>(financialsModuleRaw as ModuleLike, 'calculateFinancials');
const calculateFinancialDocuments = getModuleExport<FinancialFn>(
  financialsModuleRaw as ModuleLike,
  'calculateFinancialDocuments',
);

const canDownloadNonGenuineRecommendations = getModuleExport<CanDownloadFn>(
  wizardUtilsModuleRaw as ModuleLike,
  'canDownloadNonGenuineRecommendations',
);
const isReviewStepActive = getModuleExport<IsReviewStepFn>(wizardUtilsModuleRaw as ModuleLike, 'isReviewStepActive');
const shouldGeneratePdfPreview = getModuleExport<ShouldPreviewFn>(
  wizardUtilsModuleRaw as ModuleLike,
  'shouldGeneratePdfPreview',
);
const isDownloadPdfDisabled = getModuleExport<IsDownloadDisabledFn>(
  wizardUtilsModuleRaw as ModuleLike,
  'isDownloadPdfDisabled',
);
function numberValue(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}
function buildBaseAnswers(): Record<string, unknown> {
  return {
    programDuration: '2',
    paymentType: '1_semester',
    annualTuitionFee: '20000',
    scholarshipPercentage: '0',
    scholarshipAmount: '0',
    scholarshipType: 'none',
    tuitionFeeDeposit: '5000',
    manualPayment: '0',
    applicationFeeWaived: 'false',
    schoolApplicationFee: '100',
    ieltsPreparation: 'No',
    englishTestRequired: 'true',
    highestEducation: 'College',
    hasMOI: 'false',
    requiredTBTest: 'false',
    visaAssistance: 'Spouse/De Facto and Child/ren',
    maritalStatus: 'Married',
    numberOfChildren: '2',
    numberOfSchoolAgeChildren: '1',
    numberOfNonSchoolAgeChildren: '1',
    children_0_4: '1',
    children_5_10: '1',
    children_11_14: '0',
    children_15_plus: '0',
    isSubsequentEntry: 'false',
    financialEvidenceFor1YearOnly: 'false',
    financialEvidenceFor2YearsOnly: 'false',
    isIELTSSelected: 'true',
    isMultipleEntryVisa: 'false',
    programCategory: 'General',
  };
}
function runDestination(studyDestination: string, overrides: Record<string, unknown> = {}) {
  const answers = { ...buildBaseAnswers(), ...overrides, studyDestination };
  return {
    payment: calculateFinancials(answers, FIXTURE_EXCHANGE_RATES, FIXTURE_FEES_DOCS),
    documents: calculateFinancialDocuments(answers, FIXTURE_EXCHANGE_RATES, FIXTURE_FEES_DOCS),
  };
}
const failures: string[] = [];
let passed = 0;
function test(name: string, fn: () => void) {
  try {
    fn();
    passed += 1;
    console.log(`PASS - ${name}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    failures.push(`${name}: ${message}`);
    console.error(`FAIL - ${name}`);
  }
}
test('Australia dependent fee split is preserved', () => {
  const au = runDestination('Australia');
  assert.ok(numberValue(au.payment.dependentVisaFeeOver18) > 0);
  assert.ok(numberValue(au.payment.dependentVisaFee) > 0);
  assert.ok(numberValue(au.payment.dependentBiometricsFee) > 0);
  assert.equal(numberValue(au.payment.dependentStudyPermitFee), 0);
});
test('New Zealand school-age and non-school-age split is preserved', () => {
  const nz = runDestination('New Zealand', { programCategory: 'Pathway Student' });
  assert.ok(numberValue(nz.payment.dependentVisaFeeOver18) > 0);
  assert.ok(numberValue(nz.payment.dependentVisaFeeSchoolAge) > 0);
  assert.ok(numberValue(nz.payment.dependentVisaFeeNonSchoolAge) > 0);
  assert.equal(numberValue(nz.payment.dependentBiometricsFee), 0);
});
test('Canada spouse/visitor/study permit and medical tier logic is preserved', () => {
  const ca = runDestination('Canada');
  assert.ok(numberValue(ca.payment.dependentVisaFeeOver18) > 0);
  assert.ok(numberValue(ca.payment.dependentStudyPermitFee) > 0);
  assert.ok(numberValue(ca.payment.dependentVisaFee) > 0);
  assert.ok(numberValue(ca.payment.medical0to4Fee) > 0);
  assert.ok(numberValue(ca.payment.medical5to10Fee) > 0);
  assert.ok(numberValue(ca.payment.biometricsFee) > 0);
  assert.equal(numberValue(ca.payment.dependentBiometricsFee), 0);
});
test('Ireland keeps dependent and medical/biometrics fees at zero', () => {
  const ie = runDestination('Ireland', { visaAssistance: 'No' });
  assert.equal(numberValue(ie.payment.dependentVisaFee), 0);
  assert.equal(numberValue(ie.payment.dependentVisaFeeOver18), 0);
  assert.equal(numberValue(ie.payment.dependentMedicalExamFee), 0);
  assert.equal(numberValue(ie.payment.medicalExaminationFee), 0);
  assert.equal(numberValue(ie.payment.biometricsFee), 0);
});
test('Financial document models remain destination-specific', () => {
  const au = runDestination('Australia');
  const nz = runDestination('New Zealand');
  const ca = runDestination('Canada');
  const ie = runDestination('Ireland', { visaAssistance: 'No' });
  assert.ok(numberValue(au.documents.oneYearTuitionFee) > 0);
  assert.ok(numberValue(nz.documents.oneYearTuitionFee) === 0);
  assert.ok(numberValue(ca.documents.costOfLiving) > 0);
  assert.equal(numberValue(ca.documents.partnerCostOfLiving), 0);
  assert.equal(numberValue(ca.documents.dependentCostOfLiving), 0);
  assert.equal(numberValue(ie.documents.airfare), 0);
  assert.equal(numberValue(ie.documents.totalFunds), numberValue(ie.documents.costOfLiving));
});
test('Review-step rule stays tied to non-genuine flow and step index', () => {
  assert.equal(isReviewStepActive(false, 11, 11), true);
  assert.equal(isReviewStepActive(true, 11, 11), false);
  assert.equal(isReviewStepActive(false, 10, 11), false);
});
test('PDF preview only starts when all review prerequisites are present', () => {
  assert.equal(
    shouldGeneratePdfPreview({
      isReviewStep: true,
      isLoadingRates: false,
      exchangeRates: { PHP: 56 },
      paymentDetails: { totalCashout: 1234 },
      financialDocuments: { totalFunds: 9999 },
    }),
    true,
  );
  assert.equal(
    shouldGeneratePdfPreview({
      isReviewStep: true,
      isLoadingRates: false,
      exchangeRates: null,
      paymentDetails: { totalCashout: 1234 },
      financialDocuments: { totalFunds: 9999 },
    }),
    false,
  );
  assert.equal(
    shouldGeneratePdfPreview({
      isReviewStep: true,
      isLoadingRates: true,
      exchangeRates: { PHP: 56 },
      paymentDetails: { totalCashout: 1234 },
      financialDocuments: { totalFunds: 9999 },
    }),
    false,
  );
});
test('Download button disable rule remains consistent', () => {
  assert.equal(isDownloadPdfDisabled(true, 'blob:abc'), true);
  assert.equal(isDownloadPdfDisabled(false, null), true);
  assert.equal(isDownloadPdfDisabled(false, 'blob:abc'), false);
});
test('Non-genuine recommendation completion rules remain strict', () => {
  const brief = 'x'.repeat(150);
  const valid = {
    nonGenuineRecommendations: [{ recommendedSchool: 'School A', recommendedProgram: 'Program A', briefInfo: brief }],
  };
  const invalidBrief = {
    nonGenuineRecommendations: [{ recommendedSchool: 'School A', recommendedProgram: 'Program A', briefInfo: 'x'.repeat(149) }],
  };
  const legacy = { recommendedSchool: 'School A', recommendedProgram: 'Program A', recommendedBriefInfo: brief };
  assert.equal(canDownloadNonGenuineRecommendations(valid), true);
  assert.equal(canDownloadNonGenuineRecommendations(invalidBrief), false);
  assert.equal(canDownloadNonGenuineRecommendations(legacy), true);
});
test('PDF perf budget helper protects against large regressions', () => {
  assert.equal(
    isPdfPerfWithinBudget({
      assetLoadMs: 1_200,
      buildMs: 6_000,
      blobUrlMs: 500,
      totalMs: 8_000,
    }),
    true,
  );
  assert.equal(
    isPdfPerfWithinBudget({
      assetLoadMs: 20_000,
      buildMs: 6_000,
      blobUrlMs: 500,
      totalMs: 8_000,
    }),
    false,
  );
});
if (failures.length > 0) {
  console.error('\nRegression test failures:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}
console.log(`\nRegression tests passed: ${passed}`);
