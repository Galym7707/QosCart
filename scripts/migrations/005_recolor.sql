-- 005: цвет из названия товара (совпадает с фото), фолбэк — взвешенный детерминированный
update products set color = case
  when title ~* '\mrose gold\M'                       then 'gold'
  when title ~* '\mblack\M'                           then 'black'
  when title ~* '\mwhite\M'                           then 'white'
  when title ~* '\msilver\M'                          then 'silver'
  when title ~* '\m(gray|grey|graphite|charcoal)\M'   then 'gray'
  when title ~* '\m(blue|navy)\M'                     then 'blue'
  when title ~* '\m(red|crimson|burgundy)\M'          then 'red'
  when title ~* '\m(green|olive|mint)\M'              then 'green'
  when title ~* '\m(pink|rose|fuchsia)\M'             then 'pink'
  when title ~* '\m(beige|khaki|tan|cream|ivory)\M'   then 'beige'
  when title ~* '\myellow\M'                          then 'yellow'
  when title ~* '\m(gold|golden)\M'                   then 'gold'
  else (array[
    'black','black','black','black','white','white','white','gray','gray','silver',
    'blue','blue','blue','red','red','green','green','beige','beige','pink','pink','yellow','gold'
  ])[1 + abs(hashtext(id::text || 'recolor')) % 23]
end;
