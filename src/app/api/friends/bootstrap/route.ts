// src/app/api/friends/bootstrap/route.ts — POST {userId} → 3 демо-друга
import { NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase';

export async function POST(req: Request) {
  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: 'no_user' }, { status: 400 });
  const db = adminClient();
  const { data: demo } = await db.from('users').select('id, name, interests, city').eq('device_id', 'demo-seed').neq('id', userId).limit(3);
  if (!demo?.length) return NextResponse.json({ friends: [] });
  const rows = demo.flatMap(d => [
    { user_id: userId, friend_id: d.id, source: 'seed' },
    { user_id: d.id, friend_id: userId, source: 'seed' },
  ]);
  await db.from('friendships').upsert(rows, { onConflict: 'user_id,friend_id', ignoreDuplicates: true });
  return NextResponse.json({ friends: demo });
}
