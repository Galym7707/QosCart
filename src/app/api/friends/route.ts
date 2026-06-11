// src/app/api/friends/route.ts — GET ?userId= → список друзей
import { NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase';

export async function GET(req: Request) {
  const userId = new URL(req.url).searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'no_user' }, { status: 400 });
  const db = adminClient();
  const { data: edges } = await db.from('friendships').select('friend_id').eq('user_id', userId);
  const ids = (edges ?? []).map(e => e.friend_id);
  if (!ids.length) return NextResponse.json({ friends: [] });
  const { data: friends } = await db.from('users').select('id, name, interests, city').in('id', ids);
  return NextResponse.json({ friends: friends ?? [] });
}
