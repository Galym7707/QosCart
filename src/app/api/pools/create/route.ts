// src/app/api/pools/create/route.ts — создание группы пользователем
import { NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase';
import { parentLabel } from '@/lib/categories';

export async function POST(req: Request) {
  const { productId, userId } = await req.json();
  if (!productId || !userId) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  const db = adminClient();

  const [{ data: product }, { data: user }] = await Promise.all([
    db.from('products').select('id, category, title').eq('id', productId).single(),
    db.from('users').select('id, city, esim_verified, phone_hash, device_id').eq('id', userId).single(),
  ]);
  if (!product || !user) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (!user.esim_verified) return NextResponse.json({ error: 'not_verified' }, { status: 403 });

  const { data: existing } = await db.from('pools').select('id')
    .eq('product_id', productId).eq('status', 'forming')
    .gt('expires_at', new Date().toISOString()).limit(1);
  if (existing?.length) return NextResponse.json({ error: 'already_exists', poolId: existing[0].id }, { status: 409 });

  const { data: pool, error } = await db.from('pools').insert({
    product_id: productId,
    city: user.city,
    name: `${user.city} · ${parentLabel(product.category)}`,
    status: 'forming',
    min_participants: 10,
    current_participants: 1,
    expires_at: new Date(Date.now() + 24 * 3600_000).toISOString(),
  }).select('*').single();
  if (error || !pool) return NextResponse.json({ error: 'create_failed' }, { status: 500 });

  await db.from('pool_members').insert({
    pool_id: pool.id, user_id: userId, phone_hash: user.phone_hash, device_id: user.device_id,
  });

  return NextResponse.json({ pool });
}
