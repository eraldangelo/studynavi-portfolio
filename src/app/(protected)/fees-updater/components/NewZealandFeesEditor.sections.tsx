'use client';

import FeeCard from './ui/FeeCard';
import EditActionButtons from './ui/edit-action-buttons';
import { useEditableObject, useEditableMap } from './hooks/useEditable';
import { DURATION_KEYS } from '@/services/fees/firestore-fees';
import {
  updateNzAssistanceFees,
  updateNzEnglishTestFee,
  updateNzEvidenceOfFunds,
  updateNzInsurance,
  updateNzMedicalFees,
  updateNzVisaFees,
} from '@/services/fees/firestore-fees';

type SectionProps = {
  feesDoc: any;
  onRefresh: () => Promise<void>;
  disabled: boolean;
};

export function NzInsuranceEditor({
  feesDoc,
  plan,
  onRefresh,
}: SectionProps & { plan: 'single' | 'couple' }) {
  const source = (feesDoc && feesDoc.nzInsuranceNZD) || { single: {}, couple: {} };
  const single = useEditableMap(DURATION_KEYS as any, source.single || {});
  const couple = useEditableMap(DURATION_KEYS as any, source.couple || {});
  const isEditing = single.isEditing || couple.isEditing;

  const save = async () => {
    await updateNzInsurance({ single: single.draft as any, couple: couple.draft as any });
    single.setPersisted(single.draft);
    couple.setPersisted(couple.draft);
    await onRefresh();
    alert('Insurance saved');
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from(DURATION_KEYS).map((duration) => (
          <FeeCard
            key={duration}
            title={`${duration} year`}
            value={(plan === 'single' ? single.draft[duration] : couple.draft[duration]) ?? 0}
            editing={isEditing}
            onChange={(value: any) => {
              if (plan === 'single') single.setDraftValue(duration as any, value);
              else couple.setDraftValue(duration as any, value);
            }}
            currencyLabel="NZD"
          />
        ))}
      </div>

      <EditActionButtons
        isEditing={isEditing}
        onSave={save}
        onCancel={() => { single.cancelEdit(); couple.cancelEdit(); }}
        onStartEdit={() => { single.startEdit(); couple.startEdit(); }}
      />
    </div>
  );
}

export function NzVisaEditor({ feesDoc, onRefresh }: SectionProps) {
  const source = (feesDoc && feesDoc.nzVisaFeesNZD) || {};
  const { draft, isEditing, startEdit, cancelEdit, setDraftValue, setPersisted } = useEditableObject({
    studentVisaFee: source.studentVisaFee ?? 850,
    pathwayStudentVisaFee: source.pathwayStudentVisaFee ?? 750,
    dependentVisaFeeSpouse18Plus: source.dependentVisaFeeSpouse18Plus ?? 1630,
    dependentVisaFeeSchoolAge: source.dependentVisaFeeSchoolAge ?? 750,
    dependentVisaFeeNonSchoolAge: source.dependentVisaFeeNonSchoolAge ?? 341,
  });

  const save = async () => {
    await updateNzVisaFees({
      studentVisaFee: draft.studentVisaFee,
      pathwayStudentVisaFee: draft.pathwayStudentVisaFee,
      dependentVisaFeeSpouse18Plus: draft.dependentVisaFeeSpouse18Plus,
      dependentVisaFeeSchoolAge: draft.dependentVisaFeeSchoolAge,
      dependentVisaFeeNonSchoolAge: draft.dependentVisaFeeNonSchoolAge,
    });
    setPersisted(draft);
    await onRefresh();
    alert('Visa fees saved');
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeeCard title="Student Visa Fee" value={draft.studentVisaFee} editing={isEditing} onChange={(v: any) => setDraftValue('studentVisaFee' as any, v)} currencyLabel="NZD" />
        <FeeCard title="Student Visa Fee" subtitle={<span>(Pathway)</span>} value={draft.pathwayStudentVisaFee} editing={isEditing} onChange={(v: any) => setDraftValue('pathwayStudentVisaFee' as any, v)} currencyLabel="NZD" />
        <FeeCard title="Dependent Visa Fee" subtitle={<span>(Spouse / 18+)</span>} value={draft.dependentVisaFeeSpouse18Plus} editing={isEditing} onChange={(v: any) => setDraftValue('dependentVisaFeeSpouse18Plus' as any, v)} currencyLabel="NZD" />
        <FeeCard title="Dependent Visa Fee" subtitle={<span>(Child / School Age)</span>} value={draft.dependentVisaFeeSchoolAge} editing={isEditing} onChange={(v: any) => setDraftValue('dependentVisaFeeSchoolAge' as any, v)} currencyLabel="NZD" />
        <FeeCard title="Dependent Visa Fee" subtitle={<span>(Child / Non-School Age)</span>} value={draft.dependentVisaFeeNonSchoolAge} editing={isEditing} onChange={(v: any) => setDraftValue('dependentVisaFeeNonSchoolAge' as any, v)} currencyLabel="NZD" />
      </div>
      <EditActionButtons isEditing={isEditing} onSave={save} onCancel={cancelEdit} onStartEdit={startEdit} />

    </div>
  );
}

export function NzMedicalEditor({ feesDoc, onRefresh }: SectionProps) {
  const source = (feesDoc && feesDoc.nzMedicalExamFeesPHP) || {};
  const { draft, isEditing, startEdit, cancelEdit, setDraftValue, setPersisted } = useEditableObject({
    medicalExamFee: source.medicalExamFee ?? 14550,
    dependentMedicalExamFeePerDependent: source.dependentMedicalExamFeePerDependent ?? 14550,
  });

  const save = async () => {
    await updateNzMedicalFees({
      medicalExamFee: draft.medicalExamFee,
      dependentMedicalExamFeePerDependent: draft.dependentMedicalExamFeePerDependent,
    });
    setPersisted(draft);
    await onRefresh();
    alert('Medical exam fees saved');
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeeCard title="Medical Exam Fee" value={draft.medicalExamFee} editing={isEditing} onChange={(v: any) => setDraftValue('medicalExamFee' as any, v)} currencyLabel="PHP" />
        <FeeCard title="Dependent Medical Exam Fee" subtitle={<span>(per dependent)</span>} value={draft.dependentMedicalExamFeePerDependent} editing={isEditing} onChange={(v: any) => setDraftValue('dependentMedicalExamFeePerDependent' as any, v)} currencyLabel="PHP" />
      </div>
      <EditActionButtons isEditing={isEditing} onSave={save} onCancel={cancelEdit} onStartEdit={startEdit} />

    </div>
  );
}

export function NzEnglishEditor({ feesDoc, onRefresh }: SectionProps) {
  const source = (feesDoc && feesDoc.nzEnglishTestFeesPHP) || {};
  const { draft, isEditing, startEdit, cancelEdit, setDraftValue, setPersisted } = useEditableObject({
    englishTestFee: source.englishTestFee ?? 14000,
  });

  const save = async () => {
    await updateNzEnglishTestFee({ englishTestFee: draft.englishTestFee });
    setPersisted(draft);
    await onRefresh();
    alert('English test fees saved');
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeeCard title="English Test Fee" value={draft.englishTestFee} editing={isEditing} onChange={(v: any) => setDraftValue('englishTestFee' as any, v)} currencyLabel="PHP" />
      </div>
      <EditActionButtons isEditing={isEditing} onSave={save} onCancel={cancelEdit} onStartEdit={startEdit} />

    </div>
  );
}

export function NzAssistanceEditor({ feesDoc, onRefresh }: SectionProps) {
  const source = (feesDoc && feesDoc.nzAssistanceFeesPHP) || {};
  const { draft, isEditing, startEdit, cancelEdit, setDraftValue, setPersisted } = useEditableObject({
    perDependent: source.perDependent ?? 15000,
    perDependentSubsequentEntry: source.perDependentSubsequentEntry ?? 25000,
  });

  const save = async () => {
    await updateNzAssistanceFees({
      perDependent: draft.perDependent,
      perDependentSubsequentEntry: draft.perDependentSubsequentEntry,
    });
    setPersisted(draft);
    await onRefresh();
    alert('Assistance fees saved');
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeeCard title="Agency Assistance Fee" subtitle={<span>(per dependent)</span>} value={draft.perDependent} editing={isEditing} onChange={(v: any) => setDraftValue('perDependent' as any, v)} currencyLabel="PHP" />
        <FeeCard title="Agency Assistance Fee" subtitle={<span>(Subsequent Entry)</span>} value={draft.perDependentSubsequentEntry} editing={isEditing} onChange={(v: any) => setDraftValue('perDependentSubsequentEntry' as any, v)} currencyLabel="PHP" />
      </div>
      <EditActionButtons isEditing={isEditing} onSave={save} onCancel={cancelEdit} onStartEdit={startEdit} />

    </div>
  );
}

export function NzEvidenceEditor({ feesDoc, onRefresh }: SectionProps) {
  const source = (feesDoc && feesDoc.nzEvidenceOfFundsNZD) || {};
  const { draft, isEditing, startEdit, cancelEdit, setDraftValue, setPersisted } = useEditableObject({
    studentCostOfLivingPerYear: source.studentCostOfLivingPerYear ?? 20000,
    partnerCostOfLivingPerYear: source.partnerCostOfLivingPerYear ?? 4200,
    childSchoolAgeCostPerYear: source.childSchoolAgeCostPerYear ?? 17000,
    childNonSchoolAgeCostPerYear: source.childNonSchoolAgeCostPerYear ?? 4200,
    airfarePerPerson: source.airfarePerPerson ?? 2500,
  });

  const save = async () => {
    await updateNzEvidenceOfFunds({
      studentCostOfLivingPerYear: draft.studentCostOfLivingPerYear,
      partnerCostOfLivingPerYear: draft.partnerCostOfLivingPerYear,
      childSchoolAgeCostPerYear: draft.childSchoolAgeCostPerYear,
      childNonSchoolAgeCostPerYear: draft.childNonSchoolAgeCostPerYear,
      airfarePerPerson: draft.airfarePerPerson,
    });
    setPersisted(draft);
    await onRefresh();
    alert('Evidence of funds saved');
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeeCard title="Cost of Living: Student" subtitle={<span>(per year)</span>} value={draft.studentCostOfLivingPerYear} editing={isEditing} onChange={(v: any) => setDraftValue('studentCostOfLivingPerYear' as any, v)} currencyLabel="NZD" />
        <FeeCard title="Cost of Living: Partner/Spouse" subtitle={<span>(per year)</span>} value={draft.partnerCostOfLivingPerYear} editing={isEditing} onChange={(v: any) => setDraftValue('partnerCostOfLivingPerYear' as any, v)} currencyLabel="NZD" />
        <FeeCard title="Cost of Living: Child (School Age)" subtitle={<span>(per year)</span>} value={draft.childSchoolAgeCostPerYear} editing={isEditing} onChange={(v: any) => setDraftValue('childSchoolAgeCostPerYear' as any, v)} currencyLabel="NZD" />
        <FeeCard title="Cost of Living: Child (Non-School Age)" subtitle={<span>(per year)</span>} value={draft.childNonSchoolAgeCostPerYear} editing={isEditing} onChange={(v: any) => setDraftValue('childNonSchoolAgeCostPerYear' as any, v)} currencyLabel="NZD" />
        <FeeCard title="Airfare" subtitle={<span>(per person)</span>} value={draft.airfarePerPerson} editing={isEditing} onChange={(v: any) => setDraftValue('airfarePerPerson' as any, v)} currencyLabel="NZD" />
      </div>
      <EditActionButtons isEditing={isEditing} onSave={save} onCancel={cancelEdit} onStartEdit={startEdit} />

    </div>
  );
}
