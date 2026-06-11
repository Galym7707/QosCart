// src/components/PoolProgress.tsx
'use client';
import { useEffect, useState } from 'react';

export default function PoolProgress({ pool }: { pool: any }) {
  const [left, setLeft] = useState('');
  useEffect(() => {
    const t = setInterval(() => {
      const ms = new Date(pool.expires_at).getTime() - Date.now();
      if (ms <= 0) { setLeft('истёк'); clearInterval(t); return; }
      const h = Math.floor(ms / 3600000), m = Math.floor(ms % 3600000 / 60000), s = Math.floor(ms % 60000 / 1000);
      setLeft(`${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(t);
  }, [pool.expires_at]);
  const pct = Math.min(100, Math.round(pool.current_participants / pool.min_participants * 100));
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <b>{pool.current_participants}/{pool.min_participants} участников</b>
        <span className="text-zinc-500">⏱ {left}</span>
      </div>
      <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[11px] text-emerald-700 mt-1">🛡 Все участники — верифицированные устройства (анти-бот защита)</p>
    </div>
  );
}
