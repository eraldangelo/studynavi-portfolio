import React from 'react';
import { Label } from '@/components/ui/forms/label';
import { Input } from '@/components/ui/forms/input';

type Props = {
  title: string;
  subtitle?: React.ReactNode;
  value: number;
  editing: boolean;
  onChange?: (v: number) => void;
  currencyLabel?: string;
};

export default function FeeCard({ title, subtitle, value, editing, onChange, currencyLabel = 'AUD' }: Props) {
  const format = (n: number) => new Intl.NumberFormat('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n || 0);

  return (
    <div className="p-4 border rounded-lg bg-gray-50 flex flex-col justify-between min-h-[96px]">
      <div>
        <Label className="text-sm text-gray-600">{title}</Label>
        {subtitle && <div className="text-xs text-gray-500 mt-0">{subtitle}</div>}
      </div>

      {editing ? (
        <Input type="number" value={String(value ?? '')} onChange={e => onChange && onChange(Number(e.target.value))} className="mt-1 text-lg font-semibold text-[#004097]" />
      ) : (
        <div className="mt-1 text-xl font-bold text-[#004097]">{format(value)}<span className="text-sm font-normal text-gray-500 ml-2">{currencyLabel}</span></div>
      )}
    </div>
  );
}
