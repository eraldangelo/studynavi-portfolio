'use client';

import React, { useRef, useState, useEffect } from 'react';
import useScrollScale from '@/hooks/ui/use-scroll-scale';
import { MODULE_1_PARAGRAPHS, MODULE_1_TITLE } from './module1';

type Props = { src?: string; title?: string; itemTitle?: string; onCompleted?: () => void };

export default function ISAMPlayer({ src, title, itemTitle, onCompleted }: Props) {
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'your-storage-bucket.firebasestorage.app';
  const defaultVideoSrc = `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/training%20assets%2FISAM%20Introduction.mp4?alt=media&token=0a1481bd-6453-4e0d-8985-90d1b9433480`;
  const videoSrc =
    src ||
    defaultVideoSrc;

  const innerRef = useRef<HTMLDivElement | null>(null);
  const scale = useScrollScale();

  // Module 1 content imported from separate file
  const paragraphs = MODULE_1_PARAGRAPHS;

  // derive a short item title, preferring explicit itemTitle when provided
  const derivedItemTitle = (() => {
    if (itemTitle) return itemTitle;
    if (!title) return 'intro';
    const parts = title.split('•');
    if (parts.length > 1) return parts[1].trim();
    return title;
  })();

  return (
    <div className="w-full">
      <div className="md:sticky md:top-20 z-30 bg-white">
        <div
          className="bg-background"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            transition: 'transform 180ms ease-out',
            willChange: 'transform',
          }}
        >
          <div className="bg-black rounded overflow-hidden">
            <video className="w-full h-[480px] object-cover" controls src={videoSrc} />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-primary">{derivedItemTitle}</h2>
            </div>
            <div className="ml-4">
              {/* Mark as complete button with localStorage persistence */}
              {/* derive item title from subtitle so sidebar and player use same key */}
              <MarkComplete title={title} itemTitle={derivedItemTitle} onCompleted={onCompleted} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="mt-2 bg-white p-4 rounded border">
          <h3 className="text-lg font-semibold text-primary mb-2">{MODULE_1_TITLE}</h3>
          <div ref={innerRef}>
            {paragraphs.map((p, i) => (
              <p key={i} style={{ margin: '0 0 12px', lineHeight: 1.6 }}>{p}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  }

function MarkComplete({ title, itemTitle, onCompleted }: { title?: string; itemTitle?: string; onCompleted?: () => void }) {
  const storageKey = `isam:completed:${itemTitle || title || 'intro'}`;
  const [completed, setCompleted] = useState<boolean>(() => {
    try {
      return typeof window !== 'undefined' && localStorage.getItem(storageKey) === '1';
    } catch (e) {
      return false;
    }
  });
  const prevCompletedRef = useRef(completed);

  // allow toggling the completed state while developing so QA/dev can test easily
  const allowToggle = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') localStorage.setItem(storageKey, completed ? '1' : '0');
      // notify other components in the same window
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('isam:completed:changed', { detail: { key: storageKey } }));
        if (!prevCompletedRef.current && completed && onCompleted) {
          onCompleted();
        }
        prevCompletedRef.current = completed;
      }
    } catch (e) {
      // ignore
    }
  }, [completed, storageKey, onCompleted]);

  if (completed) {
    if (allowToggle) {
      return (
        <button
          className="px-3 py-1 bg-gray-100 text-gray-600 border rounded hover:opacity-90"
          onClick={() => setCompleted(false)}
        >
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
    <button
      className="px-3 py-1 bg-[#004097] text-white rounded hover:bg-[#003a7a]"
      onClick={() => setCompleted(true)}
    >
      Mark as complete
    </button>
  );
}
