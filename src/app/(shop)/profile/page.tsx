// src/app/(shop)/profile/page.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import TrustBadge from '@/components/TrustBadge';
import { parentLabel } from '@/lib/categories';

type Friend = { id: string; name: string; city: string };

export default function Profile() {
  const r = useRouter();
  const [user, setUser] = useState<any>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [q, setQ] = useState('');
  const [candidates, setCandidates] = useState<Friend[]>([]);
  const [myPools, setMyPools] = useState<any[]>([]);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('qos_user') ?? 'null');
    if (!u) { r.push('/onboarding'); return; }
    setUser(u);
    fetch(`/api/friends?userId=${u.id}`).then(x => x.json()).then(d => setFriends(d.friends ?? []));
    supabase.from('pool_members')
      .select('pools(id, name, status, current_participants, min_participants, product_id, products(title))')
      .eq('user_id', u.id)
      .then(({ data }) => setMyPools((data ?? []).map((row: any) => row.pools).filter(Boolean)));
  }, []);

  async function search() {
    const d = await fetch('/api/friends/add', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId: user.id, query: q }),
    }).then(x => x.json());
    setCandidates(d.candidates ?? []);
  }

  async function add(friendId: string) {
    const d = await fetch('/api/friends/add', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId: user.id, friendId }),
    }).then(x => x.json());
    if (d.added) { setFriends(f => [...f, d.added]); setCandidates([]); setQ(''); }
  }

  async function bootstrap() {
    const d = await fetch('/api/friends/bootstrap', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    }).then(x => x.json());
    setFriends(f => [...f, ...(d.friends ?? [])]);
  }

  if (!user) return null;
  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 lg:pb-10 pt-4 flex flex-col gap-5">
      <section className="border rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <span className="w-12 h-12 rounded-full bg-zinc-900 text-white flex items-center justify-center text-lg font-bold">{user.name?.[0] ?? '?'}</span>
          <div>
            <p className="font-bold">{user.name}</p>
            <TrustBadge />
          </div>
        </div>
        <p className="text-xs text-zinc-500 mt-3">
          Интересы: {(user.interests ?? []).map((i: string) => parentLabel(i)).join(', ') || '—'} · Бюджет: {user.budget_kzt?.toLocaleString('ru-RU') ?? '—'} ₸ · {user.city}
        </p>
        <Link href="/feed?liked=1" className="inline-block mt-3 text-xs border rounded-full px-3 py-1.5">♥ Моё избранное</Link>
      </section>

      <section className="border rounded-2xl p-4">
        <p className="font-semibold text-sm mb-3">Друзья ({friends.length})</p>
        {friends.length === 0 && (
          <button onClick={bootstrap} className="w-full bg-zinc-900 text-white rounded-2xl py-3 text-sm font-semibold mb-3">
            Найти друзей в QosCart
          </button>
        )}
        <ul className="flex flex-col gap-2 mb-3">
          {friends.map(f => (
            <li key={f.id} className="flex items-center gap-2.5 text-sm">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center justify-center">{f.name[0]}</span>
              {f.name} <span className="text-xs text-zinc-400">{f.city}</span>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="Имя или телефон" aria-label="Поиск друзей" className="flex-1 border rounded-full px-4 py-2.5 text-sm" />
          <button onClick={search} className="border rounded-full px-4 text-sm">Найти</button>
        </div>
        {candidates.length > 0 && (
          <ul className="mt-2 flex flex-col gap-1.5">
            {candidates.map(c => (
              <li key={c.id} className="flex items-center justify-between text-sm border rounded-xl px-3 py-2">
                <span>{c.name} <span className="text-xs text-zinc-400">{c.city}</span></span>
                <button onClick={() => add(c.id)} className="text-xs bg-zinc-900 text-white rounded-full px-3 py-1.5">Добавить</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="border rounded-2xl p-4">
        <p className="font-semibold text-sm mb-3">Мои группы ({myPools.length})</p>
        {myPools.length === 0 && <p className="text-xs text-zinc-400">Вы пока не состоите в группах.</p>}
        <ul className="flex flex-col gap-2">
          {myPools.map(p => (
            <li key={p.id}>
              <Link href={`/product/${p.product_id}`} className="flex items-center justify-between text-sm border rounded-xl px-3 py-2.5">
                <span className="line-clamp-1">{p.products?.title ?? p.name}</span>
                <span className={`text-xs shrink-0 ml-2 ${p.status === 'unlocked' ? 'text-emerald-600' : 'text-zinc-500'}`}>
                  {p.current_participants}/{p.min_participants}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <button onClick={() => { localStorage.removeItem('qos_user'); r.push('/'); }}
        className="text-xs text-zinc-400 underline self-center">Выйти</button>
    </div>
  );
}
