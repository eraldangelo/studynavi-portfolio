'use client';

import { useState } from 'react';
import { fetchNewZealandFees } from '@/services/fees/firestore-fees';
import {
  NzAssistanceEditor,
  NzEnglishEditor,
  NzEvidenceEditor,
  NzInsuranceEditor,
  NzMedicalEditor,
  NzVisaEditor,
} from './NewZealandFeesEditor.sections';
import { useFeesEditorState } from './hooks/use-fees-editor-state';
import FeesEditorAlerts from './ui/fees-editor-alerts';
import FeesEditorSelect, { type FeesSelectOption } from './ui/fees-editor-select';

type NzFeeCategory = 'INSURANCE' | 'VISA' | 'MEDICAL' | 'ENGLISH' | 'ASSISTANCE' | 'EOF';
const NEW_ZEALAND_FEE_OPTIONS: FeesSelectOption<NzFeeCategory>[] = [
  { value: 'INSURANCE', label: 'Insurance' },
  { value: 'VISA', label: 'Visa Fee' },
  { value: 'MEDICAL', label: 'Medical Exam Fee' },
  { value: 'ENGLISH', label: 'English Test Fee' },
  { value: 'ASSISTANCE', label: 'Agency Assistance Fee' },
  { value: 'EOF', label: 'Evidence of Funds' },
];
const NEW_ZEALAND_PLAN_OPTIONS: FeesSelectOption<'single' | 'couple'>[] = [
  { value: 'single', label: 'Single' },
  { value: 'couple', label: 'Couple' },
];

export default function NewZealandFeesEditor() {
  const [feeCategory, setFeeCategory] = useState<NzFeeCategory>('INSURANCE');
  const [plan, setPlan] = useState<'single' | 'couple'>('single');
  const { feesDoc, loading, error, user, refreshFees } = useFeesEditorState(fetchNewZealandFees);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <FeesEditorAlerts error={error} isAuthenticated={!!user} />

      <div className="flex flex-wrap gap-x-8 gap-y-6 my-4 items-end">
        <FeesEditorSelect
          label="Fee to be Updated"
          value={feeCategory}
          options={NEW_ZEALAND_FEE_OPTIONS}
          onValueChange={setFeeCategory}
          disabled={!user}
        />
        <FeesEditorSelect
          label="Plan Type"
          value={plan}
          options={NEW_ZEALAND_PLAN_OPTIONS}
          onValueChange={setPlan}
          disabled={!user || feeCategory !== 'INSURANCE'}
          triggerClassName="w-[160px]"
        />
      </div>

      <div className="mt-6">
        {feeCategory === 'INSURANCE' && (
          <NzInsuranceEditor
            feesDoc={feesDoc}
            plan={plan}
            onRefresh={refreshFees}
            disabled={!user}
          />
        )}
        {feeCategory === 'VISA' && (
          <NzVisaEditor feesDoc={feesDoc} onRefresh={refreshFees} disabled={!user} />
        )}
        {feeCategory === 'MEDICAL' && (
          <NzMedicalEditor feesDoc={feesDoc} onRefresh={refreshFees} disabled={!user} />
        )}
        {feeCategory === 'ENGLISH' && (
          <NzEnglishEditor feesDoc={feesDoc} onRefresh={refreshFees} disabled={!user} />
        )}
        {feeCategory === 'ASSISTANCE' && (
          <NzAssistanceEditor feesDoc={feesDoc} onRefresh={refreshFees} disabled={!user} />
        )}
        {feeCategory === 'EOF' && (
          <NzEvidenceEditor feesDoc={feesDoc} onRefresh={refreshFees} disabled={!user} />
        )}
      </div>
    </div>
  );
}
