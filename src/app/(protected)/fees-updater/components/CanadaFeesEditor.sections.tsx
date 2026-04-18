'use client';

import FeeCard from './ui/FeeCard';
import EditActionButtons from './ui/edit-action-buttons';
import { useEditableObject, useEditableMap } from './hooks/useEditable';
import {
  updateCanadaVisaAndBiometrics,
  updateCanadaMedicalFees,
  updateCanadaEnglishTestFees,
  updateCanadaAssistanceFees,
  updateCanadaEvidenceOfFunds,
} from '@/services/fees/firestore-fees';

const EMPTY_MAP: Record<string, number> = {};

type SectionProps = {
  feesDoc: any;
  onRefresh: () => Promise<void>;
  disabled: boolean;
};

export function VisaEditor({ feesDoc, onRefresh }: SectionProps) {
  const source = (feesDoc && feesDoc.canadaVisaAndBiometricsCAD) || EMPTY_MAP;
  const { draft, isEditing, startEdit, cancelEdit, setDraftValue, setPersisted } = useEditableObject({
    studentVisaFee: source.studentVisaFee ?? 150,
    dependentVisaFeeSpouseOWP: source.dependentVisaFeeSpouseOWP ?? 255,
    dependentVisaFeeVisitorChild0to4: source.dependentVisaFeeVisitorChild0to4 ?? 100,
    dependentStudyPermitFeeChild5Plus: source.dependentStudyPermitFeeChild5Plus ?? 150,
  });

  const save = async () => {
    await updateCanadaVisaAndBiometrics({
      ...(source || {}),
      studentVisaFee: draft.studentVisaFee,
      dependentVisaFeeSpouseOWP: draft.dependentVisaFeeSpouseOWP,
      dependentVisaFeeVisitorChild0to4: draft.dependentVisaFeeVisitorChild0to4,
      dependentStudyPermitFeeChild5Plus: draft.dependentStudyPermitFeeChild5Plus,
    } as any);
    setPersisted(draft);
    await onRefresh();
    alert('Visa fees saved');
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeeCard title="Student Visa Fee" value={draft.studentVisaFee} editing={isEditing} onChange={(v: any) => setDraftValue('studentVisaFee' as any, v)} currencyLabel="CAD" />
        <FeeCard title="Dependent Visa Fee" subtitle={<span>(Spouse w/ OWP)</span>} value={draft.dependentVisaFeeSpouseOWP} editing={isEditing} onChange={(v: any) => setDraftValue('dependentVisaFeeSpouseOWP' as any, v)} currencyLabel="CAD" />
        <FeeCard title="Dependent Visa Fee" subtitle={<span>(Visitor 0-4)</span>} value={draft.dependentVisaFeeVisitorChild0to4} editing={isEditing} onChange={(v: any) => setDraftValue('dependentVisaFeeVisitorChild0to4' as any, v)} currencyLabel="CAD" />
        <FeeCard title="Dependent Study Permit Fee" subtitle={<span>(Child 5+)</span>} value={draft.dependentStudyPermitFeeChild5Plus} editing={isEditing} onChange={(v: any) => setDraftValue('dependentStudyPermitFeeChild5Plus' as any, v)} currencyLabel="CAD" />
      </div>
      <EditActionButtons isEditing={isEditing} onSave={save} onCancel={cancelEdit} onStartEdit={startEdit} />

    </div>
  );
}

export function BiometricsEditor({ feesDoc, onRefresh }: SectionProps) {
  const source = (feesDoc && feesDoc.canadaVisaAndBiometricsCAD) || EMPTY_MAP;
  const { draft, isEditing, startEdit, cancelEdit, setDraftValue, setPersisted } = useEditableObject({
    biometricsSolo: source.biometricsSolo ?? 85,
    biometricsFamily: source.biometricsFamily ?? 170,
  });

  const save = async () => {
    await updateCanadaVisaAndBiometrics({
      ...(source || {}),
      biometricsSolo: draft.biometricsSolo,
      biometricsFamily: draft.biometricsFamily,
    } as any);
    setPersisted(draft);
    await onRefresh();
    alert('Biometrics fees saved');
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeeCard title="Biometrics Fee" subtitle={<span>(Solo)</span>} value={draft.biometricsSolo} editing={isEditing} onChange={(v: any) => setDraftValue('biometricsSolo' as any, v)} currencyLabel="CAD" />
        <FeeCard title="Biometrics Fee" subtitle={<span>(Family)</span>} value={draft.biometricsFamily} editing={isEditing} onChange={(v: any) => setDraftValue('biometricsFamily' as any, v)} currencyLabel="CAD" />
      </div>
      <EditActionButtons isEditing={isEditing} onSave={save} onCancel={cancelEdit} onStartEdit={startEdit} />

    </div>
  );
}

export function MedicalEditor({ feesDoc, onRefresh }: SectionProps) {
  const source = (feesDoc && feesDoc.canadaMedicalExamFeesPHP) || EMPTY_MAP;
  const { draft, isEditing, startEdit, cancelEdit, setDraftValue, setPersisted } = useEditableObject({
    studentMedicalExamFee: source.studentMedicalExamFee ?? 13270,
    spouseMedicalExamFee: source.spouseMedicalExamFee ?? 13270,
    childMedical0to4: source.childMedical0to4 ?? 3220,
    childMedical5to10: source.childMedical5to10 ?? 4140,
    childMedical11to14: source.childMedical11to14 ?? 6100,
    childMedical15plus: source.childMedical15plus ?? 13270,
  });

  const save = async () => {
    await updateCanadaMedicalFees({
      studentMedicalExamFee: draft.studentMedicalExamFee,
      spouseMedicalExamFee: draft.spouseMedicalExamFee,
      childMedical0to4: draft.childMedical0to4,
      childMedical5to10: draft.childMedical5to10,
      childMedical11to14: draft.childMedical11to14,
      childMedical15plus: draft.childMedical15plus,
    });
    setPersisted(draft);
    await onRefresh();
    alert('Medical exam fees saved');
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeeCard title="Student Medical Exam Fee" value={draft.studentMedicalExamFee} editing={isEditing} onChange={(v: any) => setDraftValue('studentMedicalExamFee' as any, v)} currencyLabel="PHP" />
        <FeeCard title="Spouse Medical Exam Fee" value={draft.spouseMedicalExamFee} editing={isEditing} onChange={(v: any) => setDraftValue('spouseMedicalExamFee' as any, v)} currencyLabel="PHP" />
        <FeeCard title="Child Medical (0-4)" subtitle={<span>(per child)</span>} value={draft.childMedical0to4} editing={isEditing} onChange={(v: any) => setDraftValue('childMedical0to4' as any, v)} currencyLabel="PHP" />
        <FeeCard title="Child Medical (5-10)" subtitle={<span>(per child)</span>} value={draft.childMedical5to10} editing={isEditing} onChange={(v: any) => setDraftValue('childMedical5to10' as any, v)} currencyLabel="PHP" />
        <FeeCard title="Child Medical (11-14)" subtitle={<span>(per child)</span>} value={draft.childMedical11to14} editing={isEditing} onChange={(v: any) => setDraftValue('childMedical11to14' as any, v)} currencyLabel="PHP" />
        <FeeCard title="Child Medical (15+)" subtitle={<span>(per child)</span>} value={draft.childMedical15plus} editing={isEditing} onChange={(v: any) => setDraftValue('childMedical15plus' as any, v)} currencyLabel="PHP" />
      </div>
      <EditActionButtons isEditing={isEditing} onSave={save} onCancel={cancelEdit} onStartEdit={startEdit} />

    </div>
  );
}

export function EnglishEditor({ feesDoc, onRefresh }: SectionProps) {
  const source = (feesDoc && feesDoc.canadaEnglishTestFeesPHP) || EMPTY_MAP;
  const { draft, isEditing, startEdit, cancelEdit, setDraftValue, setPersisted } = useEditableObject({
    ieltsFee: source.ieltsFee ?? 14000,
  });

  const save = async () => {
    await updateCanadaEnglishTestFees({ ieltsFee: draft.ieltsFee });
    setPersisted(draft);
    await onRefresh();
    alert('English test fees saved');
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeeCard title="IELTS Fee" value={draft.ieltsFee} editing={isEditing} onChange={(v: any) => setDraftValue('ieltsFee' as any, v)} currencyLabel="PHP" />
      </div>
      <EditActionButtons isEditing={isEditing} onSave={save} onCancel={cancelEdit} onStartEdit={startEdit} />

    </div>
  );
}

export function AssistanceEditor({ feesDoc, onRefresh }: SectionProps) {
  const source = (feesDoc && feesDoc.canadaAssistanceFeesPHP) || EMPTY_MAP;
  const { draft, isEditing, startEdit, cancelEdit, setDraftValue, setPersisted } = useEditableObject({
    perDependent: source.perDependent ?? 15000,
    perDependentSubsequentEntry: source.perDependentSubsequentEntry ?? 25000,
  });

  const save = async () => {
    await updateCanadaAssistanceFees({
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
        <FeeCard title="Assistance Fee (per dependent)" value={draft.perDependent} editing={isEditing} onChange={(v: any) => setDraftValue('perDependent' as any, v)} currencyLabel="PHP" />
        <FeeCard title="Assistance Fee (Subsequent Entry)" value={draft.perDependentSubsequentEntry} editing={isEditing} onChange={(v: any) => setDraftValue('perDependentSubsequentEntry' as any, v)} currencyLabel="PHP" />
      </div>
      <EditActionButtons isEditing={isEditing} onSave={save} onCancel={cancelEdit} onStartEdit={startEdit} />

    </div>
  );
}

export function EvidenceEditor({ feesDoc, onRefresh }: SectionProps) {
  const source = (feesDoc && feesDoc.canadaEvidenceOfFundsCAD) || { costOfLivingTier: {} };
  const tierKeys = ['1', '2', '3', '4', '5', '6', '7'];
  const tierEditable = useEditableMap(tierKeys, source.costOfLivingTier || ({} as Record<string, number>));
  const { draft, isEditing, startEdit, cancelEdit, setDraftValue, setPersisted } = useEditableObject({
    additionalMemberCost: source.additionalMemberCost ?? 5559,
    airfarePerPerson: source.airfarePerPerson ?? 2000,
  });

  const save = async () => {
    await updateCanadaEvidenceOfFunds({
      costOfLivingTier: tierEditable.draft,
      additionalMemberCost: draft.additionalMemberCost,
      airfarePerPerson: draft.airfarePerPerson,
    });
    tierEditable.setPersisted(tierEditable.draft as any);
    setPersisted(draft);
    await onRefresh();
    alert('Evidence of funds saved');
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tierKeys.map((key) => (
          <FeeCard key={key} title={`Cost of Living Tier ${key}`} value={tierEditable.draft[key]} editing={isEditing || tierEditable.isEditing} onChange={(v: any) => tierEditable.setDraftValue(key as any, v)} currencyLabel="CAD" />
        ))}
        <FeeCard title="Additional Member Cost" subtitle={<span>(for {'>'}7 members)</span>} value={draft.additionalMemberCost} editing={isEditing} onChange={(v: any) => setDraftValue('additionalMemberCost' as any, v)} currencyLabel="CAD" />
        <FeeCard title="Airfare" subtitle={<span>(per person)</span>} value={draft.airfarePerPerson} editing={isEditing} onChange={(v: any) => setDraftValue('airfarePerPerson' as any, v)} currencyLabel="CAD" />
      </div>
      <EditActionButtons
        isEditing={isEditing || tierEditable.isEditing}
        onSave={save}
        onCancel={() => { cancelEdit(); tierEditable.cancelEdit(); }}
        onStartEdit={() => { startEdit(); tierEditable.startEdit(); }}
      />
    </div>
  );
}

