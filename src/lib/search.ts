// src/lib/search.ts — русскоязычный поиск по англоязычному каталогу:
// транслитерация (самсунг→samsung) + словарь брендов и товарных слов (наушники→earbuds/headphones)
const TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i',
  й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
  у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y',
  ь: '', э: 'e', ю: 'yu', я: 'ya',
};

export function translit(word: string): string {
  return word.toLowerCase().split('').map(ch => TRANSLIT[ch] ?? ch).join('');
}

// словарь: ru-слово → варианты в английских названиях товаров
const DICT: Record<string, string[]> = {
  // бренды с нефонетичным написанием
  'эппл': ['apple'], 'апл': ['apple'], 'айфон': ['iphone'], 'айпад': ['ipad'], 'макбук': ['macbook'],
  'сони': ['sony'], 'хуавей': ['huawei'], 'сяоми': ['xiaomi'], 'шаоми': ['xiaomi'], 'ксяоми': ['xiaomi'], 'ксиоми': ['xiaomi'],
  'джбл': ['jbl'], 'жбл': ['jbl'], 'бош': ['bosch'], 'филипс': ['philips'], 'леново': ['lenovo'],
  'асус': ['asus'], 'асер': ['acer'], 'эйсер': ['acer'], 'делл': ['dell'], 'хп': ['hp'], 'эйчпи': ['hp'],
  'найк': ['nike'], 'адидас': ['adidas'], 'пума': ['puma'], 'анкер': ['anker'], 'логитек': ['logitech'],
  // товарные слова
  'наушники': ['earbuds', 'headphones', 'headset'], 'наушник': ['earbuds', 'headphones'],
  'телефон': ['phone', 'smartphone'], 'смартфон': ['smartphone', 'phone'],
  'ноутбук': ['laptop'], 'ноут': ['laptop'], 'планшет': ['tablet'], 'пк': ['pc', 'desktop'], 'компьютер': ['pc', 'computer', 'desktop'],
  'колонка': ['speaker'], 'колонки': ['speaker'], 'динамик': ['speaker'],
  'клавиатура': ['keyboard'], 'мышь': ['mouse'], 'мышка': ['mouse'],
  'зарядка': ['charger', 'charging'], 'зарядник': ['charger'], 'повербанк': ['power bank', 'powerbank'], 'пауэрбанк': ['power bank'],
  'кабель': ['cable'], 'хаб': ['hub'], 'ссд': ['ssd'], 'диск': ['ssd', 'drive'],
  'часы': ['watch'], 'трекер': ['tracker'], 'браслет': ['band', 'tracker'],
  'чайник': ['kettle'], 'пылесос': ['vacuum'], 'увлажнитель': ['humidifier'], 'очиститель': ['purifier'],
  'утюг': ['iron', 'steamer'], 'отпариватель': ['steamer'], 'фен': ['hair dryer', 'dryer'],
  'кофеварка': ['coffee maker', 'coffee'], 'кофе': ['coffee'], 'фритюрница': ['air fryer', 'fryer'], 'аэрогриль': ['air fryer'],
  'нож': ['knife'], 'ножи': ['knife'], 'контейнер': ['container', 'storage'], 'посуда': ['cookware'],
  'лампа': ['lamp', 'light'], 'светильник': ['lamp', 'light'], 'лампочка': ['bulb'],
  'подушка': ['pillow'], 'простыни': ['sheets'], 'постельное': ['sheets', 'bedding'], 'ковер': ['rug'], 'ковёр': ['rug'], 'полка': ['shelf'],
  'кроссовки': ['sneakers', 'shoes', 'running'], 'обувь': ['shoes', 'sneakers'], 'сумка': ['bag'], 'рюкзак': ['backpack'],
  'очки': ['sunglasses'], 'кошелек': ['wallet'], 'кошелёк': ['wallet'],
  'щетка': ['brush', 'toothbrush'], 'щётка': ['brush', 'toothbrush'], 'ирригатор': ['flosser'], 'маска': ['mask'],
  'выпрямитель': ['straightener'], 'плойка': ['straightener', 'curler'],
  'коврик': ['mat'], 'бутылка': ['bottle'], 'палатка': ['tent'], 'палки': ['poles'], 'гантели': ['dumbbell'], 'эспандер': ['resistance bands', 'bands'],
  'пенал': ['pencil case'], 'тетрадь': ['notebook'], 'ручки': ['pens'], 'ручка': ['pen'],
  'самокат': ['scooter'], 'конструктор': ['blocks', 'building'], 'игрушка': ['toy'], 'машинка': ['car'],
  'чемодан': ['luggage', 'suitcase'], 'органайзер': ['organizer', 'packing'], 'адаптер': ['adapter'], 'переходник': ['adapter'],
  'весы': ['scale'], 'монитор': ['monitor'], 'подставка': ['stand'], 'держатель': ['stand', 'holder', 'mount'],
};

function variantsFor(token: string): string[] {
  const v = [token];
  if (/[а-яё]/.test(token)) {
    v.push(translit(token));
    const dict = DICT[token];
    if (dict) v.push(...dict);
  }
  return v;
}

// каждый токен запроса должен встретиться в названии хотя бы одним из вариантов (И между токенами)
export function matchesQuery(title: string, query: string): boolean {
  const t = title.toLowerCase();
  const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return true;
  return tokens.every(tok => variantsFor(tok).some(v => v && t.includes(v)));
}
