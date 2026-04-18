import type { LucideIcon } from 'lucide-react';

export type VisaProcessStep = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  isBranch?: boolean;
};
