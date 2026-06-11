// scripts/seed-v2.ts — резюмируемый re-seed: 72 запроса + демо-пользователи/дружбы/пулы
import { config } from 'dotenv';
config({ path: '.env.local' });
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { allQueryJobs } from '../src/lib/categories';
import { searchShopping } from '../src/lib/serpapi';

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const JOURNAL = 'scripts/.seed-journal.json';

type Journal = { done: string[]; demoSeeded: boolean };
const journal: Journal = existsSync(JOURNAL) ? JSON.parse(readFileSync(JOURNAL, 'utf8')) : { done: [], demoSeeded: false };
const save = () => writeFileSync(JOURNAL, JSON.stringify(journal, null, 2));

const DEMO_USERS = [
  'Аружан', 'Дана', 'Алибек', 'Айгерим', 'Тимур', 'Жанна', 'Ерлан', 'Камила', 'Нурлан', 'Сабина',
].map((name, i) => ({
  name,
  phone: `+7700000000${i}`,
  device_id: 'demo-seed',
  city: 'Almaty',
  interests: [['audio', 'electronics'], ['fashion', 'beauty'], ['sport', 'travel'], ['kitchen', 'home'], ['study', 'computers']][i % 5],
  budget_kzt: 20000 + (i % 4) * 10000,
  esim_verified: true,
}));

async function seedProducts() {
  for (const job of allQueryJobs()) {
    const key = `${job.cat}/${job.sub}/${job.query}`;
    if (journal.done.includes(key)) { console.log('skip', key); continue; }
    const items = await searchShopping(job.query, job.cat, job.sub);
    if (items.length) {
      const { error } = await db.from('products').insert(items);
      if (error) { console.error(key, error.message); continue; }
    }
    journal.done.push(key); save();
    console.log(`${key}: +${items.length}`);
    await new Promise(r => setTimeout(r, 1200));
  }
}

async function seedDemoGraph() {
  if (journal.demoSeeded) { console.log('skip demo graph'); return; }

  // защита от повторного прогона без журнала: демо-граф определяем по маркеру device_id
  const { count: existing } = await db.from('users').select('*', { count: 'exact', head: true }).eq('device_id', 'demo-seed');
  if (existing && existing > 0) {
    console.log('demo users already present, skipping graph');
    journal.demoSeeded = true; save();
    return;
  }

  const users = DEMO_USERS.map(u => ({
    name: u.name,
    phone_hash: Buffer.from(u.phone).toString('base64'),
    device_id: u.device_id, city: u.city, interests: u.interests, budget_kzt: u.budget_kzt, esim_verified: true,
  }));
  const { data: demo, error: uErr } = await db.from('users').insert(users).select('id, name');
  if (uErr || !demo) throw new Error('demo users: ' + uErr?.message);

  const edges: [number, number][] = [];
  for (let i = 0; i < demo.length; i++) edges.push([i, (i + 1) % demo.length]);
  edges.push([0, 5], [2, 7], [4, 9]);
  const rows = edges.flatMap(([a, b]) => [
    { user_id: demo[a].id, friend_id: demo[b].id, source: 'seed' },
    { user_id: demo[b].id, friend_id: demo[a].id, source: 'seed' },
  ]);
  const { error: fErr } = await db.from('friendships').insert(rows);
  if (fErr) throw new Error('friendships: ' + fErr.message);

  const hours = (h: number) => new Date(Date.now() + h * 3600_000).toISOString();
  const poolDefs: { cat: string; name: string; n: number; status: string; exp: number }[] = [
    { cat: 'audio',       name: 'Almaty Audio Drop',    n: 9, status: 'forming', exp: 6 },
    { cat: 'electronics', name: 'Almaty Tech Drop',     n: 7, status: 'forming', exp: 20 },
    { cat: 'kitchen',     name: 'Kitchen Drop Almaty',  n: 7, status: 'forming', exp: 24 },
    { cat: 'study',       name: 'Study Pack Almaty',    n: 4, status: 'forming', exp: 30 },
    { cat: 'sport',       name: 'Sport Drop Almaty',    n: 2, status: 'forming', exp: 40 },
    { cat: 'beauty',      name: 'Beauty Drop Almaty',   n: 8, status: 'forming', exp: 12 },
    { cat: 'travel',      name: 'Travel Drop Almaty',   n: 3, status: 'forming', exp: 36 },
    { cat: 'home',        name: 'Home Drop (провал)',   n: 7, status: 'expired', exp: -2 },
  ];
  for (const def of poolDefs) {
    const { data: prod, error: prodErr } = await db.from('products').select('id').eq('category', def.cat).limit(1).single();
    if (!prod) { console.warn('no product for', def.cat, prodErr?.message ?? ''); continue; }
    const { data: pool, error: pErr } = await db.from('pools').insert({
      product_id: prod.id, city: 'Almaty', name: def.name, status: def.status,
      min_participants: 10, current_participants: def.n, expires_at: hours(def.exp),
    }).select('id').single();
    if (pErr || !pool) { console.error(def.name, pErr?.message); continue; }
    const members = demo.slice(0, Math.min(def.n, demo.length)).map(d => ({
      pool_id: pool.id, user_id: d.id,
      phone_hash: `seed-ph:${pool.id}:${d.id}`, device_id: `seed-dev:${pool.id}:${d.id}`,
    }));
    const { error: mErr } = await db.from('pool_members').insert(members);
    if (mErr) console.error(def.name, 'members:', mErr.message);
  }

  journal.demoSeeded = true; save();
  console.log('demo graph seeded: 10 users, friendships, 8 pools with members');
}

async function main() {
  await seedProducts();
  await seedDemoGraph();
  const { count } = await db.from('products').select('*', { count: 'exact', head: true });
  console.log('products total:', count);
}
main();
