-- 009: ноутбуки/ПК и планшеты переезжают из electronics в computers (как на Kaspi/Ozon)
update products set category = 'computers' where subcategory in ('laptops', 'tablets') and category = 'electronics';
