// src/app/api/agent/route.ts
import { NextResponse } from 'next/server';

export const maxDuration = 60; // SSE-стрим агента на Vercel
import { adminClient } from '@/lib/supabase';
import { parseIntent, explain } from '@/lib/llm';
import { scoreProduct } from '@/lib/scoring';
import { searchShopping } from '@/lib/serpapi';
import { formatKzt } from '@/lib/currency';
import { sseEvent } from '@/lib/sse';

type AgentResult = { intent: any; products: any[]; pool: any; explanation: string };

async function runPipeline(message: string, profile: any, emit: (text: string) => void): Promise<AgentResult> {
  const db = adminClient();
  const userId: string | null = profile?.id ?? null;

  const intent = await parseIntent(message);
  const budget = intent.budget_max ?? profile?.budget_kzt ?? null;
  emit(`Понял запрос: ${intent.query_en}${budget ? `, бюджет до ${formatKzt(budget)}` : ''}`);

  let { data: products = [] } = await db.from('products')
    .select('*')
    .ilike('title', `%${intent.query_en.split(' ')[0]}%`)
    .limit(30);

  // пословный матчинг с границами слов: «phone» больше не цепляет headphones,
  // но допускает префиксы iphone/smartphone
  const tokens = intent.query_en.toLowerCase().split(/\s+/).filter(t => t.length >= 3);
  if (tokens.length && (products?.length ?? 0) > 2) {
    const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const strict = (products ?? []).filter(p =>
      tokens.every(t => new RegExp(`\\b(i|smart|e)?${esc(t)}`, 'i').test(p.title)));
    if (strict.length >= 2) products = strict;
  }
  emit(`Ищу в каталоге… ${products?.length ?? 0} кандидатов`);

  if ((products?.length ?? 0) < 3 && intent.category) {
    // сохраняем live-результаты в каталог ТОЛЬКО при уверенной категории —
    // иначе каталог зарастает мусором (см. инцидент со шпагатом в «электронике»)
    const live = await searchShopping(intent.query_en, intent.category);
    if (live.length) {
      emit(`Дозагружаю свежие цены: +${live.length}`);
      const { data: inserted } = await db.from('products').insert(live).select('*');
      products = [...(products ?? []), ...(inserted ?? [])];
    }
  }

  if (budget) products = (products ?? []).filter((p: any) => p.price_kzt <= budget * 1.2);

  const { data: pools } = await db.from('pools')
    .select('*, products(title)')
    .eq('city', intent.city)
    .in('status', ['forming'])
    .gt('expires_at', new Date().toISOString())
    .limit(5);
  const pool = pools?.[0] ?? null;
  emit(pool ? `Нашёл группу: ${pool.current_participants}/${pool.min_participants}` : 'Открытых групп рядом пока нет');

  let likedCats = new Set<string>();
  let friendsInPool = 0;
  if (userId) {
    const { data: likeRows } = await db.from('likes').select('products(category)').eq('user_id', userId);
    likedCats = new Set((likeRows ?? []).map((r: any) => r.products?.category).filter(Boolean));
    if (pool) {
      const [{ data: fr }, { data: members }] = await Promise.all([
        db.from('friendships').select('friend_id').eq('user_id', userId),
        db.from('pool_members').select('user_id').eq('pool_id', pool.id),
      ]);
      const friendIds = new Set((fr ?? []).map((r: any) => r.friend_id));
      friendsInPool = (members ?? []).filter((m: any) => friendIds.has(m.user_id)).length;
    }
  }

  emit('Сравниваю по 8 факторам');
  const prof = { interests: profile?.interests ?? [], budget_kzt: budget, city: intent.city };
  const ranked = (products ?? [])
    .map((p: any) => ({
      ...p,
      ...scoreProduct(p, prof, {
        cityDemand: !!pool,
        poolProgress: pool ? pool.current_participants / pool.min_participants : 0,
        trustShare: pool ? 1 : 0,  // участники пулов верифицированы by design (canJoin)
        likedCategory: likedCats.has(p.category),
        friendsInPool,
      }),
    }))
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 5);

  const explanation = ranked.length
    ? await explain(ranked[0].chips, pool ? { name: pool.name, current_participants: pool.current_participants, min_participants: pool.min_participants } : null, message)
    : 'Ничего не нашёл — попробуйте переформулировать.';

  return { intent, products: ranked, pool, explanation };
}

export async function POST(req: Request) {
  const { message, profile, stream } = await req.json();

  if (!stream) {
    return NextResponse.json(await runPipeline(message, profile, () => {}));
  }

  const enc = new TextEncoder();
  const body = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => controller.enqueue(enc.encode(sseEvent(event, data)));
      try {
        const result = await runPipeline(message, profile, (text: string) => send('step', { text }));
        send('result', result);
      } catch {
        send('result', { intent: null, products: [], pool: null, explanation: 'Агент споткнулся — попробуйте ещё раз.' });
      }
      controller.close();
    },
  });
  return new Response(body, {
    headers: { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache' },
  });
}
