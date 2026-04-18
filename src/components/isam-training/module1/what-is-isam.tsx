'use client';

import React, { useEffect, useRef, useState } from 'react';

export const WHAT_IS_ISAM_ID = 'm1-2';
export const WHAT_IS_ISAM_TITLE = 'What is ISAM?';
export const WHAT_IS_ISAM_SUBTITLE = 'Reading';

export default function WhatIsISAM() {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-primary">{WHAT_IS_ISAM_TITLE}</h2>
        <div className="text-sm text-muted-foreground">{WHAT_IS_ISAM_SUBTITLE}</div>
      </div>

      <div>
        <div className="w-full mb-4 md:mb-0 md:float-left md:w-[220px] md:mr-6">
          <img
            src="https://studynavi.example.com/wp-content/uploads/2025/07/Rectangle-3-3.webp"
            alt="ISAM overview"
            className="w-full"
          />
        </div>

        <div>
          <p style={{ margin: '0 0 12px', lineHeight: 1.6 }}>
            Now that you’ve been introduced to ISAM, let’s talk about what you’ll be doing inside the tool.
          </p>
          <p style={{ margin: '0 0 12px', lineHeight: 1.6 }}>
            <strong>ISAM is our tracking system for every student journey.</strong> From the moment a student starts their consultation,
            up to the point where they move forward with their visa application, everything should be noted and encoded to be reflected properly in ISAM.
          </p>
          <p style={{ margin: '0 0 12px', lineHeight: 1.6 }}>
            <strong>Inside ISAM, you will be encoding student information, updating statuses, and recording progress</strong> based on the
            documents and steps they complete. Each update you encode helps the team understand three important things:
          </p>
          <p style={{ margin: '0 0 12px', lineHeight: 1.6 }}>
            <strong>First</strong>, where the student currently is in the process. <strong>Second</strong>, what requirements are still missing. And <strong>third</strong>,
            what the next action should be.
          </p>
          <p style={{ margin: '0 0 12px', lineHeight: 1.6 }}>
            <strong>This is why accuracy is very important.</strong> A small mistake—like placing data in the wrong field, skipping a required
            update, or encoding inconsistent information—can cause confusion, delays, and incorrect reporting.
          </p>
          <p style={{ margin: '0 0 12px', lineHeight: 1.6 }}>
            <strong>More importantly,</strong> inputting the wrong data and wrong application updates might cause confusion to the Melbourne team
            office. And when that happens, it can lead to escalations, and even the removal of incentives for each successful
            student visa application.
          </p>
          <p style={{ margin: '0 0 12px', lineHeight: 1.6 }}>
            <strong>So in this module,</strong> you will learn how to encode data in a way that is: complete, consistent, and easy to track.
            We will show you the exact steps, what fields matter the most, and how to avoid the common errors that lead to
            messy records.
          </p>
          <p style={{ margin: '0 0 12px', lineHeight: 1.6 }}>
            <strong>By the end of this training,</strong> you should be able to confidently use ISAM to maintain high-quality student records—so
            progress is transparent, tracking is smooth, and management can rely on the data you encode.
          </p>
          <p style={{ margin: '0 0 12px', lineHeight: 1.6 }}>
            Alright—let’s proceed to the next part and start exploring ISAM step-by-step.
          </p>
        </div>
        <div className="clear-both" />

        <div className="mt-6 flex justify-end">
          <div className="w-full md:w-auto">
            <MarkComplete itemTitle={WHAT_IS_ISAM_TITLE} />
          </div>
        </div>
      </div>

    </section>
  );
}

function MarkComplete({ itemTitle }: { itemTitle?: string }) {
  const storageKey = `isam:completed:${itemTitle || 'reading'}`;
  const [completed, setCompleted] = useState<boolean>(() => {
    try {
      return typeof window !== 'undefined' && localStorage.getItem(storageKey) === '1';
    } catch (e) {
      return false;
    }
  });
  const prevCompletedRef = useRef(completed);

  const allowToggle = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') localStorage.setItem(storageKey, completed ? '1' : '0');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('isam:completed:changed', { detail: { key: storageKey } }));
        if (!prevCompletedRef.current && completed) {
          // no-op here; other components can handle auto-advance via event wiring
        }
        prevCompletedRef.current = completed;
      }
    } catch (e) {
      // ignore
    }
  }, [completed, storageKey]);

  if (completed) {
    if (allowToggle) {
      return (
        <button className="px-3 py-1 bg-gray-100 text-gray-600 border rounded hover:opacity-90" onClick={() => setCompleted(false)}>
          Completed ✓ (click to undo)
        </button>
      );
    }

    return (
      <button className="px-3 py-1 bg-gray-100 text-gray-600 border rounded" disabled>
        Completed ✓
      </button>
    );
  }

  return (
    <button className="px-3 py-1 bg-[#004097] text-white rounded hover:bg-[#003a7a]" onClick={() => setCompleted(true)}>
      Mark as complete
    </button>
  );
}

