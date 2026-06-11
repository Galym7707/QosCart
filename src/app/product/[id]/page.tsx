'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatKzt } from '@/lib/currency';
import { ladderFor, currentPrice, savings, nextUnlock } from '@/lib/ladder';
import PoolProgress from '@/components/PoolProgress';

export default function Product() {
  const { id } = useParams<{ id: string }>();
  const [p, setP] = useState<any>(null);
  const [pool, setPool] = useState<any>(null);
  const [state, setState] = useState<'idle' | 'joined' | 'error'>('idle');
  const [errText, setErrText] = useState('');

  useEffect(() => {
    supabase.from('products').select('*').eq('id', id).single().then(({ data }) => setP(data));
    supabase.from('pools').select('*').eq('product_id', id).order('created_at', { ascending: false }).limit(1)
      .then(({ data }) => setPool(data?.[0] ?? null));
  }, [id]);

  // REALTIME: два окна синхронизируются здесь
  useEffect(() => {
    if (!pool?.id) return;
    const ch = supabase.channel(`pool-${pool.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pools', filter: `id=eq.${pool.id}` },
        payload => setPool(payload.new))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [pool?.id]);

  if (!p) return <div className="p-6">Загрузка…</div>;
  const expired = pool && (pool.status === 'expired' || new Date(pool.expires_at) <= new Date());
  const n = pool?.current_participants ?? 0;
  const unlock = nextUnlock(p.price_kzt, n);

  async function join() {
    const u = JSON.parse(localStorage.getItem('qos_user') ?? 'null');
    if (!u) { setErrText('Сначала пройдите регистрацию'); setState('error'); return; }
    const res = await fetch('/api/pools/join', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ poolId: pool.id, userId: u.id }) });
    if (res.ok) { setState('joined'); }
    else { const { error } = await res.json(); setErrText({ expired: 'Группа истекла', duplicate: 'Вы уже в группе (1 устройство = 1 слот)', not_verified: 'Нужна верификация', closed: 'Группа закрыта', not_found: 'Группа недоступна' }[error as string] ?? error); setState('error'); }
  }

  return (
    <div className="p-4 pb-28 flex flex-col gap-4">
      {p.image_url && <img src={p.image_url} alt="" className="w-full h-56 object-contain bg-zinc-50 rounded-2xl" />}
      <div>
        <h1 className="font-bold">{p.title}</h1>
        <p className="text-xs text-zinc-400">{p.source} · цена обновлена {new Date(p.fetched_at).toLocaleString('ru-RU')} · estimated</p>
      </div>

      <div className="border rounded-2xl divide-y">
        {ladderFor(p.price_kzt).map(t => (
          <div key={t.threshold} className={`flex justify-between p-3 text-sm ${n >= t.threshold ? 'bg-emerald-50' : ''}`}>
            <span>{t.label} · от {t.threshold}</span><b>{formatKzt(t.price)}</b>
          </div>
        ))}
      </div>

      {pool && !expired && (
        <div className="border rounded-2xl p-4 flex flex-col gap-3">
          <p className="font-semibold text-sm">{pool.name}</p>
          <PoolProgress pool={pool} />
          <p className="text-sm">Сейчас: <b className="text-emerald-600">{formatKzt(currentPrice(p.price_kzt, n))}</b> · экономия {formatKzt(savings(p.price_kzt, Math.max(n, 10)))} при 10+
            {unlock && <span className="text-zinc-500"> · ещё {unlock.needed} чел до {formatKzt(unlock.price)}</span>}</p>
          {state !== 'joined'
            ? <button onClick={join} className="bg-black text-white rounded-2xl py-4 font-semibold">Присоединиться к группе</button>
            : <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl p-3 text-sm">✅ Слот зарезервирован! Позовите друга — ссылка скопирована.</div>}
          {state === 'error' && <p className="text-red-500 text-sm">{errText}</p>}
        </div>
      )}

      {pool && expired && (
        <div className="border border-red-200 bg-red-50 rounded-2xl p-4 flex flex-col gap-2">
          <p className="font-semibold text-sm text-red-700">Группа не собралась: {pool.current_participants}/{pool.min_participants} за 24 ч</p>
          <button className="border border-red-300 rounded-xl py-3 text-sm bg-white">↩️ Вернуть средства (автоматически)</button>
          <button className="border rounded-xl py-3 text-sm bg-white">⬆️ Доплатить до тира «от 5»: {formatKzt(currentPrice(p.price_kzt, 5))}</button>
          <button className="border rounded-xl py-3 text-sm bg-white">📤 Расшарить ссылку: +2 часа таймера</bu