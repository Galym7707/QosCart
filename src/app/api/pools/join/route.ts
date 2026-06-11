// src/app/api/pools/join/route.ts
import { NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase';
import { canJoin, applyJoin } from '@/lib/joinRules';

export async function POST(req: Request) {
  const { poolId, userId, inviterId } = await req.json();
  const db = adminClient();

  const [{ data: pool }, { data: user }, { data: members }] = await Promise.all([
    db.from('pools').select('*').eq('id', poolId).single(),
    db.from('users').select('*').eq('id', userId).single(),
    db.from('pool_members').select('user_id, phone_hash, device_id').eq('pool_id', poolId),
  ]);
  if (!pool || !user) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const check = canJoin(pool, user, members ?? []);
  if (!check.ok) return NextResponse.json({ error: check.reason }, { status: 409 });

  const { error: insErr } = await db.from('pool_members').insert({
    pool_id: poolId, user_id: userId, phone_hash: user.phone_hash, device_id: user.device_id,
  });
  if (insErr) return NextResponse.json({ error: 'duplicate' }, { status: 409 }); // unique-constraint = второй рубеж

  if (inviterId && inviterId !== userId) {
    try {
      await db.from('friendships').upsert([
        { user_id: userId, friend_id: inviterId, source: 'invite' },
        { user_id: inviterId, friend_id: userId, source: 'invite' },
      ], { onConflict: 'user_id,friend_id', ignoreDuplicates: true });
    } catch { /* дружба — побочный эффект, не блокирует join */ }
  }

  const next = applyJoin(pool);
  const { data: updated } = await db.from('pools').update(next).eq('id', poolId).select('*').single();
  return NextResponse.json({ pool: updated });
}
