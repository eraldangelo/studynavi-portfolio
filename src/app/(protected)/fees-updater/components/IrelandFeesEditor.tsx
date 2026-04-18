'use client';
import { useState } from 'react';
import FeeCard from './ui/FeeCard';
import { useEditableObject } from './hooks/useEditable';
import EditActionButtons from './ui/edit-action-buttons';
import { fetchIrelandFees, updateIrelandFeesEUR, updateIrelandEnglishTestFees, updateIrelandEvidenceOfFunds } from '@/services/fees/firestore-fees';
import { useFeesEditorState } from './hooks/use-fees-editor-state';
import FeesEditorAlerts from './ui/fees-editor-alerts';
import FeesEditorSelect, { type FeesSelectOption } from './ui/fees-editor-select';

type IrelandFeeCategory = 'INSURANCE' | 'VISA' | 'ENGLISH' | 'EOF';
const IRELAND_FEE_OPTIONS: FeesSelectOption<IrelandFeeCategory>[] = [
  { value: 'INSURANCE', label: 'Insurance' },
  { value: 'VISA', label: 'Visa Fee' },
  { value: 'ENGLISH', label: 'English Test Fee' },
  { value: 'EOF', label: 'Evidence of Funds' },
];

export default function IrelandFeesEditor() {
  const [feeCategory, setFeeCategory] = useState<IrelandFeeCategory>('INSURANCE');
  const { feesDoc, loading, error, user, refreshFees } = useFeesEditorState(fetchIrelandFees);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <FeesEditorAlerts error={error} isAuthenticated={!!user} />

      <div className="flex flex-wrap gap-x-8 gap-y-6 my-4 items-end">
        <FeesEditorSelect
          label="Fee to be Updated"
          value={feeCategory}
          options={IRELAND_FEE_OPTIONS}
          onValueChange={setFeeCategory}
          disabled={!user}
        />
      </div>

      <div className="mt-6">
        {feeCategory === 'INSURANCE' && (
          <InsuranceEditor feesDoc={feesDoc} onRefresh={refreshFees} disabled={!user} />
        )}
        {feeCategory === 'VISA' && <VisaEditor feesDoc={feesDoc} onRefresh={refreshFees} disabled={!user} />}
        {feeCategory === 'ENGLISH' && (
          <EnglishEditor feesDoc={feesDoc} onRefresh={refreshFees} disabled={!user} />
        )}
        {feeCategory === 'EOF' && (
          <EvidenceEditor feesDoc={feesDoc} onRefresh={refreshFees} disabled={!user} />
        )}
      </div>
    </div>
  );
}
function InsuranceEditor({ feesDoc, onRefresh, disabled }: any) {
  const source = (feesDoc && feesDoc.irelandFeesEUR) || {};
  const { persisted, draft, isEditing, startEdit, cancelEdit, setDraftValue, setPersisted } = useEditableObject({
    studentInsurancePerYear: source.studentInsurancePerYear ?? 160,
    protectionOfEnrolledLearnersFee: source.protectionOfEnrolledLearnersFee ?? 437.5,
  });

  const save = async () => {
    await updateIrelandFeesEUR({
      studentInsurancePerYear: draft.studentInsurancePerYear,
      visaFeeSingleEntry: source.visaFeeSingleEntry ?? 60,
      visaFeeMultipleEntry: source.visaFeeMultipleEntry ?? 100,
      protectionOfEnrolledLearnersFee: draft.protectionOfEnrolledLearnersFee,
    });
    setPersisted(draft);
    await onRefresh();
    alert('Student insurance & PEL saved');
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeeCard title="Student Insurance" subtitle={<span>(per year)</span>} value={draft.studentInsurancePerYear} editing={isEditing} onChange={(v:any)=>setDraftValue('studentInsurancePerYear' as any,v)} currencyLabel="EUR" />
        <FeeCard title="Protection of Enrolled Learners" subtitle={<span>(PEL)</span>} value={draft.protectionOfEnrolledLearnersFee} editing={isEditing} onChange={(v:any)=>setDraftValue('protectionOfEnrolledLearnersFee' as any,v)} currencyLabel="EUR" />
      </div>
      <EditActionButtons isEditing={isEditing} onSave={save} onCancel={cancelEdit} onStartEdit={startEdit} />
    </div>
  );
}

function VisaEditor({ feesDoc, onRefresh, disabled }: any) {
  const source = (feesDoc && feesDoc.irelandFeesEUR) || {};
  const { persisted, draft, isEditing, startEdit, cancelEdit, setDraftValue, setPersisted } = useEditableObject({
    visaFeeSingleEntry: source.visaFeeSingleEntry ?? 60,
    visaFeeMultipleEntry: source.visaFeeMultipleEntry ?? 100,
  });

  const save = async () => {
    await updateIrelandFeesEUR({
      studentInsurancePerYear: source.studentInsurancePerYear ?? 160,
      visaFeeSingleEntry: draft.visaFeeSingleEntry,
      visaFeeMultipleEntry: draft.visaFeeMultipleEntry,
      protectionOfEnrolledLearnersFee: source.protectionOfEnrolledLearnersFee ?? 437.5,
    });
    setPersisted(draft);
    await onRefresh();
    alert('Visa fees saved');
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeeCard title="Student Visa Fee" subtitle={<span>(Single Entry)</span>} value={draft.visaFeeSingleEntry} editing={isEditing} onChange={(v:any)=>setDraftValue('visaFeeSingleEntry' as any,v)} currencyLabel="EUR" />
        <FeeCard title="Student Visa Fee" subtitle={<span>(Multiple Entry)</span>} value={draft.visaFeeMultipleEntry} editing={isEditing} onChange={(v:any)=>setDraftValue('visaFeeMultipleEntry' as any,v)} currencyLabel="EUR" />
      </div>
      <EditActionButtons isEditing={isEditing} onSave={save} onCancel={cancelEdit} onStartEdit={startEdit} />
    </div>
  );
}

function EnglishEditor({ feesDoc, onRefresh, disabled }: any) {
  const source = (feesDoc && feesDoc.englishTestFees) || {};
  const { persisted, draft, isEditing, startEdit, cancelEdit, setDraftValue, setPersisted } = useEditableObject({
    ieltsFeePHP: source.ieltsFeePHP ?? 14000,
    duolingoFeeUSD: source.duolingoFeeUSD ?? 70,
  });

  const save = async () => {
    await updateIrelandEnglishTestFees({
      ieltsFeePHP: draft.ieltsFeePHP,
      duolingoFeeUSD: draft.duolingoFeeUSD,
    });
    setPersisted(draft);
    await onRefresh();
    alert('English test fees saved');
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeeCard title="IELTS Fee" value={draft.ieltsFeePHP} editing={isEditing} onChange={(v:any)=>setDraftValue('ieltsFeePHP' as any,v)} currencyLabel="PHP" />
        <FeeCard title="Duolingo Fee" value={draft.duolingoFeeUSD} editing={isEditing} onChange={(v:any)=>setDraftValue('duolingoFeeUSD' as any,v)} currencyLabel="USD" />
      </div>
      <EditActionButtons isEditing={isEditing} onSave={save} onCancel={cancelEdit} onStartEdit={startEdit} />
    </div>
  );
}

function EvidenceEditor({ feesDoc, onRefresh, disabled }: any) {
  const source = (feesDoc && feesDoc.evidenceOfFundsEUR) || {};
  const { persisted, draft, isEditing, startEdit, cancelEdit, setDraftValue, setPersisted } = useEditableObject({
    costOfLiving: source.costOfLiving ?? 12000,
  });

  const save = async () => {
    await updateIrelandEvidenceOfFunds({ costOfLiving: draft.costOfLiving });
    setPersisted(draft);
    await onRefresh();
    alert('Evidence of funds saved');
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeeCard title="Cost of Living: Student" subtitle={<span>(per year)</span>} value={draft.costOfLiving} editing={isEditing} onChange={(v:any)=>setDraftValue('costOfLiving' as any,v)} currencyLabel="EUR" />
      </div>
      <EditActionButtons isEditing={isEditing} onSave={save} onCancel={cancelEdit} onStartEdit={startEdit} />
    </div>
  );
}
