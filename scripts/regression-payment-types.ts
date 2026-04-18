import assert from 'node:assert/strict';
import { calculateFinancials } from '../src/services/financials';
import type { Answers } from '../src/lib/core/types';
import { FIXTURE_EXCHANGE_RATES, FIXTURE_FEES_DOCS } from './regression-fixtures';

type Destination = 'Australia' | 'Canada' | 'New Zealand' | 'Ireland';
type ScholarshipType = 'upfront' | 'next_semester' | 'first_year_only';

const destinations: Destination[] = ['Australia', 'Canada', 'New Zealand', 'Ireland'];
const scholarshipTypes: ScholarshipType[] = ['upfront', 'next_semester', 'first_year_only'];
const threeYearTuitionBase: Partial<Answers> = {
  programDuration: '3',
  annualTuitionFee: '20000',
  scholarshipPercentage: '20',
};

const failures: string[] = [];
let passed = 0;

function baseAnswers(studyDestination: Destination): Answers {
  return {
    studyDestination,
    programDuration: '2',
    paymentType: '1_semester',
    annualTuitionFee: '20000',
    scholarshipPercentage: '0',
    scholarshipAmount: '0',
    scholarshipType: 'none',
    tuitionFeeDeposit: '2500',
    manualPayment: '8000',
    applicationFeeWaived: 'false',
    schoolApplicationFee: '100',
    ieltsPreparation: 'No',
    englishTestRequired: 'true',
    highestEducation: 'College',
    hasMOI: 'false',
    requiredTBTest: 'false',
    visaAssistance: 'No',
    maritalStatus: 'Never Married',
    numberOfChildren: '0',
    numberOfSchoolAgeChildren: '0',
    numberOfNonSchoolAgeChildren: '0',
    children_0_4: '0',
    children_5_10: '0',
    children_11_14: '0',
    children_15_plus: '0',
    isSubsequentEntry: 'false',
    financialEvidenceFor1YearOnly: 'false',
    financialEvidenceFor2YearsOnly: 'false',
    isIELTSSelected: 'true',
    isMultipleEntryVisa: 'false',
    programCategory: 'General',
  } as Answers;
}

function runFinancials(destination: Destination, overrides: Partial<Answers> = {}) {
  return calculateFinancials({ ...baseAnswers(destination), ...overrides } as Answers, FIXTURE_EXCHANGE_RATES, FIXTURE_FEES_DOCS);
}

function withScholarship(type: ScholarshipType, overrides: Partial<Answers> = {}) {
  return { ...threeYearTuitionBase, scholarshipType: type, ...overrides } as Partial<Answers>;
}

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

test('tuition fee deposit uses entered value across all destinations', () => {
  for (const destination of destinations) {
    const result = runFinancials(destination, { paymentType: 'tuition_fee_deposit_only', tuitionFeeDeposit: '2500' });
    assert.equal(result.totalPaymentDue, 2500, `${destination} deposit mismatch`);
    assert.ok(result.totalPaymentDue >= 0, `${destination} deposit became negative`);
  }
});

test('deposit remaining balance never goes negative for AU and CA', () => {
  const au = runFinancials('Australia', { paymentType: 'tuition_fee_deposit_only', tuitionFeeDeposit: '50000' });
  const ca = runFinancials('Canada', { paymentType: 'tuition_fee_deposit_only', tuitionFeeDeposit: '50000' });
  assert.equal(au.remainingBalanceToPay, 0);
  assert.equal(ca.remainingBalanceToPay, 0);
});

test('manual payment uses entered value across all destinations', () => {
  for (const destination of destinations) {
    const result = runFinancials(destination, { paymentType: 'manual', manualPayment: '12312' });
    assert.equal(result.totalPaymentDue, 12312, `${destination} manual payment mismatch`);
    assert.ok(result.totalPaymentDue >= 0, `${destination} manual payment became negative`);
  }
});

test('manual payment due is independent from school application fee', () => {
  for (const destination of ['Australia', 'Canada'] as const) {
    const lowFee = runFinancials(destination, { paymentType: 'manual', manualPayment: '12312', schoolApplicationFee: '0' });
    const highFee = runFinancials(destination, { paymentType: 'manual', manualPayment: '12312', schoolApplicationFee: '12000' });
    assert.equal(lowFee.totalPaymentDue, highFee.totalPaymentDue, `${destination} payment due changed`);
    assert.ok(highFee.totalCashout > lowFee.totalCashout, `${destination} total cashout did not update`);
  }
});

test('missing manual payment defaults to zero and never negative', () => {
  for (const destination of destinations) {
    const result = runFinancials(destination, { paymentType: 'manual', manualPayment: '' });
    assert.equal(result.totalPaymentDue, 0, `${destination} missing manual payment mismatch`);
    assert.ok(result.totalPaymentDue >= 0, `${destination} missing manual payment became negative`);
  }
});

test('manual and deposit stay source-of-truth across scholarship types and destinations', () => {
  for (const destination of destinations) {
    for (const scholarshipType of scholarshipTypes) {
      const manual = runFinancials(destination, {
        paymentType: 'manual',
        manualPayment: '12312',
        scholarshipPercentage: '20',
        scholarshipType,
      });
      const deposit = runFinancials(destination, {
        paymentType: 'tuition_fee_deposit_only',
        tuitionFeeDeposit: '2500',
        scholarshipPercentage: '20',
        scholarshipType,
      });
      assert.equal(manual.totalPaymentDue, 12312, `${destination} manual mismatch for ${scholarshipType}`);
      assert.equal(deposit.totalPaymentDue, 2500, `${destination} deposit mismatch for ${scholarshipType}`);
      assert.ok(manual.totalPaymentDue >= 0, `${destination} manual negative for ${scholarshipType}`);
      assert.ok(deposit.totalPaymentDue >= 0, `${destination} deposit negative for ${scholarshipType}`);
    }
  }
});

test('first year only applies scholarship to total course fee for one year only', () => {
  for (const destination of destinations) {
    const result = runFinancials(destination, withScholarship('first_year_only', { paymentType: '1_semester' }));
    assert.equal(result.totalCourseFeeBeforeScholarship, 60000, `${destination} before mismatch`);
    assert.equal(result.scholarshipAmount, 4000, `${destination} first-year-only scholarship mismatch`);
    assert.equal(result.totalCourseFeeAfterScholarship, 56000, `${destination} after mismatch`);
    assert.equal(result.totalPaymentDueBeforeScholarship, 10000, `${destination} before-due mismatch`);
    assert.equal(result.totalPaymentDue, 8000, `${destination} first-payment due mismatch`);
  }
});

test('upfront and first year only reduce first payment, next semester does not', () => {
  for (const destination of destinations) {
    const upfront = runFinancials(destination, withScholarship('upfront', { paymentType: '1_semester' }));
    const firstYearOnly = runFinancials(destination, withScholarship('first_year_only', { paymentType: '1_semester' }));
    const nextSemester = runFinancials(destination, withScholarship('next_semester', { paymentType: '1_semester' }));

    assert.equal(upfront.totalPaymentDue, 8000, `${destination} upfront first-payment mismatch`);
    assert.equal(firstYearOnly.totalPaymentDue, 8000, `${destination} first-year-only first-payment mismatch`);
    assert.equal(nextSemester.totalPaymentDue, 10000, `${destination} next-semester first-payment mismatch`);

    assert.equal(upfront.scholarshipAmount, 12000, `${destination} upfront scholarship total mismatch`);
    assert.equal(firstYearOnly.scholarshipAmount, 4000, `${destination} first-year-only scholarship total mismatch`);
    assert.equal(nextSemester.scholarshipAmount, 12000, `${destination} next-semester scholarship total mismatch`);
  }
});

test('AU and CA deposit remaining balance honors first year only as initial-payment scholarship', () => {
  for (const destination of ['Australia', 'Canada'] as const) {
    const upfront = runFinancials(destination, withScholarship('upfront', { paymentType: 'tuition_fee_deposit_only', tuitionFeeDeposit: '2500' }));
    const firstYearOnly = runFinancials(destination, withScholarship('first_year_only', { paymentType: 'tuition_fee_deposit_only', tuitionFeeDeposit: '2500' }));
    const nextSemester = runFinancials(destination, withScholarship('next_semester', { paymentType: 'tuition_fee_deposit_only', tuitionFeeDeposit: '2500' }));
    assert.equal(upfront.remainingBalanceToPay, 5500, `${destination} upfront remaining mismatch`);
    assert.equal(firstYearOnly.remainingBalanceToPay, 5500, `${destination} first-year-only remaining mismatch`);
    assert.equal(nextSemester.remainingBalanceToPay, 7500, `${destination} next-semester remaining mismatch`);
  }
});

test('first year only amount input uses annual amount once', () => {
  for (const destination of destinations) {
    const firstYearOnly = runFinancials(destination, {
      programDuration: '3',
      paymentType: '1_semester',
      annualTuitionFee: '20000',
      scholarshipType: 'first_year_only',
      scholarshipPercentage: '0',
      scholarshipAmount: '3000',
    });
    const upfront = runFinancials(destination, {
      programDuration: '3',
      paymentType: '1_semester',
      annualTuitionFee: '20000',
      scholarshipType: 'upfront',
      scholarshipPercentage: '0',
      scholarshipAmount: '3000',
    });
    assert.equal(firstYearOnly.scholarshipAmount, 3000, `${destination} first-year-only amount mismatch`);
    assert.equal(firstYearOnly.totalCourseFeeAfterScholarship, 57000, `${destination} amount after mismatch`);
    assert.equal(firstYearOnly.totalPaymentDue, 8500, `${destination} amount first-payment mismatch`);
    assert.equal(upfront.scholarshipAmount, 9000, `${destination} upfront amount mismatch`);
  }
});

test('high-tier scholarship (99%) never makes totals negative', () => {
  for (const destination of destinations) {
    const result = runFinancials(destination, {
      programDuration: '3',
      annualTuitionFee: '20000',
      paymentType: '1_semester',
      scholarshipType: 'upfront',
      scholarshipPercentage: '99',
    });
    assert.ok(result.totalCourseFeeAfterScholarship >= 0, `${destination} total became negative`);
    assert.ok(result.totalPaymentDue >= 0, `${destination} due became negative`);
    assert.ok(result.totalCashout >= 0, `${destination} cashout became negative`);
  }
});

test('oversized scholarship amount is clamped and keeps totals non-negative', () => {
  for (const destination of destinations) {
    const result = runFinancials(destination, {
      programDuration: '3',
      annualTuitionFee: '20000',
      paymentType: '1_semester',
      scholarshipType: 'first_year_only',
      scholarshipPercentage: '0',
      scholarshipAmount: '50000',
    });
    assert.equal(result.scholarshipAmount, 20000, `${destination} annual clamp mismatch`);
    assert.ok(result.totalCourseFeeAfterScholarship >= 0, `${destination} total became negative`);
    assert.ok(result.totalPaymentDue >= 0, `${destination} due became negative`);
  }
});

if (failures.length > 0) {
  console.error('\nPayment-type regression failures:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`\nPayment-type regression tests passed: ${passed}`);
