// src/components/FriendNudge.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function FriendNudge() {
  const [nudge, setNudge] = useState<{ poolName: string; productId: string; count: number } | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('qos_user') ?? 'null');
    if (!user?.id) return;
    (async () => {
      const res = await fetch(`/api/friends?userId=${user.id}`).then(r => r.json()).catch(() => ({ friends: [] }));
      const friendIds: string[] = (res.friends ?? []).map((f: any) => f.id);
      if (!friendIds.length) return;
      const { data: rows } = await supabase.from('pool_members').select('pool_id').in('user_id', friendIds);
      if (!rows?.length) return;
      const byPool = new Map<string, number>();
      rows.forEach(r => byPool.set(r.pool_id, (byPool.get(r.pool_id) ?? 0) + 1));
      const [topPoolId, count] = [...byPool.entries()].sort((a, b) => b[1] - a[1])[0];
      const { data: pool } = await supabase.from('pools').select('name, product_id, status, expires_at').eq('id', topPoolId).single();
      if (pool && pool.status === 'forming' && new Date(pool.expires_at) > new Date())
        setNudge({ poolName: pool.name, productId: pool.product_id, count });
    })();
  }, []);

  if (!nudge) return null;
  return (
    <Link href={`/product/${nudge.productId}`}
      className="block border border-amber-300 bg-amber-50 rounded-2xl p-3.5 text-sm mb-1">
      👥 {nudge.count} {nudge.count === 1 ? 'друг' : 'друзей'} уже в группе «{nudge.poolName}» — присоединяйтесь →
    </Link>
  );
}
