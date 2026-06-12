// scripts/seed-colors.ts — догрузка реальных товаров с цветом в названии (22 запроса)
import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import { searchShopping } from '../src/lib/serpapi';

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const JOBS: { q: string; cat: string; sub: string }[] = [
  { q: 'black over ear headphones', cat: 'audio', sub: 'headphones' },
  { q: 'black laptop backpack', cat: 'fashion', sub: 'bags' },
  { q: 'white electric kettle', cat: 'kitchen', sub: 'small_appliances' },
  { q: 'white led desk lamp', cat: 'home', sub: 'lighting' },
  { q: 'gray sneakers men', cat: 'fashion', sub: 'sneakers' },
  { q: 'grey crossbody bag', cat: 'fashion', sub: 'bags' },
  { q: 'silver smart watch', cat: 'electronics', sub: 'wearables' },
  { q: 'silver stainless water bottle', cat: 'sport', sub: 'gear' },
  { q: 'navy blue backpack', cat: 'study', sub: 'backpacks' },
  { q: 'blue yoga mat', cat: 'sport', sub: 'fitness' },
  { q: 'red bluetooth speaker', cat: 'audio', sub: 'speakers' },
  { q: 'red running shoes', cat: 'fashion', sub: 'sneakers' },
  { q: 'green desk lamp', cat: 'home', sub: 'lighting' },
  { q: 'sage green bed sheets', cat: 'home', sub: 'bedding' },
  { q: 'beige tote bag', cat: 'fashion', sub: 'bags' },
  { q: 'khaki travel backpack', cat: 'travel', sub: 'luggage' },
  { q: 'pink wireless earbuds', cat: 'audio', sub: 'earbuds' },
  { q: 'pink hair dryer', cat: 'beauty', sub: 'hair' },
  { q: 'yellow insulated water bottle', cat: 'sport', sub: 'gear' },
  { q: 'yellow kids scooter', cat: 'kids', sub: 'outdoors_kids' },
  { q: 'rose gold wireless earbuds', cat: 'audio', sub: 'earbuds' },
  { q: 'gold frame sunglasses', cat: 'fashion', sub: 'accessories' },
];

async function main() {
  let total = 0;
  for (const j of JOBS) {
    const items = await searchShopping(j.q, j.cat, j.sub);
    if (items.length) {
      const { error } = await db.from('products').insert(items);
      if (error) { console.error(j.q, error.message); continue; }
      total += items.length;
    }
    console.log(`${j.q}: +${items.length}`);
    await new Promise(r => setTimeout(r, 500));
  }
  console.log('color seed total:', total);
}
main();
