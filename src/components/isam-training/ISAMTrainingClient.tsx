'use client';

import React from 'react';
import ISAMHeader from './ISAMHeader';
import ISAMPlayer from './ISAMPlayer';
import modules from './modules';
import { MODULE_1_TITLE } from './module1';
import WhatIsISAM from './module1/what-is-isam';

type Props = { selectedId: string; onSelect?: (id: string) => void };

export default function ISAMTrainingClient({ selectedId, onSelect }: Props) {
  const jumpToNext = () => {
    // find the next item in the flat list order
    const flat = modules.flatMap(m => m.items);
    const idx = flat.findIndex(it => it.id === selectedId);
    const next = idx >= 0 ? flat[idx + 1] : undefined;
    if (next && onSelect) onSelect(next.id);
  };

  const renderContent = () => {
    if (selectedId === 'm1-2') return <WhatIsISAM />;
    // intro video content (include header only for the intro)
    return (
      <>
        <ISAMHeader />
        <div className="mt-6">
          <ISAMPlayer
            title={'Module 1 • ISAM Introduction'}
            itemTitle={'ISAM Introduction'}
            onCompleted={jumpToNext}
          />
        </div>
      </>
    );
  };

  return <div className="pt-2 pb-8">{renderContent()}</div>;
}
