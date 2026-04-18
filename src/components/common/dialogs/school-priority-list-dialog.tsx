'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/overlay/dialog';
import { School } from 'lucide-react';

interface PartnerSchoolsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function PartnerSchoolsDialog({ isOpen, onOpenChange }: PartnerSchoolsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <School className="h-5 w-5" />
            Partner Schools
          </DialogTitle>
          <DialogDescription>
            This feature is coming soon. You will be able to view and manage the list of partner schools here.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 text-center text-muted-foreground">
          (Content for the partner schools list will be added in a future update)
        </div>
      </DialogContent>
    </Dialog>
  );
}
