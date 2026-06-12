-- 008: мусор от live-дозагрузки агента (верёвки/шпагаты/струны) — удалить; бельё — в fashion
-- сначала отвязываем лайки и пулы от удаляемых товаров
with junk as (
  select id from products
  where title ~* '\m(twine|jute|cordage|mason line|construction line|tarred|guitar strings?|glitter string|craft string|kingcord|stringliner)\M'
)
delete from likes where product_id in (select id from junk);

with junk as (
  select id from products
  where title ~* '\m(twine|jute|cordage|mason line|construction line|tarred|guitar strings?|glitter string|craft string|kingcord|stringliner)\M'
)
delete from pool_members where pool_id in (select p.id from pools p join junk j on p.product_id = j.id);

with junk as (
  select id from products
  where title ~* '\m(twine|jute|cordage|mason line|construction line|tarred|guitar strings?|glitter string|craft string|kingcord|stringliner)\M'
)
delete from pools where product_id in (select id from junk);

delete from products
where title ~* '\m(twine|jute|cordage|mason line|construction line|tarred|guitar strings?|glitter string|craft string|kingcord|stringliner)\M';

-- бельё, не пойманное прошлым проходом → fashion
update products set category = 'fashion', subcategory = 'accessories'
where category <> 'fashion'
  and title ~* '\m(g-?string|v-?string|knickers|bralette|briefs|panty|nightgown|lingerie)\M';
