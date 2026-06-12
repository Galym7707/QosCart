-- 004: jsonb-характеристики по подкатегориям (мок, детерминирован hashtext)
alter table products add column if not exists attrs jsonb;

update products set attrs = jsonb_build_object(
  'ram_gb',      (array['6','8','12'])[1 + abs(hashtext(id::text || 'a1')) % 3],
  'storage_gb',  (array['128','256','512'])[1 + abs(hashtext(id::text || 'a2')) % 3],
  'battery_mah', (array['4500','5000','5500'])[1 + abs(hashtext(id::text || 'a3')) % 3]
) where subcategory = 'smartphones' and attrs is null;

update products set attrs = jsonb_build_object(
  'storage_gb', (array['64','128','256'])[1 + abs(hashtext(id::text || 'a1')) % 3],
  'screen_in',  (array['8','10','11','13'])[1 + abs(hashtext(id::text || 'a2')) % 4]
) where subcategory = 'tablets' and attrs is null;

update products set attrs = jsonb_build_object(
  'ram_gb', (array['8','16','32'])[1 + abs(hashtext(id::text || 'a1')) % 3],
  'cpu',    (array['Intel Core i5','Intel Core i7','AMD Ryzen 5','AMD Ryzen 7','Apple M3'])[1 + abs(hashtext(id::text || 'a2')) % 5],
  'ssd_gb', (array['256','512','1024'])[1 + abs(hashtext(id::text || 'a3')) % 3]
) where subcategory = 'laptops' and attrs is null;

update products set attrs = jsonb_build_object(
  'display', (array['AMOLED','LCD'])[1 + abs(hashtext(id::text || 'a1')) % 2],
  'water',   (array['IP68','IPX7','Нет'])[1 + abs(hashtext(id::text || 'a2')) % 3]
) where subcategory = 'wearables' and attrs is null;

update products set attrs = jsonb_build_object(
  'power_w', (array['20','45','65','100'])[1 + abs(hashtext(id::text || 'a1')) % 4]
) where subcategory = 'chargers' and attrs is null;

update products set attrs = jsonb_build_object(
  'anc',       (array['Да','Нет'])[1 + abs(hashtext(id::text || 'a1')) % 2],
  'battery_h', (array['5','7','9','12'])[1 + abs(hashtext(id::text || 'a2')) % 4]
) where subcategory = 'earbuds' and attrs is null;

update products set attrs = jsonb_build_object(
  'anc',       (array['Да','Нет'])[1 + abs(hashtext(id::text || 'a1')) % 2],
  'battery_h', (array['20','30','40','60'])[1 + abs(hashtext(id::text || 'a2')) % 4]
) where subcategory = 'headphones' and attrs is null;

update products set attrs = jsonb_build_object(
  'water',     (array['IPX5','IPX7','Нет'])[1 + abs(hashtext(id::text || 'a1')) % 3],
  'battery_h', (array['10','15','20','24'])[1 + abs(hashtext(id::text || 'a2')) % 4]
) where subcategory = 'speakers' and attrs is null;

update products set attrs = jsonb_build_object(
  'connection', (array['Проводное','Bluetooth','2.4 ГГц'])[1 + abs(hashtext(id::text || 'a1')) % 3]
) where subcategory = 'peripherals' and attrs is null;

update products set attrs = jsonb_build_object(
  'capacity', (array['256 ГБ','512 ГБ','1 ТБ','2 ТБ'])[1 + abs(hashtext(id::text || 'a1')) % 4]
) where subcategory = 'storage' and attrs is null;

update products set attrs = '{}'::jsonb where attrs is null;
