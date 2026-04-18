'use client';

import { Button } from '@/components/ui/forms/button';
import { Check, Pencil, X } from 'lucide-react';

type EditActionButtonsProps = {
  isEditing: boolean;
  onSave: () => void | Promise<void>;
  onCancel: () => void;
  onStartEdit: () => void;
};

export default function EditActionButtons({
  isEditing,
  onSave,
  onCancel,
  onStartEdit,
}: EditActionButtonsProps) {
  return (
    <div className="mt-6 flex gap-2">
      {isEditing ? (
        <>
          <Button
            onClick={onSave}
            size="icon"
            className="rounded-full"
            aria-label="Save fees value"
            data-testid="fees-save-button"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            onClick={onCancel}
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
          onClick={onStartEdit}
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
  );
}
