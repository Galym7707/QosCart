-- 006 v4: цвет только из названия; бренды/фразы-ловушки вырезаются ДО распознавания
with cleaned as (
  select id, regexp_replace(
    title,
    '(old\s+navy|black\s*[+&]?\s*decker|ice\s+cream|cream\s+cheese|white\s+house|red\s+bull|golden\s+state|united\s+by\s+blue|blueair\s+blue|blue\s+sky|alpha-?aqua|archer\s+(and|&)\s+olive|go\s+green\s+power|red\s+rooster|red\s+light(\s+therapy)?|peach\s+bands|plum\s+beauty|purple\s+(harmony|dreamlayer|mattress)|spice\s+girls?|tru\s+red)',
    ' ', 'gi'
  ) as t from products
)
update products p set color = case
  when c.t ~* '\mrose gold\M'                              then 'gold'
  when c.t ~* '\m(black|midnight|onyx)\M'                  then 'black'
  when c.t ~* '\mwhite\M'                                  then 'white'
  when c.t ~* '\msilver\M'                                 then 'silver'
  when c.t ~* '\m(gray|grey|graphite|charcoal|slate)\M'    then 'gray'
  when c.t ~* '\m(blue|navy|teal|turquoise|aqua)\M'        then 'blue'
  when c.t ~* '\m(red|crimson|burgundy|maroon)\M'          then 'red'
  when c.t ~* '\m(green|olive|mint|sage)\M'                then 'green'
  when c.t ~* '\m(pink|rose|fuchsia|blush)\M'              then 'pink'
  when c.t ~* '\m(beige|khaki|tan|cream|ivory|sand)\M'     then 'beige'
  when c.t ~* '\m(yellow|mustard|canary)\M'                then 'yellow'
  when c.t ~* '\m(gold|golden|champagne)\M'                then 'gold'
  when c.t ~* '\m(purple|violet|lavender|lilac|plum)\M'    then 'purple'
  when c.t ~* '\m(orange|coral|peach)\M'                   then 'orange'
  when c.t ~* '\m(brown|chocolate|walnut|espresso|mocha|cognac)\M' then 'brown'
  else null
end
from cleaned c where c.id = p.id;
