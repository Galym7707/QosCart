create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone_hash text not null,
  device_id text not null,
  city text not null default 'Almaty',
  interests text[] not null default '{}',
  budget_kzt int,
  esim_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  source text not null default 'google_shopping',
  product_url text,
  image_url text,
  price_kzt int not null,
  rating numeric,
  reviews_count int,
  fetched_at timestamptz not null default now(),
  raw jsonb
);

create table if not exists pools (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id),
  city text not null default 'Almaty',
  name text not null,
  status text not null default 'forming',          -- forming | unlocked | expired | completed
  min_participants int not null default 10,        -- порог из ТЗ
  current_participants int not null default 0,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists pool_members (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references pools(id),
  user_id uuid not null references users(id),
  phone_hash text not null,
  device_id text not null,
  joined_at timestamptz not null default now(),
  unique(pool_id, user_id),
  unique(pool_id, phone_hash),
  unique(pool_id, device_id)                       -- анти-Sybil: 1 устройство = 1 слот
);

alter table pools replica identity full;
-- Realtime: Database → Publications → supabase_realtime → включить таблицу pools (или строка ниже)
alter publication supabase_realtime add table pools;
