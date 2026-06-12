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

  const tokens = intent.query_en.toLowerCase().split(/\s+/).filter(t => t.length >= 3);

  // существительное запроса → подкатегория: «laptop» ищет по полке laptops,
  // а не по слову в названии (иначе побеждают «power bank FOR laptop» и подставки)
  const SUB_HINTS: Record<string, string> = {
    laptop: 'laptops', laptops: 'laptops', notebook: 'laptops', macbook: 'laptops', chromebook: 'laptops',
    tablet: 'tablets', tablets: 'tablets', ipad: 'tablets',
    smartphone: 'smartphones', smartphones: 'smartphones', phone: 'smartphones', iphone: 'smartphones',
    earbuds: 'earbuds', earbud: 'earbuds', airpods: 'earbuds',
    headphone: 'headphones', headphones: 'headphones', headset: 'headphones',
    speaker: 'speakers', speakers: 'speakers',
    keyboard: 'peripherals', mouse: 'peripherals',
    watch: 'wearables', smartwatch: 'wearables', tracker: 'wearables', band: 'wearables', tws: 'earbuds',
    charger: 'chargers', powerbank: 'chargers',
    hub: 'storage', ssd: 'storage',
    kettle: 'small_appliances', vacuum: 'cleaning', humidifier: 'climate', backpack: 'backpacks',
    iron: 'garment', steamer: 'garment', toothbrush: 'oral', flosser: 'oral', luggage: 'luggage', suitcase: 'luggage', scooter: 'outdoors_kids',
  };
  // специфичные подтипы бьют общие слова («tws headphones» → вкладыши),
  // иначе главное существительное — в конце («laptop backpack» → рюкзаки)
  const SPECIFIC = new Set(['tws', 'earbuds', 'airpods', 'smartwatch', 'macbook', 'chromebook', 'iphone', 'ipad', 'powerbank']);
  const specific = tokens.find(t => SPECIFIC.has(t));
  const subHit = specific ? SUB_HINTS[specific] : [...tokens].reverse().map(t => SUB_HINTS[t]).find(Boolean);

  let products: any[] | null = [];
  if (subHit) {
    ({ data: products = [] } = await db.from('products').select('*').eq('subcategory', subHit).limit(60));
  } else {
    const orExpr = (tokens.length ? tokens : [intent.query_en]).map(t => `title.ilike.%${t}%`).join(',');
    ({ data: products = [] } = await db.from('products').select('*').or(orExpr).limit(60));
  }

  // пословный матчинг с границами слов:
  // - на полке (subHit): «mechanical keyboard» сужает peripherals до клавиатур; мало матчей → вся полка
  // - без полки: все слова → главное существительное → ничего
  if (tokens.length) {
    const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const matchTok = (title: string, t: string) => new RegExp(`\\b(i|smart|e)?${esc(t)}`, 'i').test(title);
    const all = (products ?? []).filter(p => tokens.every(t => matchTok(p.title, t)));
    if (subHit) {
      if (all.length >= 2) products = all;
    } else {
      const head = tokens[tokens.length - 1];
      const byHead = (products ?? []).filter(p => matchTok(p.title, head));
      products = all.length ? all : byHead;
    }
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
