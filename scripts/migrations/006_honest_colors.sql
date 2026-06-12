-- 006 v2: цвет ТОЛЬКО из названия (расширенный словарь); иначе NULL
update products set color = case
  when title ~* '\mrose gold\M'                              then 'gold'
  when title ~* '\m(black|midnight|onyx)\M'                  then 'black'
  when title ~* '\mwhite\M'                                  then 'white'
  when title ~* '\msilver\M'                                 then 'silver'
  when title ~* '\m(gray|grey|graphite|charcoal|slate)\M'    then 'gray'
  when title ~* '\m(blue|navy|teal|turquoise|aqua)\M'        then 'blue'
  when title ~* '\m(red|crimson|burgundy|maroon)\M'          then 'red'
  when title ~* '\m(green|olive|mint|sage|emerald)\M'        then 'green'
  when title ~* '\m(pink|rose|fuchsia|blush)\M'              then 'pink'
  when title ~* '\m(beige|khaki|tan|cream|ivory|sand)\M'     then 'beige'
  when title ~* '\m(yellow|mustard)\M'                       then 'yellow'
  when title ~* '\m(gold|golden|champagne)\M'                then 'gold'
  when title ~* '\m(purple|violet|lavender|lilac|plum)\M'    then 'purple'
  when title ~* '\m(orange|coral|peach)\M'                   then 'orange'
  when title ~* '\m(brown|chocolate|walnut|espresso|mocha)\M' then 'brown'
  else null
end;
