// scripts/apply-sql.ts -- npm run migrate -- scripts/migrations/002_v2.sql
import { config } from 'dotenv';
config({ path: '.env.local' });
import { readFileSync } from 'fs';
import { Client } from 'pg';

const sqlFile = process.argv[2];
if (!sqlFile) { console.error('usage: tsx scripts/apply-sql.ts <file.sql>'); process.exit(1); }

const sql = readFileSync(sqlFile, 'utf8');
const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function main() {
  await client.connect();
  try {
    await client.query(sql);
    console.log('applied:', sqlFile);
  } finally {
    await client.end();
  }
}
main().catch(e => { console.error(e.message); process.exit(1); });
