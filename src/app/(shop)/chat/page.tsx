'use client';
import { useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';

type Msg = { role: 'user' | 'agent'; text?: string; products?: any[]; pool?: any };

export default function Chat() {
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'agent', text: 'Что хотите купить? Например: «power bank до 15 000 KZT, Алматы»' }]);
  const [input, setInput] = useState(''); const [busy, setBusy] = useState(false);

  async function send() {
    const message = input.trim(); if (!message || busy) return;
    setMsgs(m => [...m, { role: 'user', text: message }, { role: 'agent', text: 'Ищу и сравниваю…' }]);
    setInput(''); setBusy(true);
    const profile = JSON.parse(localStorage.getItem('qos_user') ?? 'null');
    const res = await fetch('/api/agent', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message, profile }) });
    const data = await res.json();
    setMsgs(m => [...m.slice(0, -1), { role: 'agent', text: data.explanation, products: data.products, pool: data.pool }]);
    setBusy(false);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="p-4 flex-1 flex flex-col gap-3 pb-28">
        {msgs.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'self-end bg-black text-white rounded-2xl px-4 py-2 max-w-[80%]' : 'self-start w-full'}>
            {m.text && <p className={m.role === 'agent' ? 'bg-zinc-100 rounded-2xl px-4 py-2 text-sm' : 'text-sm'}>{m.text}</p>}
            {m.products && <div className="flex flex-col gap-2 mt-2">{m.products.map(p => <ProductCard key={p.id} p={p} pool={m.pool ?? null} />)}</div>}
            {m.pool && <Link href={`/product/${m.pool.product_id}`} className="block mt-2 border border-amber-300 bg-amber-50 rounded-2xl p-3 text-sm">🔥 {m.pool.name}: {m.pool.current_participants}/{m.pool.min_participants} — нужно ещё {m.pool.min_participants - m.pool.current_participants} →</Link>}
          </div>
        ))}
      </div>
      <div className="fixed bottom-0 inset-x-0 max-w-2xl mx-auto p-3 bg-white border-t flex gap-2">
        <input className="flex-1 border rounded-full px-4 py-3 text-sm" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Что хотите купить?" />
        <button onClick={send} disabled={busy} className="bg-black text-white rounded-full px-5 disabled:opacity-40">→</button>
      </div>
    </div>
  );
}
