'use client';
import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatKzt } from '@/lib/currency';
import { ladderFor, currentPrice, savings, nextUnlock } from '@/lib/ladder';
import PoolProgress from '@/components/PoolProgress';
import FriendAvatars from '@/components/FriendAvatars';
import Icon from '@/components/Icon';
import { colorHex, colorLabel } from '@/lib/attributes';

function ProductInner() {
  const { id } = useParams<{ id: string }>();
  const [p, setP] = useState<any>(null);
  const [pool, setPool] = useState<any>(null);
  const [state, setState] = useState<'idle' | 'joined' | 'error'>('idle');
  const [creating, setCreating] = useState(false);
  const [errText, setErrText] = useState('');
  const sp = useSearchParams();
  const inviterId = sp.get('invite');
  const [friendNames, setFriendNames] = useState<string[]>([]);

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

  useEffect(() => {
    if (!pool?.id) return;
    const u = JSON.parse(localStorage.getItem('qos_user') ?? 'null');
    if (!u?.id) return;
    (async () => {
      const fRes = await fetch(`/api/friends?userId=${u.id}`).then(r => r.json()).catch(() => ({ friends: [] }));
      const friendById = new Map((fRes.friends ?? []).map((f: any) => [f.id, f.name]));
      const { data: members } = await supabase.from('pool_members').select('user_id').eq('pool_id', pool.id);
      setFriendNames(((members ?? []).map(m => friendById.get(m.user_id)).filter(Boolean)) as string[]);
    })();
  }, [pool?.id]);

  if (!p) return <div className="p-6">Загрузка…</div>;
  const expired = pool && (pool.status === 'expired' || new Date(pool.expires_at) <= new Date());
  const n = pool?.current_participants ?? 0;
  const unlock = nextUnlock(p.price_kzt, n);

  async function createPool() {
    const u = JSON.parse(localStorage.getItem('qos_user') ?? 'null');
    if (!u) {
      localStorage.setItem('qos_next', window.location.pathname + window.location.search);
      window.location.assign('/onboarding');
      return;
    }
    setCreating(true);
    const res = await fetch('/api/pools/create', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ productId: id, userId: u.id }) });
    setCreating(false);
    if (res.ok) {
      const { pool: created } = await res.json();
      setPool(created); setState('joined');
    } else {
      const { error } = await res.json().catch(() => ({ error: 'create_failed' }));
      setErrText(error === 'not_verified' ? 'Нужна верификация' : error === 'already_exists' ? 'Группа уже есть — обновите страницу' : 'Не получилось создать группу');
      setState('error');
    }
  }

  async function join() {
    const u = JSON.parse(localStorage.getItem('qos_user') ?? 'null');
    if (!u) {
      localStorage.setItem('qos_next', window.location.pathname + window.location.search);
      window.location.assign('/onboarding');
      return;
    }
    const res = await fetch('/api/pools/join', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ poolId: pool.id, userId: u.id, inviterId }) });
    if (res.ok) { setState('joined'); }
    else { const { error } = await res.json(); setErrText({ expired: 'Группа истекла', duplicate: 'Вы уже в группе (1 устройство = 1 слот)', not_verified: 'Нужна верификация', closed: 'Группа закрыта', not_found: 'Группа недоступна' }[error as string] ?? error); setState('error'); }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-28 lg:pb-10 pt-4 grid lg:grid-cols-2 gap-6 items-start">
      <div>
        {p.image_url
          ? <img src={p.image_url} alt={p.title} className="w-full aspect-square object-contain bg-zinc-50 rounded-3xl" />
          : <div className="w-full aspect-square bg-zinc-50 rounded-3xl" />}
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <h1 className="font-bold text-lg lg:text-2xl">{p.title}</h1>
          <p className="text-xs text-zinc-400 mt-1">{p.source} · цена обновлена {new Date(p.fetched_at).toLocaleString('ru-RU')} · estimated</p>
        </div>

        <div className="border rounded-2xl divide-y">
          {ladderFor(p.price_kzt).map(t => (
            <div key={t.threshold} className={`flex justify-between p-3 text-sm ${n >= t.threshold ? 'bg-emerald-50' : ''}`}>
              <span>{t.label} · от {t.threshold}</span><b>{formatKzt(t.price)}</b>
            </div>
          ))}
        </div>

        {!pool && (
        <div className="border rounded-2xl p-4 flex flex-col gap-3">
          <p className="text-sm text-zinc-500">На этот товар ещё нет группы. Создайте свою: соберите 10 человек — и каждый получит цену <b className="text-emerald-700">{formatKzt(currentPrice(p.price_kzt, 10))}</b> вместо {formatKzt(p.price_kzt)}.</p>
          {state !== 'joined'
            ? <button onClick={createPool} disabled={creating} className="bg-zinc-900 text-white rounded-2xl py-4 font-semibold disabled:opacity-40">{creating ? 'Создаю…' : 'Создать группу'}</button>
            : null}
          {state === 'error' && <p className="text-red-500 text-sm">{errText}</p>}
        </div>
      )}

      {pool && !expired && (
          <div className="border rounded-2xl p-4 flex flex-col gap-3">
            <p className="font-semibold text-sm">{pool.name}</p>
            {friendNames.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-emerald-700">
                <FriendAvatars names={friendNames} />
                {friendNames.length === 1 ? `${friendNames[0]} уже в группе` : `${friendNames.length} ${friendNames.length < 5 ? 'друга' : 'друзей'} уже в группе`}
              </div>
            )}
            <PoolProgress pool={pool} />
            <p className="text-sm">Сейчас: <b className="text-emerald-600">{formatKzt(currentPrice(p.price_kzt, n))}</b> · экономия {formatKzt(savings(p.price_kzt, Math.max(n, 10)))} при 10+
              {unlock && <span className="text-zinc-500"> · ещё {unlock.needed} чел до {formatKzt(unlock.price)}</span>}</p>
            {state !== 'joined'
              ? <button onClick={join} className="bg-black text-white rounded-2xl py-4 font-semibold">Присоединиться к группе</button>
              : <button onClick={() => {
                  const u = JSON.parse(localStorage.getItem('qos_user') ?? 'null');
                  navigator.clipboard.writeText(`${location.origin}/product/${id}?invite=${u?.id ?? ''}`).catch(() => {});
                }} className="bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl p-3 text-sm w-full">
                  <span className="flex items-center gap-2"><Icon name="check-circle" size={17} className="shrink-0" />Слот зарезервирован! Нажмите, чтобы скопировать ссылку-приглашение для друзей</span>
                </button>}
            {state === 'error' && <p className="text-red-500 text-sm">{errText}</p>}
          </div>
        )}

        {pool && expired && (
          <div className="border border-red-200 bg-red-50 rounded-2xl p-4 flex flex-col gap-2">
            <p className="font-semibold text-sm text-red-700">Группа не собралась: {pool.current_participants}/{pool.min_participants} за 24 ч</p>
            <button className="border border-red-300 rounded-xl py-3 text-sm bg-white flex items-center justify-center gap-2"><Icon name="undo" size={16} />Вернуть средства (автоматически)</button>
            <button className="border rounded-xl py-3 text-sm bg-white flex items-center justify-center gap-2"><Icon name="arrow-up" size={16} />Доплатить до тира «от 5»: {formatKzt(currentPrice(p.price_kzt, 5))}</button>
            <button className="border rounded-xl py-3 text-sm bg-white flex items-center justify-center gap-2"><Icon name="share" size={16} />Расшарить ссылку: +2 часа таймера</button>
          </div>
        )}
      </div>

      <div className="border rounded-2xl p-4">
        <p className="font-semibold text-sm mb-2">Характеристики</p>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          {p.color && <><dt className="text-zinc-400">Цвет</dt><dd className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full border border-zinc-200 inline-block" style={{ backgroundColor: colorHex(p.color) }} />{colorLabel(p.color)}</dd></>}
          {p.release_year && <><dt className="text-zinc-400">Год выпуска</dt><dd>{p.release_year}</dd></>}
          {p.weight_g && <><dt className="text-zinc-400">Вес</dt><dd>{p.weight_g >= 1000 ? `${(p.weight_g / 1000).toFixed(1).replace('.', ',')} кг` : `${p.weight_g} г`}</dd></>}
          {p.warranty_months && <><dt className="text-zinc-400">Гарантия</dt><dd>{p.warranty_months} мес.</dd></>}
          {p.purchases_count != null && <><dt className="text-zinc-400">Купили</dt><dd>{p.purchases_count.toLocaleString('ru-RU')} раз</dd></>}
          {p.reviews_count != null && <><dt className="text-zinc-400">Отзывы</dt><dd>{p.reviews_count.toLocaleString('ru-RU')}</dd></>}
        </dl>
      </div>
    </div>
  );
}

export default function Product() {
  return <Suspense fallback={<div className="p-6">Загрузка…</div>}><ProductInner /></Suspense>;
}
