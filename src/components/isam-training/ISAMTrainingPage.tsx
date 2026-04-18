'use client';

import React, { useState } from 'react';
import ISAMSidebarWrapper from './ISAMSidebarWrapper';
import ISAMTrainingClient from './ISAMTrainingClient';

export default function ISAMTrainingPage() {
  const [selectedId, setSelectedId] = useState<string>('m1-1');

  return (
    <div className="mt-0 grid grid-cols-1 md:grid-cols-12 gap-6">
      <aside className="md:col-span-3">
        <ISAMSidebarWrapper selectedId={selectedId} onSelect={setSelectedId} />
      </aside>

      <section className="md:col-span-9">
        <ISAMTrainingClient selectedId={selectedId} onSelect={setSelectedId} />
      </section>
    </div>
  );
}
