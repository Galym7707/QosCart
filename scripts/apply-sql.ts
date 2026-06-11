// scripts/apply-sql.ts — npm run migrate -- scripts/migrations/002_v2.sql
import 'dotenv/config';
import { config } from 'dotenv';
config({ path: '.env.local' });
import { readFileSync } from 'fs';
import { Client } from 'pg';

const path = process.argv[2];
if (!path) { console.error('usage: tsx scripts/apply-sql.ts <file.sql>'); process.exit(1); }

const sql = readFileSync(path, 'utf8');
const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function main() {
  await client.connect();
  await client.query(sql);
  await client.end();
  console.log('applied:', path);
}
main().catch(e => { console.error(e.message); process.exit(1); });
