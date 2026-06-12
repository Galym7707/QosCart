-- 003: мок-атрибуты товаров для расширенных сортировок (детерминированы через hashtext)
alter table products add column if not exists color text;
alter table products add column if not exists release_year int;
alter table products add column if not exists purchases_count int;
alter table products add column if not exists weight_g int;
alter table products add column if not exists warranty_months int;

-- цвет: палитра зависит от категории (реалистично: техника тёмно-нейтральная, мода разнообразнее)
update products set color = case
  when category in ('electronics','audio','computers','appliances') then
    (array['black','white','gray','silver','blue'])[1 + abs(hashtext(id::text || 'c')) % 5]
  when category in ('fashion','beauty') then
    (array['black','white','beige','pink','red','blue','green'])[1 + abs(hashtext(id::text || 'c')) % 7]
  when category = 'kids' then
    (array['blue','red','green','pink','yellow','white'])[1 + abs(hashtext(id::text || 'c')) % 6]
  else
    (array['black','white','gray','blue','green','red','beige'])[1 + abs(hashtext(id::text || 'c')) % 7]
end where color is null;

-- год выпуска: 2021..2026 со смещением к свежим
update products set release_year = case
  when abs(hashtext(id::text || 'y')) % 10 < 4 then 2025 + abs(hashtext(id::text || 'y2')) % 2  -- 40%: 2025-2026
  when abs(hashtext(id::text || 'y')) % 10 < 8 then 2023 + abs(hashtext(id::text || 'y3')) % 2  -- 40%: 2023-2024
  else 2021 + abs(hashtext(id::text || 'y4')) % 2                                               -- 20%: 2021-2022
end where release_year is null;

-- покупки: коррелируют с отзывами (на 1 отзыв ~8-20 покупок) + базовый шум
update products set purchases_count =
  coalesce(reviews_count, 0) * (8 + abs(hashtext(id::text || 'p')) % 13)
  + abs(hashtext(id::text || 'q')) % 350
where purchases_count is null;

-- вес, граммы: диапазон по категории
update products set weight_g = case category
  when 'audio'       then  40 + abs(hashtext(id::text || 'w')) % 360
  when 'electronics' then  80 + abs(hashtext(id::text || 'w')) % 540
  when 'computers'   then 150 + abs(hashtext(id::text || 'w')) % 1850
  when 'appliances'  then 800 + abs(hashtext(id::text || 'w')) % 5200
  when 'kitchen'     then 300 + abs(hashtext(id::text || 'w')) % 2700
  when 'home'        then 200 + abs(hashtext(id::text || 'w')) % 2800
  when 'fashion'     then 150 + abs(hashtext(id::text || 'w')) % 1050
  when 'beauty'      then  60 + abs(hashtext(id::text || 'w')) % 540
  when 'sport'       then 200 + abs(hashtext(id::text || 'w')) % 2300
  when 'study'       then 100 + abs(hashtext(id::text || 'w')) % 900
  when 'kids'        then 150 + abs(hashtext(id::text || 'w')) % 1350
  when 'travel'      then 250 + abs(hashtext(id::text || 'w')) % 3250
  else 100 + abs(hashtext(id::text || 'w')) % 900
end where weight_g is null;

-- гарантия: 6/12/24 мес (12 чаще)
update products set warranty_months =
  (array[6,12,12,24])[1 + abs(hashtext(id::text || 'g')) % 4]
where warranty_months is null;
