-- 010: computers слит в electronics (компьютеры — это электроника)
update products set category = 'electronics' where category = 'computers';
update users set interests = array_replace(interests, 'computers', 'electronics') where 'computers' = any(interests);
