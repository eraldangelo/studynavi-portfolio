'use client';
import FeeCard from '../ui/FeeCard';
import { Button } from '@/components/ui/forms/button';
import { Check, X, Pencil } from 'lucide-react';
import { useEditableObject } from '../hooks/useEditable';
import { updateAustraliaEvidenceOfFunds } from '@/services/fees/firestore-fees';

type Props = { feesDoc: any; onRefresh: () => Promise<void>; disabled?: boolean };

export default function EvidenceOfFundsEditor({ feesDoc, onRefresh, disabled }: Props) {
  const source = (feesDoc && feesDoc.evidenceOfFundsAUD) || {};
  const { persisted, draft, isEditing, startEdit, cancelEdit, setDraftValue, setPersisted } = useEditableObject({
    studentCostOfLiving: source.studentCostOfLiving ?? 29710,
    partnerCostOfLiving: source.partnerCostOfLiving ?? 10394,
    costOfLivingPerChild: source.costOfLivingPerChild ?? 4449,
    airfarePerPerson: source.airfarePerPerson ?? 2000,
  });

  const handleSave = async () => {
    try {
      await updateAustraliaEvidenceOfFunds(draft as any);
      setPersisted(draft as any);
      await onRefresh();
      alert('Evidence of Funds saved successfully!');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      alert('Failed to save Evidence of Funds: ' + msg);
      throw err;
    }
  };

  return (
    <div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <FeeCard
          title="Cost of Living"
          subtitle={<span>(Student)</span>}
          value={draft.studentCostOfLiving}
          editing={isEditing}
          onChange={(v) => setDraftValue('studentCostOfLiving' as any, v)}
          currencyLabel="AUD"
        />

        <FeeCard
          title="Cost of Living"
          subtitle={<span>(Partner/Spouse)</span>}
          value={draft.partnerCostOfLiving}
          editing={isEditing}
          onChange={(v) => setDraftValue('partnerCostOfLiving' as any, v)}
          currencyLabel="AUD"
        />

        <FeeCard
          title="Cost of Living"
          subtitle={<span>(per child)</span>}
          value={draft.costOfLivingPerChild}
          editing={isEditing}
          onChange={(v) => setDraftValue('costOfLivingPerChild' as any, v)}
          currencyLabel="AUD"
        />

        <FeeCard
          title="Airfare"
          subtitle={<span>(per person)</span>}
          value={draft.airfarePerPerson}
          editing={isEditing}
          onChange={(v) => setDraftValue('airfarePerPerson' as any, v)}
          currencyLabel="AUD"
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
