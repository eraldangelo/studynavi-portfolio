export type IrelandFeesRuntime = {
  studentInsurancePerYearEUR: number;
  visaFeeSingleEntryEUR: number;
  visaFeeMultipleEntryEUR: number;
  pelFeeEUR: number;
  evidenceOfFundsCostOfLivingEUR: number;
  ieltsFeePHP: number;
  duolingoFeeUSD: number;
};

export const IRELAND_FEES_DEFAULTS: IrelandFeesRuntime = {
  studentInsurancePerYearEUR: 160,
  visaFeeSingleEntryEUR: 60,
  visaFeeMultipleEntryEUR: 100,
  pelFeeEUR: 437.5,
  evidenceOfFundsCostOfLivingEUR: 12000,
  ieltsFeePHP: 14000,
  duolingoFeeUSD: 70,
};

function num(value: any, fallback: number): number {
  return typeof value === 'number' ? value : fallback;
}

export function getIrelandFeesRuntime(feesDoc: any | null | undefined): IrelandFeesRuntime {
  const feesEUR = feesDoc?.irelandFeesEUR;
  const english = feesDoc?.englishTestFees;
  const evidence = feesDoc?.evidenceOfFundsEUR;

  return {
    studentInsurancePerYearEUR: num(feesEUR?.studentInsurancePerYear, IRELAND_FEES_DEFAULTS.studentInsurancePerYearEUR),
    visaFeeSingleEntryEUR: num(feesEUR?.visaFeeSingleEntry, IRELAND_FEES_DEFAULTS.visaFeeSingleEntryEUR),
    visaFeeMultipleEntryEUR: num(feesEUR?.visaFeeMultipleEntry, IRELAND_FEES_DEFAULTS.visaFeeMultipleEntryEUR),
    pelFeeEUR: num(feesEUR?.protectionOfEnrolledLearnersFee, IRELAND_FEES_DEFAULTS.pelFeeEUR),
    evidenceOfFundsCostOfLivingEUR: num(evidence?.costOfLiving, IRELAND_FEES_DEFAULTS.evidenceOfFundsCostOfLivingEUR),
    ieltsFeePHP: num(english?.ieltsFeePHP, IRELAND_FEES_DEFAULTS.ieltsFeePHP),
    duolingoFeeUSD: num(english?.duolingoFeeUSD, IRELAND_FEES_DEFAULTS.duolingoFeeUSD),
  };
}
