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

const CURATED = [
  { title: 'Anker Soundcore Life P2 Wireless Earbuds', category: 'tech',    price_kzt: 12990, source: 'cached_demo', product_url: null, image_url: null, rating: 4.6, reviews_count: 2400, raw: null },
  { title: 'Xiaomi Power Bank 10000mAh 22.5W',         category: 'tech',    price_kzt: 9990,  source: 'cached_demo', product_url: null, image_url: null, rating: 4.7, reviews_count: 1850, raw: null },
  { title: 'LED Desk Lamp with USB Port',               category: 'study',   price_kzt: 6990,  source: 'cached_demo', product_url: null, image_url: null, rating: 4.4, reviews_count: 980,  raw: null },
  { title: 'Student Laptop Backpack 15.6"',             category: 'study',   price_kzt: 8990,  source: 'cached_demo', product_url: null, image_url: null, rating: 4.5, reviews_count: 1200, raw: null },
  { title: 'Mini Air Humidifier 500ml',                 category: 'home',    price_kzt: 4990,  source: 'cached_demo', product_url: null, image_url: null, rating: 4.3, reviews_count: 750,  raw: null },
  { title: 'Electric Kettle 1.7L',                     category: 'home',    price_kzt: 7990,  source: 'cached_demo', product_url: null, image_url: null, rating: 4.5, reviews_count: 1600, raw: null },
  { title: 'Unisex Running Sneakers',                   category: 'fashion', price_kzt: 18990, source: 'cached_demo', product_url: null, image_url: null, rating: 4.2, reviews_count: 630,  raw: null },
  { title: 'Crossbody Bag Water Resistant',             category: 'fashion', price_kzt: 12990, source: 'cached_demo', product_url: null, image_url: null, rating: 4.4, reviews_count: 420,  raw: null },
  { title: 'Yoga Mat Non-Slip 6mm',                    category: 'sport',   price_kzt: 7490,  source: 'cached_demo', product_url: null, image_url: null, rating: 4.6, reviews_count: 1100, raw: null },
  { title: 'Insulated Water Bottle 750ml',              category: 'sport',   price_kzt: 5990,  source: 'cached_demo', product_url: null, image_url: null, rating: 4.8, reviews_count: 2100, raw: null },
  { title: 'Ionic Hair Dryer 2000W',                   category: 'beauty',  price_kzt: 24990, source: 'cached_demo', product_url: null, image_url: null, rating: 4.5, reviews_count: 890,  raw: null },
  { title: 'Electric Toothbrush Sonic',                category: 'beauty',  price_kzt: 14990, source: 'cached_demo', product_url: null, image_url: null, rating: 4.7, reviews_count: 150,  raw: null },
];

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

  if (total === 0) {
    const { error } = await db.from('products').insert(CURATED);
    if (error) { console.error('Curated insert error:', error.message); } else { total = 12; }
    console.log('SerpAPI недоступен — загружен curated fallback (12 товаров)');
  }

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
