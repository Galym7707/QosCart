-- 007: одежда/бельё, случайно прилетевшие из SerpAPI в неодёжные категории → fashion
update products set category = 'fashion', subcategory = 'accessories'
where category in ('electronics','audio','computers','appliances','kitchen','study','sport','travel','kids','home','beauty')
  and title ~* '\m(thong|underwear|panties|bikini|bra|lingerie|v-string|t-?shirt|hoodie|sweatpants|sweater|cardigan|jeans|leggings|socks|boxer briefs?)\M';
