import { config } from 'dotenv';
config({ path: '.env.local' });
import { readFileSync } from 'fs';
import { Client } from 'pg';

async function main() {
  const sql = readFileSync('scripts/schema.sql', 'utf8');
  const stmts = sql.split(';')
    .map(chunk => chunk.split('\n').filter(l => !l.trim().startsWith('--')).join('\n').trim())
    .filter(Boolean);
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  for (const s of stmts) {
    const head = s.slice(0, 60).replace(/\s+/g, ' ');
    try { await c.query(s); console.log('OK  :', head); }
    catch (e: any) { console.log('SKIP:', head, '->', e.message); }
  }
  const r = await c.query("select table_name from information_schema.tables where table_schema='public' order by 1");
  console.log('TABLES:', r.rows.map(x => x.table_name).join(', '));
  await c.end();
}
main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
