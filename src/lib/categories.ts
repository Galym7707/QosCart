// src/lib/categories.ts
export type Sub = { slug: string; ru: string; queries: [string, string] };
export type Category = { slug: string; ru: string; subs: Sub[] };

export const CATEGORIES: Category[] = [
  { slug: 'electronics', ru: 'Электроника', subs: [
    { slug: 'smartphones', ru: 'Смартфоны', queries: ['budget smartphone 128gb', 'smartphone android'] },
    { slug: 'wearables', ru: 'Часы и трекеры', queries: ['smart watch', 'fitness tracker'] },
    { slug: 'chargers', ru: 'Зарядки и кабели', queries: ['power bank fast charging', 'usb c charger 65w'] },
  ]},
  { slug: 'audio', ru: 'Аудио', subs: [
    { slug: 'earbuds', ru: 'Наушники TWS', queries: ['wireless earbuds', 'noise cancelling earbuds'] },
    { slug: 'headphones', ru: 'Полноразмерные', queries: ['over ear headphones', 'noise cancelling headphones'] },
    { slug: 'speakers', ru: 'Колонки', queries: ['bluetooth speaker', 'portable speaker waterproof'] },
  ]},
  { slug: 'computers', ru: 'Компьютеры', subs: [
    { slug: 'laptops', ru: 'Ноутбуки и ПК', queries: ['laptop 15 inch', 'mini pc desktop'] },
    { slug: 'tablets', ru: 'Планшеты', queries: ['android tablet 10 inch', 'tablet for students'] },
    { slug: 'peripherals', ru: 'Периферия', queries: ['mechanical keyboard', 'wireless mouse ergonomic'] },
    { slug: 'storage', ru: 'Хабы и накопители', queries: ['usb c hub', 'external ssd 1tb'] },
    { slug: 'office', ru: 'Рабочее место', queries: ['laptop stand aluminum', 'monitor light bar'] },
  ]},
  { slug: 'appliances', ru: 'Бытовая техника', subs: [
    { slug: 'cleaning', ru: 'Уборка', queries: ['robot vacuum budget', 'cordless vacuum cleaner'] },
    { slug: 'climate', ru: 'Климат', queries: ['air humidifier', 'air purifier hepa'] },
    { slug: 'garment', ru: 'Уход за одеждой', queries: ['garment steamer', 'steam iron station'] },
  ]},
  { slug: 'home', ru: 'Дом и уют', subs: [
    { slug: 'bedding', ru: 'Спальня', queries: ['bed sheets set', 'memory foam pillow'] },
    { slug: 'lighting', ru: 'Свет', queries: ['desk lamp led', 'smart light bulb'] },
    { slug: 'decor', ru: 'Декор', queries: ['wall shelf set', 'area rug modern'] },
  ]},
  { slug: 'kitchen', ru: 'Кухня', subs: [
    { slug: 'small_appliances', ru: 'Техника для кухни', queries: ['electric kettle', 'air fryer'] },
    { slug: 'coffee', ru: 'Кофе и чай', queries: ['drip coffee maker', 'french press coffee'] },
    { slug: 'cookware', ru: 'Посуда и хранение', queries: ['kitchen knife set', 'food storage containers set'] },
  ]},
  { slug: 'fashion', ru: 'Одежда и обувь', subs: [
    { slug: 'sneakers', ru: 'Кроссовки', queries: ['sneakers unisex', 'running shoes'] },
    { slug: 'bags', ru: 'Сумки и рюкзаки', queries: ['crossbody bag', 'laptop backpack'] },
    { slug: 'accessories', ru: 'Аксессуары', queries: ['sunglasses polarized', 'minimalist wallet'] },
  ]},
  { slug: 'beauty', ru: 'Красота', subs: [
    { slug: 'hair', ru: 'Волосы', queries: ['ionic hair dryer', 'hair straightener'] },
    { slug: 'skincare', ru: 'Уход за кожей', queries: ['led face mask', 'facial cleansing brush'] },
    { slug: 'oral', ru: 'Гигиена', queries: ['electric toothbrush', 'water flosser'] },
  ]},
  { slug: 'sport', ru: 'Спорт', subs: [
    { slug: 'fitness', ru: 'Фитнес', queries: ['yoga mat', 'resistance bands set'] },
    { slug: 'outdoor', ru: 'Туризм', queries: ['camping tent 2 person', 'trekking poles'] },
    { slug: 'gear', ru: 'Экипировка', queries: ['insulated water bottle', 'gym duffel bag'] },
  ]},
  { slug: 'study', ru: 'Учёба', subs: [
    { slug: 'backpacks', ru: 'Рюкзаки', queries: ['student backpack usb', 'pencil case large'] },
    { slug: 'desk', ru: 'За столом', queries: ['tablet stand adjustable', 'reading book light'] },
    { slug: 'stationery', ru: 'Канцелярия', queries: ['notebook set a5', 'gel pens set'] },
  ]},
  { slug: 'kids', ru: 'Детям', subs: [
    { slug: 'toys', ru: 'Игрушки', queries: ['building blocks set kids', 'remote control car kids'] },
    { slug: 'learning', ru: 'Развитие', queries: ['kids educational tablet', 'science kit for kids'] },
    { slug: 'outdoors_kids', ru: 'Прогулки', queries: ['kids scooter', 'baby monitor'] },
  ]},
  { slug: 'travel', ru: 'Путешествия', subs: [
    { slug: 'luggage', ru: 'Чемоданы', queries: ['carry on luggage', 'packing cubes set'] },
    { slug: 'travel_gadgets', ru: 'Гаджеты в дорогу', queries: ['universal travel adapter', 'luggage scale digital'] },
    { slug: 'comfort', ru: 'Комфорт', queries: ['neck pillow memory foam', 'travel organizer bag'] },
  ]},
];

export const LEGACY_MAP: Record<string, string> = {
  tech: 'electronics', study: 'study', home: 'home', fashion: 'fashion', sport: 'sport', beauty: 'beauty',
};

export function allQueryJobs(): { cat: string; sub: string; query: string }[] {
  return CATEGORIES.flatMap(c => c.subs.flatMap(s => s.queries.map(query => ({ cat: c.slug, sub: s.slug, query }))));
}

export function parentLabel(slug: string): string {
  return CATEGORIES.find(c => c.slug === slug)?.ru ?? slug;
}

export function subLabel(catSlug: string, subSlug: string): string {
  return CATEGORIES.find(c => c.slug === catSlug)?.subs.find(s => s.slug === subSlug)?.ru ?? subSlug;
}
