'use client';

import React from 'react';
import { MODULE_1_TITLE } from './module1';

export default function ISAMHeader() {
  return (
    <div className="flex items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-primary">Course Introduction</h1>
        <p className="text-sm text-muted-foreground">Module 1: ISAM Introduction</p>
      </div>
    </div>
  );
}
