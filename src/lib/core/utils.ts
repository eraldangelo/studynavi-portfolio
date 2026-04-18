
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatNumber = (num: number): string => {
  const options: Intl.NumberFormatOptions = {
    maximumFractionDigits: 2,
  };
  if (num % 1 === 0) {
    options.minimumFractionDigits = 0;
    options.maximumFractionDigits = 0;
  }
  return new Intl.NumberFormat('en-US', options).format(num);
};
