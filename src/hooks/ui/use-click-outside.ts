import type { RefObject } from 'react';
import { useEffect } from 'react';

/**
 * A custom hook that triggers a callback when a click is detected outside of a specified element.
 *
 * @param {RefObject<HTMLElement>} ref - A React ref object pointing to the element to monitor.
 * @param {() => void} callback - The function to call when a click outside is detected.
 */
export const useClickOutside = (ref: RefObject<HTMLElement>, callback: () => void) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]);
};
