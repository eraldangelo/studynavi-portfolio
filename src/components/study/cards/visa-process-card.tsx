'use client';
import { useState } from 'react';
import {
  Award,
  Contact,
  DollarSign,
  FileCheck,
  FileSignature,
  FileText,
  Fingerprint,
  GraduationCap,
  Scale,
  School,
  Search,
  Stethoscope,
  UserCheck,
} from 'lucide-react';
import type { Answers, ModalContent, ModalID } from '@/lib/core/types';
import { QUESTIONS } from '@/lib/core/constants';
import InfoModal from '@/components/common/dialogs/info-modal';
import { MODAL_CONTENT } from '@/lib/modals/content';
import { VisaProcessCardMiniView } from '@/components/study/cards/visa-process-card-mini-view';
import { VisaProcessCardFullView } from '@/components/study/cards/visa-process-card-full-view';
import type { VisaProcessStep } from '@/components/study/cards/visa-process-card.types';
interface VisaProcessCardProps {
  answers: Answers;
  onAnswerChange?: (id: keyof Answers, value: any) => void;
  setModalId?: (id: ModalID | null) => void;
  mini?: boolean;
  showIcons?: boolean;
  showDescription?: boolean;
}
const RESEARCH_STEPS: VisaProcessStep[] = [
  { id: 'consultation', title: 'Consultation & Assessment', description: "Initial assessment of the student's profile and study goals.", icon: UserCheck },
  { id: 'research-topic', title: 'Look for Research Topic', description: 'Identify a suitable research topic.', icon: Search },
  { id: 'supervisor', title: 'Look for a Supervisor', description: 'Find and secure a research supervisor.', icon: Contact },
  { id: 'application', title: 'Apply Directly to the University', description: 'Submit the research application directly.', icon: School },
  { id: 'offer-letter', title: 'Offer Letter', description: 'Receiving a conditional or unconditional offer.', icon: FileCheck },
  { id: 'nominate-agency', title: 'Nominate Agency Representative', description: "Nominate the agency as the student's representative after receiving the offer.", icon: Award },
  { id: 'tuition-payment', title: 'Tuition Fee Payment', description: 'Paying the initial deposit or full tuition fee.', icon: DollarSign },
  { id: 'loa-coe', title: 'Confirmation of Enrollment (CoE)', description: "The official document confirming the student's place.", icon: GraduationCap },
  { id: 'visa-lodgement', title: 'Visa Application Lodgement', description: "Submitting the student's visa application.", icon: FileText },
  { id: 'medical-exam', title: 'Medical Examination', description: 'Completing a health check-up.', icon: Stethoscope },
  { id: 'biometrics', title: 'Biometrics', description: 'Providing fingerprints and a photo.', icon: Fingerprint },
  { id: 'visa-outcome', title: 'Visa Outcome', description: 'Receiving the final decision on the visa application.', icon: Scale, isBranch: true },
];
const NEW_ZEALAND_STEPS: VisaProcessStep[] = [
  { id: 'consultation', title: 'Consultation & Assessment', description: "Initial assessment of the student's profile and study goals.", icon: UserCheck },
  { id: 'documentation', title: 'Document Collection', description: 'Gathering all necessary academic and personal documents.', icon: FileText },
  { id: 'application', title: 'School Application', description: 'Submitting the application to the chosen institution.', icon: School },
  { id: 'loa-coe', title: 'Offer of Place', description: "The official document confirming the student's place in the course.", icon: GraduationCap },
  { id: 'visa-lodgement', title: 'Visa Application Lodgement', description: 'Submitting the student visa application to the embassy.', icon: FileText },
  { id: 'medical-exam', title: 'Medical Examination', description: 'Completing a health check-up at an accredited clinic.', icon: Stethoscope },
  { id: 'visa-outcome', title: 'Visa Outcome', description: 'Receiving the final decision on the visa application.', icon: Scale, isBranch: true },
];
function getCanadaSteps(studyDestination?: string, programCategory?: string) {
  const baseSteps: VisaProcessStep[] = [
    { id: 'consultation', title: 'Consultation & Assessment', description: "Initial assessment of the student's profile and study goals.", icon: UserCheck },
    { id: 'documentation', title: 'Document Collection', description: 'Gathering all necessary academic and personal documents.', icon: FileText },
    { id: 'application', title: 'School Application', description: 'Submitting the application to the chosen institution.', icon: School },
    { id: 'offer-letter', title: 'Offer Letter', description: 'Receiving a conditional or unconditional offer from the school.', icon: FileCheck },
    { id: 'tuition-payment', title: 'Tuition Fee Payment', description: 'Paying the initial deposit or full tuition fee as required.', icon: DollarSign },
    { id: 'loa-coe', title: 'Letter of Acceptance (LoA)', description: "The official document confirming the student's place in the course.", icon: GraduationCap },
    { id: 'pal', title: 'Provincial Attestation Letter', description: 'A mandatory letter from the province to apply for a study permit.', icon: FileSignature },
    { id: 'visa-lodgement', title: 'Visa Application Lodgement', description: 'Submitting the student visa application to the embassy.', icon: FileText },
    { id: 'medical-exam', title: 'Medical Examination', description: 'Completing a health check-up at an accredited clinic.', icon: Stethoscope },
    { id: 'biometrics', title: 'Biometrics', description: 'Providing fingerprints and a photo at a designated center.', icon: Fingerprint },
    { id: 'visa-outcome', title: 'Visa Outcome', description: 'Receiving the final decision on the visa application.', icon: Scale, isBranch: true },
  ];
  if (studyDestination === 'Canada' && (programCategory === 'Master Degree' || programCategory === 'Doctorate (PhD)')) {
    return baseSteps.filter((step) => step.id !== 'pal');
  }
  return baseSteps;
}
function getDefaultSteps(studyDestination?: string) {
  const steps: VisaProcessStep[] = [
    { id: 'consultation', title: 'Consultation & Assessment', description: "Initial assessment of the student's profile and study goals.", icon: UserCheck },
    { id: 'documentation', title: 'Document Collection', description: 'Gathering all necessary academic and personal documents.', icon: FileText },
    { id: 'application', title: 'School Application', description: 'Submitting the application to the chosen institution.', icon: School },
    { id: 'offer-letter', title: 'Offer Letter', description: 'Receiving a conditional or unconditional offer from the school.', icon: FileCheck },
    { id: 'tuition-payment', title: 'Tuition Fee Payment', description: 'Paying the initial deposit or full tuition fee as required.', icon: DollarSign },
    { id: 'loa-coe', title: 'Confirmation of Enrollment (CoE)', description: "The official document confirming the student's place in the course.", icon: GraduationCap },
    { id: 'visa-lodgement', title: 'Visa Application Lodgement', description: 'Submitting the student visa application to the embassy.', icon: FileText },
    { id: 'medical-exam', title: 'Medical Examination', description: 'Completing a health check-up at an accredited clinic.', icon: Stethoscope },
    { id: 'visa-outcome', title: 'Visa Outcome', description: 'Receiving the final decision on the visa application.', icon: Scale, isBranch: true },
  ];
  if (['Australia', 'UK'].includes(studyDestination || '')) {
    const medicalExamIndex = steps.findIndex((step) => step.id === 'medical-exam');
    if (medicalExamIndex !== -1) {
      steps.splice(medicalExamIndex + 1, 0, {
        id: 'biometrics',
        title: 'Biometrics',
        description: 'Providing fingerprints and a photo at a designated center.',
        icon: Fingerprint,
      });
    }
  }
  if (studyDestination === 'Ireland') {
    const loaStep = steps.find((step) => step.id === 'loa-coe');
    if (loaStep) loaStep.title = 'Letter of Acceptance (LoA)';
    return steps.filter((step) => step.id !== 'medical-exam' && step.id !== 'biometrics');
  }
  if (studyDestination === 'Australia') {
    const coeStep = steps.find((step) => step.id === 'loa-coe');
    if (coeStep) coeStep.title = 'Confirmation of Enrollment (CoE)';
  }
  return steps;
}
export default function VisaProcessCard({
  answers,
  onAnswerChange,
  setModalId,
  mini = false,
  showIcons = true,
  showDescription = true,
}: VisaProcessCardProps) {
  const [dynamicModalContent, setDynamicModalContent] = useState<ModalContent | null>(null);
  const { studyDestination = 'Australia', programCategory } = answers;
  const isAustraliaResearch = studyDestination === 'Australia' && ['Master Research', 'PhD'].includes(programCategory || '');
  const isCanada = studyDestination === 'Canada';
  const isNewZealand = studyDestination === 'New Zealand';
  const canadaSteps = getCanadaSteps(studyDestination, programCategory);
  const defaultSteps = getDefaultSteps(studyDestination);
  const steps = isNewZealand
    ? NEW_ZEALAND_STEPS
    : isCanada
      ? canadaSteps
      : isAustraliaResearch && answers.schoolWillAssist !== 'true'
        ? RESEARCH_STEPS
        : defaultSteps;
  const branchStep = steps.find((step) => step.isBranch);
  const regularSteps = steps.filter((step) => !step.isBranch);
  const createDynamicModal = (modalId: ModalID) => {
    const originalContent = MODAL_CONTENT[modalId];
    if (!originalContent) return;
    const coeOrLoa = studyDestination === 'Australia' || !studyDestination ? 'Confirmation of Enrollment' : 'Letter of Acceptance';
    const newTitle = originalContent.title.replace(/\[DOCUMENT_TYPE\]/g, coeOrLoa);
    const newDescription = originalContent.description.map((item) => {
      if (typeof item === 'string') {
        return item.replace(/\[DOCUMENT_TYPE\]/g, coeOrLoa);
      }
      if (typeof item === 'object' && item.list) {
        item.list = item.list.map((listItem) => listItem.replace(/\[DOCUMENT_TYPE\]/g, coeOrLoa));
      }
      return item;
    });
    setDynamicModalContent({ ...originalContent, title: newTitle, description: newDescription });
  };
  const handleIconClick = (id?: string) => {
    if (mini || !setModalId) return;
    if (id === 'research-topic') setModalId('AUSTRALIA_RESEARCH_TOPIC');
    else if (id === 'supervisor') setModalId('AUSTRALIA_FIND_SUPERVISOR');
    else if (id === 'nominate-agency') setModalId('NOMINATE_AGENCY_INFO');
    else if (id === 'offer-letter') setModalId('OFFER_LETTER_INFO');
    else if (id === 'tuition-payment') createDynamicModal('TUITION_FEE_PAYMENT_INFO');
    else if (id === 'application') {
      if (isAustraliaResearch) {
        setModalId(answers.schoolWillAssist === 'true' ? 'SCHOOL_APPLICATION_INFO' : 'AUSTRALIA_RESEARCH_SCHOOL_APPLICATION_INFO');
      } else setModalId('SCHOOL_APPLICATION_INFO');
    } else if (id === 'loa-coe') {
      if (isNewZealand) setModalId('NEW_ZEALAND_OFFER_OF_PLACE_INFO');
      else createDynamicModal('LOA_COE_INFO');
    } else if (id === 'medical-exam' && isNewZealand) setModalId('NZ_MEDICAL_EXAM_INFO');
    else if (id === 'medical-exam' && studyDestination === 'Australia') setModalId('AUSTRALIA_MEDICAL_EXAM_INFO');
    else if (id === 'medical-exam' && isCanada) setModalId('CANADA_MEDICAL_EXAM_INFO');
    else if (id === 'biometrics') {
      if (studyDestination === 'Australia') setModalId('AUSTRALIA_BIOMETRICS_INFO');
      else if (isCanada) setModalId('CANADA_BIOMETRICS_INFO');
      else if (studyDestination === 'UK') setModalId('UK_BIOMETRICS_INFO');
    } else if (id === 'visa-lodgement') {
      if (studyDestination === 'Ireland') setModalId('IRELAND_VISA_LODGEMENT_INFO');
      else if (studyDestination === 'Australia') setModalId('AUSTRALIA_VISA_LODGEMENT_INFO');
      else if (isNewZealand) setModalId('NZ_VISA_LODGEMENT_INFO');
      else if (isCanada) setModalId('CANADA_VISA_LODGEMENT_INFO');
    } else if (id === 'visa-outcome') {
      if (studyDestination === 'Ireland') setModalId('IRELAND_VISA_PROCESSING_TIME');
      else if (studyDestination === 'Australia') setModalId('AUSTRALIA_VISA_PROCESSING_TIME');
      else if (isNewZealand) setModalId('NZ_VISA_PROCESSING_TIME');
      else if (isCanada) setModalId('CANADA_VISA_PROCESSING_TIME');
    } else if (id === 'pal') setModalId('CANADA_PAL_RULE_INFO');
    else if (id === 'passport-submission') setModalId('CANADA_PASSPORT_SUBMISSION_INFO');
    else if (id === 'poe-letter') setModalId('CANADA_POE_LETTER_INFO');
    else if (id === 'approval-in-principle') setModalId('NZ_APPROVAL_IN_PRINCIPLE');
  };
  const closeModal = () => {
    if (setModalId) setModalId(null);
    setDynamicModalContent(null);
  };
  const isStepClickable = (stepId: string) => {
    const shared = ['offer-letter', 'tuition-payment', 'application', 'loa-coe', 'biometrics', 'research-topic', 'supervisor', 'nominate-agency', 'pal', 'visa-lodgement', 'visa-outcome'];
    if (shared.includes(stepId)) return true;
    return stepId === 'medical-exam' && (studyDestination === 'Australia' || isNewZealand || isCanada);
  };
  const destinationOptions = QUESTIONS.find((q) => q.id === 'studyDestination')?.options || [];
  const destinationInfo = destinationOptions.find((opt) => typeof opt !== 'string' && opt.name === answers.studyDestination);
  const flagUrl = destinationInfo && typeof destinationInfo !== 'string'
    ? (destinationInfo.flagUrl ?? null)
    : null;
  if (mini) {
    return <VisaProcessCardMiniView steps={steps} isNewZealand={isNewZealand} isCanada={isCanada} />;
  }
  return (
    <>
      <VisaProcessCardFullView
        answers={answers}
        regularSteps={regularSteps}
        branchStep={branchStep}
        isAustraliaResearch={isAustraliaResearch}
        isNewZealand={isNewZealand}
        isCanada={isCanada}
        showIcons={showIcons}
        showDescription={showDescription}
        flagUrl={flagUrl}
        onIconClick={handleIconClick}
        isStepClickable={isStepClickable}
        onSchoolAssistToggle={
          onAnswerChange
            ? (checked) => onAnswerChange('schoolWillAssist', checked ? 'true' : 'false')
            : undefined
        }
      />
      <InfoModal
        isOpen={!!dynamicModalContent}
        content={dynamicModalContent}
        onClose={closeModal}
        onConfirm={closeModal}
        answers={answers}
      />
    </>
  );
}
