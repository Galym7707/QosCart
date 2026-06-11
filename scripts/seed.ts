// scripts/seed.ts
import 'dotenv/config';
import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import { searchShopping } from '../src/lib/serpapi';

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const QUERIES: Record<string, string[]> = {
  tech:    ['wireless earbuds', 'power bank fast charging', 'mechanical keyboard', 'smart watch', 'usb c hub', 'bluetooth speaker'],
  study:   ['student backpack usb', 'desk lamp led', 'noise cancelling headphones study', 'tablet stand'],
  home:    ['air humidifier', 'electric kettle', 'robot vacuum budget', 'bed sheets set'],
  fashion: ['sneakers unisex', 'crossbody bag', 'sunglasses polarized'],
  sport:   ['yoga mat', 'resistance bands set', 'water bottle insulated'],
  beauty:  ['hair dryer ionic', 'led face mask', 'electric toothbrush'],
};

async function main() {
  let total = 0;
  for (const [category, queries] of Object.entries(QUERIES)) {
    for (const q of queries) {
      const items = await searchShopping(q, category);
      if (items.length) {
        const { error } = await db.from('products').insert(items);
        if (error) console.error(q, error.message); else total += items.length;
      }
      console.log(`${category} / "${q}": +${items.length}`);
      await new Promise(r => setTimeout(r, 1500)); // уважаем 50 req/час? нет: 24 запроса разом ок, пауза для вежливости
    }
  }
  console.log(`Products seeded: ${total}`);

  // Демо-пулы: активный 7/10, почти полный 9/10, истёкший (для показа провала)
  const { data: prods } = await db.from('products').select('id, title, category').limit(200);
  if (!prods?.length) throw new Error('no products');
  const pick = (cat: string, n = 0) => prods.filter(p => p.category === cat)[n] ?? prods[0];
  const hours = (h: number) => new Date(Date.now() + h * 3600_000).toISOString();

  await db.from('pools').insert([
    { product_id: pick('tech').id,     city: 'Almaty', name: 'Almaty Tech Drop',   status: 'forming', min_participants: 10, current_participants: 7, expires_at: hours(20) },
    { product_id: pick('tech', 1).id,  city: 'Almaty', name: 'Almaty Audio Drop',  status: 'forming', min_participants: 10, current_participants: 9, expires_at: hours(6) },
    { product_id: pick('study').id,    city: 'Almaty', name: 'Study Pack Almaty',  status: 'forming', min_participants: 10, current_participants: 4, expires_at: hours(30) },
    { product_id: pick('home').id,     city: 'Almaty', name: 'Home Drop (провал)', status: 'expired', min_participants: 10, current_participants: 7, expires_at: hours(-2) },
  ]);
  console.log('Pools seeded: 4 (7/10 активный, 9/10 почти, 4/10 ранний, истёкший для демо провала)');
}
main();
