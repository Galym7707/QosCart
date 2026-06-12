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
      <button onClick={toggle} aria-label="AI-агент"
        className="hidden lg:flex fixed right-4 bottom-4 z-40 w-12 h-12 rounded-full bg-zinc-900 text-white text-xl items-center justify-center shadow-lg">
        {open ? <Icon name="x" size={20} /> : <Icon name="agent" size={22} />}
      </button>
      <aside className={`hidden lg:flex flex-col fixed right-0 top-14 bottom-0 w-[400px] bg-white border-l z-30 transition-transform
        ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        {children}
      </aside>
    </>
  );
}
