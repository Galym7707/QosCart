-- 002_v2: subcategory + likes + friendships + legacy category remap
alter table products add column if not exists subcategory text;

create table if not exists likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  product_id uuid not null references products(id),
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);
create index if not exists likes_user_idx on likes(user_id);

-- модель направленная: дружба = две строки (A→B и B→A); unique(user_id, friend_id) действует на направление
create table if not exists friendships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  friend_id uuid not null references users(id),
  source text not null default 'manual',          -- manual | invite | seed
  created_at timestamptz not null default now(),
  unique(user_id, friend_id),
  check (user_id <> friend_id)
);
create index if not exists friendships_user_idx on friendships(user_id);

-- legacy remap: старые parent-slug'и → новая таксономия (subcategory остаётся NULL у старых строк)
update products set category = 'electronics' where category = 'tech';
-- study/home/fashion/sport/beauty совпадают с новыми slug-ами — remap не нужен
