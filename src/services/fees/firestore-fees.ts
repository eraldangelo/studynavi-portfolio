import { auth, db } from '@/lib/firebase/client';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  type DocumentData,
  type DocumentReference,
} from 'firebase/firestore';
import {
  DURATION_KEYS,
  PLAN_OPTIONS,
  australiaSeed,
  canadaSeed,
  irelandSeed,
  newZealandSeed,
  type OshcPlan,
} from './firestore-fees.seeds';
import { isE2EMockDataEnabled } from '@/lib/env/runtime-flags';
export { DURATION_KEYS, PLAN_OPTIONS };
export type { OshcPlan };
const E2E_MOCK_DATA = isE2EMockDataEnabled();
function cloneData<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
const e2eMockFeesDocs = {
  australia: cloneData(australiaSeed),
  ireland: cloneData(irelandSeed),
  newZealand: cloneData(newZealandSeed),
  canada: cloneData(canadaSeed),
};
const australiaFeesRef = () => doc(db, 'fees', 'australia');
export const irelandFeesRef = () => doc(db, 'fees', 'ireland');
export const nzFeesRef = () => doc(db, 'fees', 'new-zealand');
export const canadaFeesRef = () => doc(db, 'fees', 'canada');
function buildAuditFields(mutation: string) {
  const actor = auth.currentUser;
  return {
    lastMutation: mutation,
    updatedAt: new Date().toISOString(),
    updatedByUid: actor?.uid || null,
    updatedByEmail: actor?.email || null,
  };
}
async function updateFeesDoc(
  ref: DocumentReference<DocumentData>,
  updatePayload: Record<string, unknown>,
  mutation: string,
) {
  await updateDoc(ref, {
    ...updatePayload,
    audit: buildAuditFields(mutation),
  });
}
function hasMissingSeedKeys(data: Record<string, unknown>, seed: Record<string, unknown>) {
  return Object.keys(seed).some((key) => !Object.prototype.hasOwnProperty.call(data, key));
}
async function fetchWithSeed(
  ref: DocumentReference<DocumentData>,
  seed: Record<string, unknown>,
  options?: { mergeMissingKeys?: boolean; errorLabel?: string },
) {
  const { mergeMissingKeys = false, errorLabel } = options || {};
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, seed, { merge: true });
      const seeded = await getDoc(ref);
      return seeded.exists() ? seeded.data() : null;
    }
    const data = snap.data() || {};
    if (mergeMissingKeys && hasMissingSeedKeys(data, seed)) {
      await setDoc(ref, seed, { merge: true });
      const refreshed = await getDoc(ref);
      return refreshed.data();
    }
    return data;
  } catch (error) {
    if (errorLabel) {
      console.error(`[fees] ${errorLabel} error`, error);
    }
    throw error;
  }
}
export async function fetchIrelandFees() {
  if (E2E_MOCK_DATA) {
    return cloneData(e2eMockFeesDocs.ireland);
  }
  return fetchWithSeed(irelandFeesRef(), irelandSeed, {
    mergeMissingKeys: true,
    errorLabel: 'fetchIrelandFees',
  });
}
export async function fetchNewZealandFees() {
  if (E2E_MOCK_DATA) {
    return cloneData(e2eMockFeesDocs.newZealand);
  }
  return fetchWithSeed(nzFeesRef(), newZealandSeed, {
    mergeMissingKeys: true,
    errorLabel: 'fetchNewZealandFees',
  });
}
export async function updateNzInsurance(updated: { single: Record<string, number>; couple: Record<string, number> }) {
  await updateFeesDoc(nzFeesRef(), { nzInsuranceNZD: updated }, 'fees.nz.insurance.update');
}
export async function updateNzVisaFees(updated: Record<string, number>) {
  await updateFeesDoc(nzFeesRef(), { nzVisaFeesNZD: updated }, 'fees.nz.visa.update');
}
export async function updateNzMedicalFees(updated: Record<string, number>) {
  await updateFeesDoc(nzFeesRef(), { nzMedicalExamFeesPHP: updated }, 'fees.nz.medical.update');
}
export async function updateNzEnglishTestFee(updated: Record<string, number>) {
  await updateFeesDoc(nzFeesRef(), { nzEnglishTestFeesPHP: updated }, 'fees.nz.english.update');
}
export async function updateNzAssistanceFees(updated: Record<string, number>) {
  await updateFeesDoc(nzFeesRef(), { nzAssistanceFeesPHP: updated }, 'fees.nz.assistance.update');
}
export async function updateNzEvidenceOfFunds(updated: Record<string, number>) {
  await updateFeesDoc(nzFeesRef(), { nzEvidenceOfFundsNZD: updated }, 'fees.nz.evidence.update');
}
export async function fetchCanadaFees() {
  if (E2E_MOCK_DATA) {
    return cloneData(e2eMockFeesDocs.canada);
  }
  return fetchWithSeed(canadaFeesRef(), canadaSeed, {
    mergeMissingKeys: true,
    errorLabel: 'fetchCanadaFees',
  });
}
export async function updateCanadaVisaAndBiometrics(updated: Record<string, number>) {
  await updateFeesDoc(canadaFeesRef(), { canadaVisaAndBiometricsCAD: updated }, 'fees.canada.visa-biometrics.update');
}
export async function updateCanadaMedicalFees(updated: Record<string, number>) {
  await updateFeesDoc(canadaFeesRef(), { canadaMedicalExamFeesPHP: updated }, 'fees.canada.medical.update');
}
export async function updateCanadaEnglishTestFees(updated: Record<string, number>) {
  await updateFeesDoc(canadaFeesRef(), { canadaEnglishTestFeesPHP: updated }, 'fees.canada.english.update');
}
export async function updateCanadaAssistanceFees(updated: Record<string, number>) {
  await updateFeesDoc(canadaFeesRef(), { canadaAssistanceFeesPHP: updated }, 'fees.canada.assistance.update');
}
export async function updateCanadaEvidenceOfFunds(updated: Record<string, any>) {
  await updateFeesDoc(canadaFeesRef(), { canadaEvidenceOfFundsCAD: updated }, 'fees.canada.evidence.update');
}
export async function updateIrelandFeesField(fieldName: string, updatedMap: Record<string, number>) {
  await updateFeesDoc(irelandFeesRef(), { [fieldName]: updatedMap }, `fees.ireland.${fieldName}.update`);
}
export async function updateIrelandFeesEUR(updated: {
  studentInsurancePerYear: number;
  visaFeeSingleEntry: number;
  visaFeeMultipleEntry: number;
  protectionOfEnrolledLearnersFee: number;
}) {
  await updateFeesDoc(irelandFeesRef(), { irelandFeesEUR: updated }, 'fees.ireland.core.update');
}
export async function updateIrelandEnglishTestFees(updated: {
  ieltsFeePHP: number;
  duolingoFeeUSD: number;
}) {
  await updateFeesDoc(irelandFeesRef(), { englishTestFees: updated }, 'fees.ireland.english.update');
}
export async function updateIrelandEvidenceOfFunds(updated: { costOfLiving: number }) {
  await updateFeesDoc(irelandFeesRef(), { evidenceOfFundsEUR: updated }, 'fees.ireland.evidence.update');
}
export async function fetchAustraliaFees() {
  if (E2E_MOCK_DATA) {
    return cloneData(e2eMockFeesDocs.australia);
  }
  return fetchWithSeed(australiaFeesRef(), australiaSeed, { mergeMissingKeys: false });
}
export async function updateAustraliaFeesField(fieldName: string, updatedMap: Record<string, number>) {
  await updateFeesDoc(australiaFeesRef(), { [fieldName]: updatedMap }, `fees.australia.${fieldName}.update`);
}
export async function updateAustraliaVisaFees(updated: {
  studentVisaFee: number;
  dependentVisaFeeSpouse18Plus: number;
  dependentVisaFeeChildUnder18: number;
}) {
  await updateFeesDoc(australiaFeesRef(), { visaFeesAUD: updated }, 'fees.australia.visa.update');
}
export async function updateAustraliaMedicalExamFees(updated: {
  medicalExamFee: number;
  medicalExamFeeWithTB: number;
  dependentMedicalExamFee: number;
}) {
  await updateFeesDoc(australiaFeesRef(), { medicalExamFeesPHP: updated }, 'fees.australia.medical.update');
}
export async function updateAustraliaBiometricsFees(updated: {
  biometricsFee: number;
  dependentBiometricsFee: number;
}) {
  await updateFeesDoc(australiaFeesRef(), { biometricsFeesPHP: updated }, 'fees.australia.biometrics.update');
}
export async function updateAustraliaEnglishTestFee(updated: { englishTestFee: number }) {
  await updateFeesDoc(australiaFeesRef(), { englishTestFeesPHP: updated }, 'fees.australia.english.update');
}
export async function updateAustraliaAssistanceFees(updated: {
  perDependent: number;
  perDependentSubsequentEntry: number;
}) {
  await updateFeesDoc(australiaFeesRef(), { assistanceFeesPHP: updated }, 'fees.australia.assistance.update');
}
export async function updateAustraliaEvidenceOfFunds(updated: {
  studentCostOfLiving: number;
  partnerCostOfLiving: number;
  costOfLivingPerChild: number;
  airfarePerPerson: number;
}) {
  await updateFeesDoc(australiaFeesRef(), { evidenceOfFundsAUD: updated }, 'fees.australia.evidence.update');
}
export async function getOshcFees(plan: OshcPlan): Promise<Record<string, number>> {
  const allFees = await fetchAustraliaFees();
  if (allFees && allFees[plan]) {
    return allFees[plan] as Record<string, number>;
  }
  return {};
}
export async function updateOshcFees(fieldName: OshcPlan, updatedMap: Record<string, number>) {
  if (E2E_MOCK_DATA) {
    e2eMockFeesDocs.australia = { ...e2eMockFeesDocs.australia, [fieldName]: cloneData(updatedMap) };
    return;
  }
  await updateFeesDoc(australiaFeesRef(), { [fieldName]: updatedMap }, `fees.australia.${fieldName}.update`);
}
