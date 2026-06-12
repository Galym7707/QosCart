// src/components/AgentDock.tsx
'use client';
import { useEffect, useState } from 'react';
import Icon from './Icon';

export default function AgentDock({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(localStorage.getItem('qos_dock') !== '0'); }, []);
  const toggle = () => setOpen(o => { localStorage.setItem('qos_dock', o ? '0' : '1'); return !o; });
  return (
    <>
      {!open && (
        <button onClick={toggle} aria-label="Открыть AI-агента"
          className="hidden lg:flex fixed right-4 bottom-4 z-40 w-12 h-12 rounded-full bg-zinc-900 text-white items-center justify-center shadow-lg">
          <Icon name="agent" size={22} />
        </button>
      )}
      <aside className={`hidden lg:flex flex-col fixed right-0 top-14 bottom-0 w-[400px] bg-white border-l z-30 transition-transform
        ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        {open && (
          <button onClick={toggle} aria-label="Свернуть агента"
            className="absolute top-2 right-2 z-10 w-9 h-9 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-500">
            <Icon name="x" size={16} />
          </button>
        )}
        {children}
      </aside>
    </>
  );
}
