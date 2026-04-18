'use client';
import FeeCard from '../ui/FeeCard';
import { Button } from '@/components/ui/forms/button';
import { Check, X, Pencil } from 'lucide-react';
import { useEditableObject } from '../hooks/useEditable';
import { updateAustraliaBiometricsFees } from '@/services/fees/firestore-fees';

type Props = { feesDoc: any; onRefresh: () => Promise<void>; disabled?: boolean };

export default function BiometricsFeesEditor({ feesDoc, onRefresh, disabled }: Props) {
  const source = (feesDoc && feesDoc.biometricsFeesPHP) || {};
  const { persisted, draft, isEditing, startEdit, cancelEdit, setDraftValue, setPersisted } = useEditableObject({
    biometricsFee: source.biometricsFee ?? 650,
    dependentBiometricsFee: source.dependentBiometricsFee ?? 650,
  });

  const handleSave = async () => {
    try {
      await updateAustraliaBiometricsFees(draft as any);
      setPersisted(draft as any);
      await onRefresh();
      alert('Biometrics fees saved successfully!');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      alert('Failed to save biometrics fees: ' + msg);
      throw err;
    }
  };

  return (
    <div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeeCard
          title="Biometrics Fee"
          value={draft.biometricsFee}
          editing={isEditing}
          onChange={(v) => setDraftValue('biometricsFee' as any, v)}
          currencyLabel="PHP"
        />

        <FeeCard
          title="Dependent Biometrics Fee"
          subtitle="(per dependent)"
          value={draft.dependentBiometricsFee}
          editing={isEditing}
          onChange={(v) => setDraftValue('dependentBiometricsFee' as any, v)}
          currencyLabel="PHP"
        />
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
