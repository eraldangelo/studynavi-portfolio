'use client';

import * as React from "react";
import { Input, type InputProps } from "@/components/ui/forms/input";

interface PercentageInputProps extends Omit<InputProps, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
}

const PercentageInput = React.forwardRef<HTMLInputElement, PercentageInputProps>(
  ({ value, onChange, ...props }, ref) => {
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
      return `${val}%`;
    };

    return (
      <div className="relative">
        <Input
          ref={ref}
          value={formatValue(value)}
          onChange={handleChange}
          {...props}
        />
      </div>
    );
  }
);

PercentageInput.displayName = "PercentageInput";

export { PercentageInput };
