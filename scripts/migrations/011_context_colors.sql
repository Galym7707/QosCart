-- 011: цвет из контекста цветового поискового запроса (Google Shopping матчит по атрибутам
-- листинга, а не только названию) — для свежих вставок navy-сидов без цвета в тайтле
update products set color = 'blue'
where color is null
  and category = 'fashion' and subcategory = 'accessories'
  and fetched_at > now() - interval '30 minutes'
  and title ~* '\m(polo|hoodie)\M';
