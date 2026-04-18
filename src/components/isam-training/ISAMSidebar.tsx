'use client';

import React, { useState, useEffect } from 'react';
import modulesData, { Module } from './modules';
import { ChevronDown, ChevronRight, Dumbbell, Video, BookOpen } from 'lucide-react';

export default function ISAMSidebar({ onSelect, selectedId }:{ onSelect?: (itemId:string)=>void; selectedId?: string }){
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    modulesData.forEach(m => (map[m.id] = true));
    return map;
  });

  const [completed, setCompleted] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    modulesData.forEach(m => m.items.forEach(it => {
      try {
        map[it.title] = typeof window !== 'undefined' && localStorage.getItem(`isam:completed:${it.title}`) === '1';
      } catch (e) {
        map[it.title] = false;
      }
    }));
    return map;
  });

  const toggle = (id: string) => setOpen(prev => ({ ...prev, [id]: !prev[id] }));

  useEffect(() => {
    const onStorage = (e: Event) => {
      // recompute completed map when custom event fires or storage changes
      try {
        const map: Record<string, boolean> = {};
        modulesData.forEach(m => m.items.forEach(it => {
          map[it.title] = typeof window !== 'undefined' && localStorage.getItem(`isam:completed:${it.title}`) === '1';
        }));
        setCompleted(map);
      } catch (err) {
        // ignore
      }
    };

    window.addEventListener('isam:completed:changed', onStorage as EventListener);
    window.addEventListener('storage', onStorage as EventListener);
    return () => {
      window.removeEventListener('isam:completed:changed', onStorage as EventListener);
      window.removeEventListener('storage', onStorage as EventListener);
    };
  }, []);

  return (
    <aside className="w-full md:w-72 border-r pr-4 self-start">
      <div className="sticky top-20" style={{ maxHeight: 'calc(100vh - 5rem)', overflowY: 'auto', paddingRight: 8 }}>
        <div className="flex items-center gap-2 mb-2">
          <Dumbbell className="h-5 w-5 text-yellow-500" />
          <h3 className="font-semibold text-primary">ISAM Training</h3>
        </div>
        {/* subtitle intentionally removed per design */}
        <div className="space-y-2">
          {modulesData.map((m: Module) => (
            <div key={m.id} className="bg-card rounded">
              <button
                className="w-full flex items-center justify-between px-3 py-2 text-left"
                onClick={() => toggle(m.id)}
                aria-expanded={!!open[m.id]}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{m.title}</span>
                </div>
                <div>
                  {open[m.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>
              </button>

              {open[m.id] && (
                <ul className="px-3 pb-3">
                    {m.items.map(it => (
                      <li key={it.id} className="py-1 border-b last:border-b-0">
                        <button
                          className="w-full text-left p-1 rounded hover:bg-accent/5"
                          onClick={() => { onSelect?.(it.id); if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('isam:select', { detail: { id: it.id } })); }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 flex items-center">
                              <span
                                className={`inline-flex items-center justify-center w-4 h-4 rounded-full border-2 ${completed[it.title] ? 'bg-[#004097] border-[#004097]' : 'bg-white border-gray-300'}`}
                                aria-hidden
                              >
                                {completed[it.title] ? (
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                ) : null}
                              </span>
                            </div>

                            <div className="flex-1">
                              <div className={`${it.id === selectedId ? 'font-semibold' : 'font-medium'} text-primary text-sm`}>{it.title}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-2">
                                {it.type === 'reading' ? (
                                  <>
                                    <BookOpen className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-muted-foreground">Reading</span>
                                  </>
                                ) : (
                                  <>
                                    <Video className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-muted-foreground">Video</span>
                                    <span className="text-muted-foreground">·</span>
                                    <span className="text-muted-foreground">{it.duration}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
