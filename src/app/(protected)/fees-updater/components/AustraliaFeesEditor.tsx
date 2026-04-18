'use client';
import { useState } from 'react';
import { fetchAustraliaFees } from '@/services/fees/firestore-fees';
import OshcFeesEditor from './editors/OshcFeesEditor';
import { PLAN_OPTIONS } from '@/services/fees/firestore-fees';
import VisaFeesEditor from './editors/VisaFeesEditor';
import MedicalFeesEditor from './editors/MedicalFeesEditor';
import BiometricsFeesEditor from './editors/BiometricsFeesEditor';
import EnglishTestFeeEditor from './editors/EnglishTestFeeEditor';
import AssistanceFeesEditor from './editors/AssistanceFeesEditor';
import EvidenceOfFundsEditor from './editors/EvidenceOfFundsEditor';
import { useFeesEditorState } from './hooks/use-fees-editor-state';
import FeesEditorAlerts from './ui/fees-editor-alerts';
import FeesEditorSelect, { type FeesSelectOption } from './ui/fees-editor-select';

type AustraliaFeeCategory =
  | 'OSHC'
  | 'VISA'
  | 'MEDICAL'
  | 'BIOMETRICS'
  | 'ENGLISH'
  | 'ASSISTANCE'
  | 'EOF';
const AUSTRALIA_FEE_OPTIONS: FeesSelectOption<AustraliaFeeCategory>[] = [
  { value: 'OSHC', label: 'OSHC' },
  { value: 'VISA', label: 'Visa Fee' },
  { value: 'MEDICAL', label: 'Medical Exam Fee' },
  { value: 'BIOMETRICS', label: 'Biometrics Fee' },
  { value: 'ENGLISH', label: 'English Test Fee' },
  { value: 'ASSISTANCE', label: 'Agency Assistance Fee' },
  { value: 'EOF', label: 'Evidence of Funds' },
];
const AUSTRALIA_PLAN_OPTIONS: FeesSelectOption<string>[] = PLAN_OPTIONS.map((plan) => ({
  value: plan.label,
  label: plan.label,
}));

export default function AustraliaFeesEditor() {
  const [feeCategory, setFeeCategory] = useState<AustraliaFeeCategory>('OSHC');
  const [planType, setPlanType] = useState<string>(PLAN_OPTIONS[0].label);
  const { feesDoc, loading, error, user, refreshFees } = useFeesEditorState(fetchAustraliaFees);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <FeesEditorAlerts error={error} isAuthenticated={!!user} />

      <div className="flex flex-wrap gap-x-8 gap-y-6 my-4 items-end">
        <FeesEditorSelect
          label="Fee to be Updated"
          value={feeCategory}
          options={AUSTRALIA_FEE_OPTIONS}
          onValueChange={setFeeCategory}
          disabled={!user}
          triggerClassName="w-[180px]"
        />
        {feeCategory === 'OSHC' && (
          <FeesEditorSelect
            label="Plan Type"
            value={planType}
            options={AUSTRALIA_PLAN_OPTIONS}
            onValueChange={setPlanType}
            disabled={!user}
            triggerClassName="w-[180px]"
          />
        )}
      </div>

      {feeCategory === 'OSHC' && (
        <OshcFeesEditor
          feesDoc={feesDoc}
          onRefresh={refreshFees}
          disabled={!user}
          planType={planType}
          setPlanType={setPlanType}
        />
      )}
      {feeCategory === 'VISA' && <VisaFeesEditor feesDoc={feesDoc} onRefresh={refreshFees} disabled={!user} />}
      {feeCategory === 'MEDICAL' && (
        <MedicalFeesEditor feesDoc={feesDoc} onRefresh={refreshFees} disabled={!user} />
      )}
      {feeCategory === 'BIOMETRICS' && (
        <BiometricsFeesEditor feesDoc={feesDoc} onRefresh={refreshFees} disabled={!user} />
      )}
      {feeCategory === 'ENGLISH' && (
        <EnglishTestFeeEditor feesDoc={feesDoc} onRefresh={refreshFees} disabled={!user} />
      )}
      {feeCategory === 'ASSISTANCE' && (
        <AssistanceFeesEditor feesDoc={feesDoc} onRefresh={refreshFees} disabled={!user} />
      )}
      {feeCategory === 'EOF' && (
        <EvidenceOfFundsEditor feesDoc={feesDoc} onRefresh={refreshFees} disabled={!user} />
      )}
    </div>
  );
}
