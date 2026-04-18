'use client';

import { Label } from '@/components/ui/forms/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';

export type FeesSelectOption<T extends string> = {
  value: T;
  label: string;
};

type FeesEditorSelectProps<T extends string> = {
  label: string;
  value: T;
  options: FeesSelectOption<T>[];
  onValueChange: (value: T) => void;
  disabled?: boolean;
  triggerClassName?: string;
};

export default function FeesEditorSelect<T extends string>({
  label,
  value,
  options,
  onValueChange,
  disabled = false,
  triggerClassName = 'w-[220px]',
}: FeesEditorSelectProps<T>) {
  return (
    <div>
      <Label>{label}</Label>
      <Select value={value} onValueChange={(next) => onValueChange(next as T)} disabled={disabled}>
        <SelectTrigger className={triggerClassName}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
