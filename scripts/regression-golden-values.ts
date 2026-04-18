import assert from 'node:assert/strict';
import type { Answers } from '../src/lib/core/types';
import * as financialsModuleRaw from '../src/services/financials/index';
import * as fixturesModuleRaw from './regression-fixtures';

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
  answers: Answers,
  exchangeRates: Record<string, number>,
  feesDocs?: FeesDocs,
) => Record<string, unknown>;

function getModuleExport<T>(moduleObject: ModuleLike, key: string): T {
  if (typeof moduleObject[key] !== 'undefined') return moduleObject[key] as T;
  if (moduleObject.default && typeof moduleObject.default[key] !== 'undefined') {
    return moduleObject.default[key] as T;
  }
  if (moduleObject['module.exports'] && typeof moduleObject['module.exports'][key] !== 'undefined') {
    return moduleObject['module.exports'][key] as T;
  }
  throw new Error(`Missing export: ${key}`);
}

const calculateFinancials = getModuleExport<FinancialFn>(financialsModuleRaw, 'calculateFinancials');
const calculateFinancialDocuments = getModuleExport<FinancialFn>(
  financialsModuleRaw,
  'calculateFinancialDocuments',
);
const FIXTURE_EXCHANGE_RATES = getModuleExport<Record<string, number>>(
  fixturesModuleRaw,
  'FIXTURE_EXCHANGE_RATES',
);
const FIXTURE_FEES_DOCS = getModuleExport<FeesDocs>(fixturesModuleRaw, 'FIXTURE_FEES_DOCS');

type Destination = 'Australia' | 'Canada' | 'New Zealand' | 'Ireland';

function buildAnswers(studyDestination: Destination): Answers {
  const common = {
    studyDestination,
    programDuration: '2',
    paymentType: '1_semester',
    annualTuitionFee: '20000',
    scholarshipPercentage: '0',
    scholarshipAmount: '0',
    scholarshipType: 'none',
    tuitionFeeDeposit: '2500',
    manualPayment: '12312',
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
    programCategory: studyDestination === 'New Zealand' ? 'Pathway Student' : 'General',
  } as Answers;

  if (studyDestination !== 'Ireland') return common;
  return {
    ...common,
    visaAssistance: 'No',
    maritalStatus: 'Never Married',
    numberOfChildren: '0',
  } as Answers;
}

function numberValue(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function assertClose(actual: number, expected: number, label: string, tolerance = 1e-6) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${label}: expected ${expected}, got ${actual}`,
  );
}

const GOLDEN_EXPECTATIONS = {
  Australia: {
    totalPaymentDue: 10000,
    totalCashout: 18133.857142857138,
    docsTotalFunds: 67002,
    docsCostOfLiving: 29710,
  },
  Canada: {
    totalPaymentDue: 10000,
    totalCashout: 13081.607142857141,
    docsTotalFunds: 70543,
    docsCostOfLiving: 42543,
  },
  'New Zealand': {
    totalPaymentDue: 10000,
    totalCashout: 19779.57142857143,
    docsTotalFunds: 100800,
    docsCostOfLiving: 40000,
  },
  Ireland: {
    totalPaymentDue: 10000,
    totalCashout: 10907.5,
    docsTotalFunds: 12000,
    docsCostOfLiving: 12000,
  },
} as const;

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

for (const destination of Object.keys(GOLDEN_EXPECTATIONS) as Destination[]) {
  test(`Golden values stay stable for ${destination}`, () => {
    const answers = buildAnswers(destination);
    const payment = calculateFinancials(answers, FIXTURE_EXCHANGE_RATES, FIXTURE_FEES_DOCS);
    const documents = calculateFinancialDocuments(answers, FIXTURE_EXCHANGE_RATES, FIXTURE_FEES_DOCS);
    const expected = GOLDEN_EXPECTATIONS[destination];

    assertClose(numberValue(payment.totalPaymentDue), expected.totalPaymentDue, `${destination} totalPaymentDue`);
    assertClose(numberValue(payment.totalCashout), expected.totalCashout, `${destination} totalCashout`);
    assertClose(numberValue(documents.totalFunds), expected.docsTotalFunds, `${destination} docs.totalFunds`);
    assertClose(
      numberValue(documents.costOfLiving),
      expected.docsCostOfLiving,
      `${destination} docs.costOfLiving`,
    );
  });
}

if (failures.length > 0) {
  console.error('\nGolden-value regression failures:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`\nGolden-value regression tests passed: ${passed}`);
