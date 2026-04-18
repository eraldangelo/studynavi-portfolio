'use client';

import React, { useEffect, useRef, useState } from 'react';
import ISAMSidebar from './ISAMSidebar';

type Props = { onSelect?: (id: string) => void; selectedId?: string };

export default function ISAMSidebarWrapper({ onSelect, selectedId }: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [style, setStyle] = useState<React.CSSProperties | undefined>(undefined);

  useEffect(() => {
    function update() {
      const wrap = wrapRef.current;
      if (!wrap) return;

      const rect = wrap.getBoundingClientRect();
      const containerLeft = rect.left + window.scrollX;
      // Only fix on desktop widths
      if (window.innerWidth >= 768) {
        setStyle({
          position: 'fixed',
          top: 64, // offset below header (adjust if needed)
          left: containerLeft,
          width: rect.width,
          maxHeight: `calc(100vh - 6rem)`,
          overflowY: 'auto',
          paddingRight: 8,
          zIndex: 40,
        });
      } else {
        setStyle(undefined);
      }
    }

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update);
    };
  }, []);

  return (
    <div ref={wrapRef}>
      <div style={style}>
        <ISAMSidebar onSelect={onSelect} selectedId={selectedId} />
      </div>
    </div>
  );
}
