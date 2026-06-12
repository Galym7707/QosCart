// src/components/WhyPanel.tsx
'use client';
import { useState } from 'react';
import type { Factor } from '@/lib/scoring';

export default function WhyPanel({ factors, score }: { factors: Factor[]; score: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="text-xs">
      <button onClick={e => { e.preventDefault(); e.stopPropagation(); setOpen(o => !o); }}
        className="text-blue-600 underline decoration-dotted">
        Почему это вам · {score}% {open ? '▴' : '▾'}
      </button>
      {open && (
        <div className="mt-2 flex flex-col gap-1.5 bg-blue-50/50 border border-blue-100 rounded-xl p-3">
          {factors.map(f => (
            <div key={f.key} className="flex items-center gap-2">
              <span className="w-36 shrink-0 text-zinc-600">{f.label}</span>
              <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div className={`h-full ${f.points > 0 ? 'bg-blue-500' : 'bg-zinc-200'}`} style={{ width: `${(f.points / f.max) * 100}%` }} />
              </div>
              <span className="w-10 text-right tabular-nums text-zinc-500">{f.points}/{f.max}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
