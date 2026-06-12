// src/components/FilterSheet.tsx
'use client';
import FilterPanel from './FilterPanel';
import type { FilterState } from '@/lib/filters';
import Icon from './Icon';

export default function FilterSheet({ open, onClose, f, onChange }:
  { open: boolean; onClose: () => void; f: FilterState; onChange: (f: FilterState) => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute bottom-0 inset-x-0 bg-white rounded-t-3xl p-5 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <p className="font-bold">Фильтры</p>
          <button aria-label="Закрыть" onClick={onClose} className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center"><Icon name="x" size={16} /></button>
        </div>
        <FilterPanel f={f} onChange={onChange} />
        <button onClick={onClose} className="w-full bg-zinc-900 text-white rounded-2xl py-3.5 mt-5 font-semibold">Показать</button>
      </div>
    </div>
  );
}
