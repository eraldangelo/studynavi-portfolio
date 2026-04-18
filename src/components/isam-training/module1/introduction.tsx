'use client';

import React from 'react';
import { MODULE_1_PARAGRAPHS } from '../module1';

export const INTRODUCTION_ID = 'm1-1';
export const INTRODUCTION_TITLE = 'ISAM Introduction';

export default function Introduction() {
  return (
    <section className="bg-white p-4 rounded border">
      <h2 className="text-lg font-semibold text-primary mb-2">{INTRODUCTION_TITLE}</h2>
      <div>
        {MODULE_1_PARAGRAPHS.map((p, i) => (
          <p key={i} style={{ margin: '0 0 12px', lineHeight: 1.6 }}>{p}</p>
        ))}
      </div>
    </section>
  );
}
