'use client';
import FeeCard from '../ui/FeeCard';
import { Button } from '@/components/ui/forms/button';
import { Check, X, Pencil } from 'lucide-react';
import { useEditableObject } from '../hooks/useEditable';
import { updateAustraliaAssistanceFees } from '@/services/fees/firestore-fees';

type Props = { feesDoc: any; onRefresh: () => Promise<void>; disabled?: boolean };

export default function AssistanceFeesEditor({ feesDoc, onRefresh, disabled }: Props) {
  const source = (feesDoc && feesDoc.assistanceFeesPHP) || {};
  const { persisted, draft, isEditing, startEdit, cancelEdit, setDraftValue, setPersisted } = useEditableObject({
    perDependent: source.perDependent ?? 15000,
    perDependentSubsequentEntry: source.perDependentSubsequentEntry ?? 25000,
  });

  const handleSave = async () => {
    try {
      await updateAustraliaAssistanceFees(draft as any);
      setPersisted(draft as any);
      await onRefresh();
      alert('Assistance fees saved successfully!');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      alert('Failed to save assistance fees: ' + msg);
      throw err;
    }
  };

  return (
    <div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeeCard
          title="Agency Assistance Fee"
          subtitle={<span>(per dependent)</span>}
          value={draft.perDependent}
          editing={isEditing}
          onChange={(v) => setDraftValue('perDependent' as any, v)}
          currencyLabel="PHP"
        />

        <FeeCard
          title="Agency Assistance Fee: Subsequent Entry"
          subtitle={<span>(per dependent)</span>}
          value={draft.perDependentSubsequentEntry}
          editing={isEditing}
          onChange={(v) => setDraftValue('perDependentSubsequentEntry' as any, v)}
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
