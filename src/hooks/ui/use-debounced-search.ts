import { useState, useEffect } from 'react';

/**
 * A custom hook that debounces a value.
 *
 * This is useful for delaying an expensive operation (like an API call or heavy computation)
 * until the user has stopped typing for a specified amount of time.
 *
 * @param {T} value - The value to debounce.
 * @param {number} delay - The debounce delay in milliseconds (defaults to 300).
 * @returns {T} The debounced value, which updates only after the delay has passed.
 */
export const useDebouncedSearch = <T,>(value: T, delay = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function to clear the timeout if the value changes before the delay has passed
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};
