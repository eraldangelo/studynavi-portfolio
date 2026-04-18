
import { useState, useEffect } from 'react';
import type { Answers, ModalID } from '@/lib/core/types';

export function usePaymentDetailsState(
  answers: Answers,
  onAnswer: (id: keyof Answers, value: any) => void,
  setModalId: (id: ModalID | null) => void
) {
  const [hasScholarship, setHasScholarship] = useState(!!answers.scholarshipPercentage || !!answers.scholarshipAmount);
  const [scholarshipInputType, setScholarshipInputType] = useState<'percentage' | 'amount'>(answers.scholarshipAmount ? 'amount' : 'percentage');
  const [requiredTBTest, setRequiredTBTest] = useState(answers.requiredTBTest === 'true');
  const [isSubsequentEntry, setIsSubsequentEntry] = useState(answers.isSubsequentEntry === 'true');
  const [englishTestRequired, setEnglishTestRequired] = useState(answers.englishTestRequired === 'true');
  const [isIELTSSelected, setIsIELTSSelected] = useState(answers.isIELTSSelected === 'true');
  const [hasMOI, setHasMOI] = useState(answers.hasMOI === 'true');
  const [isMultipleEntryVisa, setIsMultipleEntryVisa] = useState(answers.isMultipleEntryVisa === 'true');
  const [currentTime, setCurrentTime] = useState<string | null>(null);
  const [isApplicationFeeWaived, setIsApplicationFeeWaived] = useState(answers.applicationFeeWaived === 'true');

  const isIreland = answers.studyDestination === 'Ireland';
  const isNewZealand = answers.studyDestination === 'New Zealand';
  const isAustralia = answers.studyDestination === 'Australia';
  const isCanada = answers.studyDestination === 'Canada';

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Asia/Manila'
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    onAnswer('requiredTBTest', requiredTBTest ? 'true' : 'false');
  }, [requiredTBTest, onAnswer]);
  
  useEffect(() => {
    onAnswer('englishTestRequired', englishTestRequired ? 'true' : 'false');
  }, [englishTestRequired, onAnswer]);

  useEffect(() => {
    onAnswer('isSubsequentEntry', isSubsequentEntry ? 'true' : 'false');
  }, [isSubsequentEntry, onAnswer]);
  
  useEffect(() => {
    onAnswer('isIELTSSelected', isIELTSSelected ? 'true' : 'false');
  }, [isIELTSSelected, onAnswer]);

  useEffect(() => {
    onAnswer('hasMOI', hasMOI ? 'true' : 'false');
  }, [hasMOI, onAnswer]);

  useEffect(() => {
    onAnswer('isMultipleEntryVisa', isMultipleEntryVisa ? 'true' : 'false');
  }, [isMultipleEntryVisa, onAnswer]);

  useEffect(() => {
    onAnswer('applicationFeeWaived', isApplicationFeeWaived ? 'true' : 'false');
    if (isApplicationFeeWaived) {
      onAnswer('schoolApplicationFee', '0');
    }
  }, [isApplicationFeeWaived, onAnswer]);

  useEffect(() => {
    if (!hasScholarship) {
      onAnswer('scholarshipPercentage', '');
      onAnswer('scholarshipAmount', '');
      onAnswer('scholarshipType', '');
    }
  }, [hasScholarship, onAnswer]);

  useEffect(() => {
    if (answers.paymentType === 'tuition_fee_deposit_only') {
      onAnswer('manualPayment', '');
    } else if (answers.paymentType === 'manual') {
      onAnswer('tuitionFeeDeposit', '');
    } else {
      onAnswer('tuitionFeeDeposit', '');
      onAnswer('manualPayment', '');
    }
  }, [answers.paymentType, onAnswer]);

  const hasDependents = answers.visaAssistance && answers.visaAssistance !== 'No';

  const isPaymentTypeDisabled = isIreland || isNewZealand;
  
  const showEnglishTestFeeSection = answers.ieltsPreparation !== 'Yes' && 
                                  (isIreland || isCanada || (answers.highestEducation !== 'International Baccalaureate / GCE A-Levels'));

  const getPaymentDueLabel = () => {
    switch(answers.studyDestination) {
      case 'Ireland':
      case 'Canada':
        return "Payment due to get a Letter of Acceptance";
      case 'Australia':
        return "Payment due to get Confirmation of Enrollment (CoE)";
      case 'New Zealand':
        return "Payment due to get Letter of Offer";
      default:
        return "Payment due to get CoE/LoA";
    }
  }

  return {
    hasScholarship,
    setHasScholarship,
    scholarshipInputType,
    setScholarshipInputType,
    requiredTBTest,
    setRequiredTBTest,
    isSubsequentEntry,
    setIsSubsequentEntry,
    englishTestRequired,
    setEnglishTestRequired,
    isIELTSSelected,
    setIsIELTSSelected,
    hasMOI,
    setHasMOI,
    isMultipleEntryVisa,
    setIsMultipleEntryVisa,
    currentTime,
    isApplicationFeeWaived,
    setIsApplicationFeeWaived,
    isIreland,
    isNewZealand,
    isAustralia,
    isCanada,
    hasDependents,
    isPaymentTypeDisabled,
    showEnglishTestFeeSection,
    getPaymentDueLabel,
  };
}
