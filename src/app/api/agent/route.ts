// src/app/api/agent/route.ts
import { NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase';
import { parseIntent, explain } from '@/lib/llm';
import { scoreProduct } from '@/lib/scoring';
import { searchShopping } from '@/lib/serpapi';

export async function POST(req: Request) {
  const { message, profile } = await req.json(); // profile: { interests, budget_kzt, city }
  const db = adminClient();
  const intent = await parseIntent(message);
  const budget = intent.budget_max ?? profile?.budget_kzt ?? null;

  // 1) своя база (сид + накопленный live)
  let { data: products = [] } = await db.from('products')
    .select('*')
    .ilike('title', `%${intent.query_en.split(' ')[0]}%`)
    .limit(30);

  // 2) live-дозагрузка, если мало — результаты вливаются в каталог
  if ((products?.length ?? 0) < 3) {
    const live = await searchShopping(intent.query_en, intent.category ?? 'tech');
    if (live.length) {
      const { data: inserted } = await db.from('products').insert(live).select('*');
      products = [...(products ?? []), ...(inserted ?? [])];
    }
  }

  if (budget) products = (products ?? []).filter(p => p.price_kzt <= budget * 1.2);

  // 3) открытый пул в городе
  const { data: pools } = await db.from('pools')
    .select('*, products(title)')
    .eq('city', intent.city)
    .in('status', ['forming'])
    .gt('expires_at', new Date().toISOString())
    .limit(5);
  const pool = pools?.[0] ?? null;

  // 4) скоринг → top-5
  const prof = { interests: profile?.interests ?? [], budget_kzt: budget, city: intent.city };
  const ranked = (products ?? [])
    .map(p => ({ ...p, ...scoreProduct(p, prof, { cityDemand: !!pool, poolProgress: pool ? pool.current_participants / pool.min_participants : 0 }) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // 5) объяснение (LLM → шаблон)
  const explanation = ranked.length
    ? await explain(ranked[0].chips, pool ? { name: pool.name, current_participants: pool.current_participants, min_participants: pool.min_participants } : null, message)
    : 'Ничего не нашёл — попробуйте переформулировать.';

  return NextResponse.json({ intent, products: ranked, pool, explanation });
}
