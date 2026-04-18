import type { ModalContent } from '@/lib/core/types';
import newZealandDependentsModalContent from './new-zealand/new-zealand-dependents.json';
import newZealandEligibilityRiskModalContent from './new-zealand/new-zealand-eligibility-risk.json';
import newZealandProcessMedicalModalContent from './new-zealand/new-zealand-process-medical.json';

export const NEW_ZEALAND_MODAL_CONTENT: Record<string, ModalContent> = {
  ...(newZealandEligibilityRiskModalContent as Record<string, ModalContent>),
  ...(newZealandDependentsModalContent as Record<string, ModalContent>),
  ...(newZealandProcessMedicalModalContent as Record<string, ModalContent>),
};
