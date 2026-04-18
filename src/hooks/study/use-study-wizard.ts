'use client';
import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useSyncExternalStore,
  type Dispatch,
  type SetStateAction,
} from 'react';
import type { Answers, ModalID } from '@/lib/core/types';
import { TOTAL_STEPS } from '@/lib/core/constants';
import { fetchExchangeRates, type ExchangeRates } from '@/services/exchange-rate-service';
import { calculateFinancials, calculateFinancialDocuments } from '@/services/financials';
import {
  fetchAustraliaFees,
  fetchCanadaFees,
  fetchIrelandFees,
  fetchNewZealandFees,
} from '@/services/fees/firestore-fees';
import type {
  FinancialCalculationResult,
  FinancialDocumentCalculationResult,
} from '@/services/financials/common';
import {
  dispatch,
  subscribe,
  getSnapshot,
  getServerSnapshot,
} from './use-study-wizard.store';
type FeesDoc = any | null;
type FeeFetcher = () => Promise<any>;
type FeeSetter = Dispatch<SetStateAction<FeesDoc>>;
function useDestinationFeeDoc(params: {
  isHydrated: boolean;
  studyDestination: string;
  targetDestination: string;
  fetcher: FeeFetcher;
  setter: FeeSetter;
  errorLabel: string;
}) {
  const { isHydrated, studyDestination, targetDestination, fetcher, setter, errorLabel } = params;
  useEffect(() => {
    let cancelled = false;
    async function loadFees() {
      if (!isHydrated) return;
      if (studyDestination !== targetDestination) {
        setter(null);
        return;
      }
      try {
        const doc = await fetcher();
        if (!cancelled) setter(doc);
      } catch (error) {
        console.error(`[fees] failed to fetch ${errorLabel} fees`, error);
        if (!cancelled) setter(null);
      }
    }
    loadFees();
    return () => {
      cancelled = true;
    };
  }, [isHydrated, studyDestination, targetDestination, fetcher, setter, errorLabel]);
}
export function useStudyWizard() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { currentStep, answers } = state;
  const isNonGenuineFlow = useMemo(() => {
    const sponsor = answers.financialSponsor;
    const shopping = answers.isShoppingNonGenuine;
    if (sponsor === 'No') return true;
    if ((sponsor === 'Yes' || sponsor === 'Not yet sure') && shopping === 'Yes') return true;
    return false;
  }, [answers.financialSponsor, answers.isShoppingNonGenuine]);
  const effectiveTotalSteps = isNonGenuineFlow ? 6 : TOTAL_STEPS;
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [modalId, setModalId] = useState<ModalID | null>(null);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);
  const [isLoadingRates, setIsLoadingRates] = useState(true);
  const [rateError, setRateError] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<FinancialCalculationResult | null>(null);
  const [financialDocuments, setFinancialDocuments] = useState<FinancialDocumentCalculationResult | null>(null);
  const [australiaFeesDoc, setAustraliaFeesDoc] = useState<any | null>(null);
  const [canadaFeesDoc, setCanadaFeesDoc] = useState<any | null>(null);
  const [irelandFeesDoc, setIrelandFeesDoc] = useState<any | null>(null);
  const [newZealandFeesDoc, setNewZealandFeesDoc] = useState<any | null>(null);
  useEffect(() => {
    setIsHydrated(true);
    async function loadRates() {
      try {
        setRateError(null);
        setIsLoadingRates(true);
        const rates = await fetchExchangeRates();
        setExchangeRates(rates);
      } catch (error) {
        setRateError('Could not fetch exchange rates. Using estimates.');
        console.error(error);
      } finally {
        setIsLoadingRates(false);
      }
    }
    loadRates();
    const intervalId = setInterval(loadRates, 30 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);
  useEffect(() => {
    if (!isHydrated || isComplete) return;
    try {
      const stateToSave = JSON.stringify({ savedAnswers: answers, savedStep: currentStep });
      localStorage.setItem('studyWizardState', stateToSave);
    } catch (error) {
      console.error('Failed to save state to localStorage', error);
    }
  }, [answers, currentStep, isHydrated, isComplete]);
  useEffect(() => {
    if (!exchangeRates || !isHydrated) return;
    const feeDocs = {
      australia: australiaFeesDoc,
      canada: canadaFeesDoc,
      ireland: irelandFeesDoc,
      newZealand: newZealandFeesDoc,
    };
    setPaymentDetails(calculateFinancials(answers, exchangeRates, feeDocs));
    setFinancialDocuments(calculateFinancialDocuments(answers, exchangeRates, feeDocs));
  }, [
    answers,
    exchangeRates,
    isHydrated,
    australiaFeesDoc,
    canadaFeesDoc,
    irelandFeesDoc,
    newZealandFeesDoc,
  ]);
  useDestinationFeeDoc({
    isHydrated,
    studyDestination: answers.studyDestination || '',
    targetDestination: 'Australia',
    fetcher: fetchAustraliaFees,
    setter: setAustraliaFeesDoc,
    errorLabel: 'australia',
  });
  useDestinationFeeDoc({
    isHydrated,
    studyDestination: answers.studyDestination || '',
    targetDestination: 'New Zealand',
    fetcher: fetchNewZealandFees,
    setter: setNewZealandFeesDoc,
    errorLabel: 'new zealand',
  });
  useDestinationFeeDoc({
    isHydrated,
    studyDestination: answers.studyDestination || '',
    targetDestination: 'Ireland',
    fetcher: fetchIrelandFees,
    setter: setIrelandFeesDoc,
    errorLabel: 'ireland',
  });
  useDestinationFeeDoc({
    isHydrated,
    studyDestination: answers.studyDestination || '',
    targetDestination: 'Canada',
    fetcher: fetchCanadaFees,
    setter: setCanadaFeesDoc,
    errorLabel: 'canada',
  });
  const handleAnswerChange = useCallback((id: keyof Answers, value: any) => {
    dispatch({ type: 'SET_ANSWER', payload: { id, value } });
  }, []);
  const handleSetStep = useCallback(
    (step: number) => {
      if (step > 0 && step <= effectiveTotalSteps) {
        dispatch({ type: 'SET_CURRENT_STEP', payload: step });
      }
    },
    [effectiveTotalSteps],
  );
  const isAnswered = true;
  const handleFormSubmit = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsComplete(true);
    setIsLoading(false);
  };
  const handleNext = () => {
    if (!isAnswered) return;
    if (currentStep < effectiveTotalSteps) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: currentStep + 1 });
    } else if (!isNonGenuineFlow) {
      handleFormSubmit();
    }
  };
  const handleBack = () => {
    if (isComplete) {
      setIsComplete(false);
      dispatch({ type: 'SET_CURRENT_STEP', payload: effectiveTotalSteps });
      return;
    }
    if (currentStep > 1) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: currentStep - 1 });
    }
  };
  const handleReset = useCallback(() => {
    dispatch({ type: 'RESET_WIZARD' });
    setIsComplete(false);
    setIsLoading(false);
  }, []);
  const handleClearAnswers = useCallback(() => {
    dispatch({ type: 'CLEAR_ANSWERS' });
    setIsComplete(false);
    setIsLoading(false);
  }, []);
  useEffect(() => {
    if (isNonGenuineFlow && currentStep > 6) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: 6 });
    }
  }, [currentStep, isNonGenuineFlow]);
  return {
    currentStep,
    answers,
    isLoading,
    isComplete,
    isHydrated,
    isAnswered,
    modalId,
    setModalId,
    isNonGenuineFlow,
    effectiveTotalSteps,
    handleAnswerChange,
    handleNext,
    handleBack,
    handleReset,
    handleClearAnswers,
    handleSetStep,
    paymentDetails,
    financialDocuments,
    isLoadingRates,
    rateError,
    exchangeRates,
    handleFormSubmit,
  };
}
