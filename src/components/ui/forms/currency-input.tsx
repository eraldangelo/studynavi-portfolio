'use client';

import * as React from "react";
import { Input, type InputProps } from "@/components/ui/forms/input";

interface CurrencyInputProps extends Omit<InputProps, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
  symbol?: string;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, symbol = '$', ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value.replace(/[^\d.]/g, '');
      const [integer, decimal] = inputValue.split('.');

      if (decimal && decimal.length > 2) {
        inputValue = `${integer}.${decimal.slice(0, 2)}`;
      }

      onChange(inputValue);
    };

    const formatValue = (val: string) => {
      if (!val) return '';
      const [integer, decimal] = val.split('.');
      const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return decimal ? `${formattedInteger}.${decimal}` : formattedInteger;
    };

    return (
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">{symbol}</span>
        <Input
          ref={ref}
          value={formatValue(value)}
          onChange={handleChange}
          className="pl-7"
          {...props}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
