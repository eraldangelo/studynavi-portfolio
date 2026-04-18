'use client';
import { Label } from '@/components/ui/forms/label';
import FeeCard from '../ui/FeeCard';
import { Button } from '@/components/ui/forms/button';
import { Check, X, Pencil } from 'lucide-react';
import { useEditableObject } from '../hooks/useEditable';
import { updateAustraliaVisaFees } from '@/services/fees/firestore-fees';

type Props = { feesDoc: any; onRefresh: () => Promise<void>; disabled?: boolean };

export default function VisaFeesEditor({ feesDoc, onRefresh, disabled }: Props) {
  const source = (feesDoc && feesDoc.visaFeesAUD) || {}
  const { persisted, draft, isEditing, startEdit, cancelEdit, setDraftValue, setPersisted } = useEditableObject({
    studentVisaFee: source.studentVisaFee ?? 2000,
    dependentVisaFeeSpouse18Plus: source.dependentVisaFeeSpouse18Plus ?? 1225,
    dependentVisaFeeChildUnder18: source.dependentVisaFeeChildUnder18 ?? 400,
  });

  const handleSave = async () => {
    await updateAustraliaVisaFees(draft as any);
    setPersisted(draft as any);
    await onRefresh();
    alert('Visa fees saved successfully!');
  };

  return (
    <div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeeCard title="Student Visa Fee" value={draft.studentVisaFee} editing={isEditing} onChange={(v) => setDraftValue('studentVisaFee' as any, v)} currencyLabel="AUD" />
        <FeeCard title="Dependent Visa Fee" subtitle="(Spouse / 18 and over)" value={draft.dependentVisaFeeSpouse18Plus} editing={isEditing} onChange={(v) => setDraftValue('dependentVisaFeeSpouse18Plus' as any, v)} currencyLabel="AUD" />
        <FeeCard title="Dependent Visa Fee" subtitle="(Child / under 18)" value={draft.dependentVisaFeeChildUnder18} editing={isEditing} onChange={(v) => setDraftValue('dependentVisaFeeChildUnder18' as any, v)} currencyLabel="AUD" />
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
