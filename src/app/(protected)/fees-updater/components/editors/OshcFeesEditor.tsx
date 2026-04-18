'use client';
import { Label } from '@/components/ui/forms/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/forms/select';
import { Input } from '@/components/ui/forms/input';
import { Button } from '@/components/ui/forms/button';
import { Check, X, Pencil } from 'lucide-react';
import FeeCard from '../ui/FeeCard';
import { useEditableObject } from '../hooks/useEditable';
import { PLAN_OPTIONS, DURATION_KEYS } from '@/services/fees/firestore-fees';
import { updateOshcFees } from '@/services/fees/firestore-fees';
import { useState } from 'react';


type Props = {
  feesDoc: any;
  onRefresh: () => Promise<void>;
  disabled?: boolean;
  planType: string;
  setPlanType: (v: string) => void;
};

export default function OshcFeesEditor({ feesDoc, onRefresh, disabled, planType, setPlanType }: Props) {
  const planField = (PLAN_OPTIONS.find(p => p.label === planType) || PLAN_OPTIONS[0]).field;

  const sourceMap = (feesDoc && feesDoc[planField]) || {};
  const { persisted, draft, isEditing, startEdit, cancelEdit, setDraftValue, setPersisted } = useEditableObject(sourceMap);

  const handleSave = async () => {
    await updateOshcFees(planField as any, draft as Record<string, number>);
    setPersisted(draft);
    await onRefresh();
    alert('Fees saved successfully!');
  };

  return (
    <div>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {DURATION_KEYS.map(duration => {
          const yearLabel = parseFloat(duration) === 1 ? 'year' : 'years';
          return (
            <div key={duration}>
              <FeeCard
                title={`${duration} ${yearLabel}`}
                value={draft[duration] ?? 0}
                editing={isEditing}
                onChange={(v) => setDraftValue(duration as any, v)}
                currencyLabel="AUD"
              />
            </div>
          );
        })}
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
