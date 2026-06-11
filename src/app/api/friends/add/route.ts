// src/app/api/friends/add/route.ts — POST {userId, query} → кандидаты | {userId, friendId} → дружба
import { NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase';

export async function POST(req: Request) {
  const { userId, query, friendId } = await req.json();
  if (!userId) return NextResponse.json({ error: 'no_user' }, { status: 400 });
  const db = adminClient();

  if (friendId) {
    if (friendId === userId) return NextResponse.json({ error: 'self' }, { status: 409 });
    const rows = [
      { user_id: userId, friend_id: friendId, source: 'manual' },
      { user_id: friendId, friend_id: userId, source: 'manual' },
    ];
    await db.from('friendships').upsert(rows, { onConflict: 'user_id,friend_id', ignoreDuplicates: true });
    const { data: friend } = await db.from('users').select('id, name, interests, city').eq('id', friendId).single();
    return NextResponse.json({ added: friend });
  }

  const q = String(query ?? '').trim();
  if (q.length < 2) return NextResponse.json({ candidates: [] });
  const digits = q.replace(/[^\d+]/g, '');
  let candidates: any[] = [];
  if (digits.length >= 10) {
    const phoneHash = Buffer.from(digits).toString('base64');
    const { data } = await db.from('users').select('id, name, city').eq('phone_hash', phoneHash).neq('id', userId).limit(5);
    candidates = data ?? [];
  } else {
    const safe = q.replace(/[%_]/g, '\\$&');
    const { data } = await db.from('users').select('id, name, city').ilike('name', `%${safe}%`).neq('id', userId).limit(5);
    candidates = data ?? [];
  }
  return NextResponse.json({ candidates });
}
