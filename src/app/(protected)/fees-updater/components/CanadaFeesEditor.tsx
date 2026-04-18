'use client';

import { useState } from 'react';
import { fetchCanadaFees } from '@/services/fees/firestore-fees';
import {
  AssistanceEditor,
  BiometricsEditor,
  EnglishEditor,
  EvidenceEditor,
  MedicalEditor,
  VisaEditor,
} from './CanadaFeesEditor.sections';
import { useFeesEditorState } from './hooks/use-fees-editor-state';
import FeesEditorAlerts from './ui/fees-editor-alerts';
import FeesEditorSelect, { type FeesSelectOption } from './ui/fees-editor-select';

type CanadaFeeCategory = 'VISA' | 'BIOMETRICS' | 'MEDICAL' | 'ENGLISH' | 'ASSISTANCE' | 'EOF';
const CANADA_FEE_OPTIONS: FeesSelectOption<CanadaFeeCategory>[] = [
  { value: 'VISA', label: 'Visa Fee' },
  { value: 'BIOMETRICS', label: 'Biometrics' },
  { value: 'MEDICAL', label: 'Medical Exam Fee' },
  { value: 'ENGLISH', label: 'English Test Fee' },
  { value: 'ASSISTANCE', label: 'Agency Assistance Fee' },
  { value: 'EOF', label: 'Evidence of Funds' },
];

export default function CanadaFeesEditor() {
  const [feeCategory, setFeeCategory] = useState<CanadaFeeCategory>('VISA');
  const { feesDoc, loading, error, user, refreshFees } = useFeesEditorState(fetchCanadaFees);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <FeesEditorAlerts error={error} isAuthenticated={!!user} />

      <div className="flex flex-wrap gap-x-8 gap-y-6 my-4 items-end">
        <FeesEditorSelect
          label="Fee to be Updated"
          value={feeCategory}
          options={CANADA_FEE_OPTIONS}
          onValueChange={setFeeCategory}
          disabled={!user}
        />
      </div>

      <div className="mt-6">
        {feeCategory === 'VISA' && <VisaEditor feesDoc={feesDoc} onRefresh={refreshFees} disabled={!user} />}
        {feeCategory === 'BIOMETRICS' && (
          <BiometricsEditor feesDoc={feesDoc} onRefresh={refreshFees} disabled={!user} />
        )}
        {feeCategory === 'MEDICAL' && (
          <MedicalEditor feesDoc={feesDoc} onRefresh={refreshFees} disabled={!user} />
        )}
        {feeCategory === 'ENGLISH' && (
          <EnglishEditor feesDoc={feesDoc} onRefresh={refreshFees} disabled={!user} />
        )}
        {feeCategory === 'ASSISTANCE' && (
          <AssistanceEditor feesDoc={feesDoc} onRefresh={refreshFees} disabled={!user} />
        )}
        {feeCategory === 'EOF' && (
          <EvidenceEditor feesDoc={feesDoc} onRefresh={refreshFees} disabled={!user} />
        )}
      </div>
    </div>
  );
}
