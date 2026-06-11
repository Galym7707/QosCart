// src/components/SortBar.tsx
'use client';
import { SORT_LABELS, SortKey } from '@/lib/filters';

export default function SortBar({ sort, onChange }: { sort: SortKey; onChange: (s: SortKey) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
      {(Object.keys(SORT_LABELS) as SortKey[]).map(k => (
        <button key={k} onClick={() => onChange(k)}
          className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition
            ${sort === k ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 hover:border-zinc-400'}`}>
          {SORT_LABELS[k]}
        </button>
      ))}
    </div>
  );
}
