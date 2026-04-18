'use client';

import { useEffect, useState } from 'react';

type UseScrollScaleOptions = {
  maxScroll?: number;
  minScale?: number;
  precision?: number;
};

export default function useScrollScale(
  options: UseScrollScaleOptions = {}
) {
  const { maxScroll = 240, minScale = 0.85, precision = 4 } = options;
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function handleScroll() {
      const progress = Math.min(window.scrollY / maxScroll, 1);
      const nextScale = 1 - progress * (1 - minScale);
      setScale(Number(nextScale.toFixed(precision)));
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [maxScroll, minScale, precision]);

  return scale;
}
