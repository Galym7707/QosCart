// src/components/SearchBar.tsx
'use client';
import { useEffect, useState } from 'react';
import Icon from './Icon';

export default function SearchBar({ value, onChange, className = '' }: { value: string; onChange: (q: string) => void; className?: string }) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);
  useEffect(() => {
    const t = setTimeout(() => { if (local !== value) onChange(local); }, 200);
    return () => clearTimeout(t);
  }, [local, value, onChange]);
  return (
    <div className={`relative ${className}`}>
      <input
        value={local} onChange={e => setLocal(e.target.value)} placeholder="Поиск по каталогу"
        className="w-full border rounded-full pl-10 pr-9 py-2.5 text-sm bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10" />
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"><Icon name="search" size={16} /></span>
      {local && <button aria-label="Очистить" onClick={() => { setLocal(''); onChange(''); }}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"><Icon name="x" size={14} /></button>}
    </div>
  );
}
