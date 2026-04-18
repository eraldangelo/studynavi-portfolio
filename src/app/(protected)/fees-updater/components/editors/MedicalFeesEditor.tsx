'use client';
import FeeCard from '../ui/FeeCard';
import { Button } from '@/components/ui/forms/button';
import { Check, X, Pencil } from 'lucide-react';
import { useEditableObject } from '../hooks/useEditable';
import { updateAustraliaMedicalExamFees } from '@/services/fees/firestore-fees';

type Props = { feesDoc: any; onRefresh: () => Promise<void>; disabled?: boolean };

export default function MedicalFeesEditor({ feesDoc, onRefresh, disabled }: Props) {
  const source = (feesDoc && feesDoc.medicalExamFeesPHP) || {};
  const { persisted, draft, isEditing, startEdit, cancelEdit, setDraftValue, setPersisted } = useEditableObject({
    medicalExamFee: source.medicalExamFee ?? 7680,
    medicalExamFeeWithTB: source.medicalExamFeeWithTB ?? 15000,
    dependentMedicalExamFee: source.dependentMedicalExamFee ?? 7680,
  });

  const handleSave = async () => {
    await updateAustraliaMedicalExamFees(draft as any);
    setPersisted(draft as any);
    await onRefresh();
    alert('Medical exam fees saved successfully!');
  };

  return (
    <div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeeCard title="Medical Exam Fee" subtitle={<span>(Standard)</span>} value={draft.medicalExamFee} editing={isEditing} onChange={(v) => setDraftValue('medicalExamFee' as any, v)} currencyLabel="PHP" />
        <FeeCard title="Medical Exam Fee" subtitle={<span>(With TB Test)</span>} value={draft.medicalExamFeeWithTB} editing={isEditing} onChange={(v) => setDraftValue('medicalExamFeeWithTB' as any, v)} currencyLabel="PHP" />
        <FeeCard title="Dependent Medical Exam Fee" subtitle="(per dependent)" value={draft.dependentMedicalExamFee} editing={isEditing} onChange={(v) => setDraftValue('dependentMedicalExamFee' as any, v)} currencyLabel="PHP" />
      </div>

      <div className="mt-8 flex gap-2">
        {isEditing ? (
          <>
            <Button
              onClick={handleSave}
              size="icon"
              className="rounded-full"
              aria-label="Save fees value"
              data-testid="fees-save-button"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => {
                cancelEdit();
              }}
              size="icon"
              variant="outline"
              className="rounded-full"
              aria-label="Cancel fee edit"
              data-testid="fees-cancel-button"
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button
            onClick={() => {
              startEdit();
            }}
            size="icon"
            variant="outline"
            className="rounded-full"
            aria-label="Edit fees value"
            data-testid="fees-edit-button"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
