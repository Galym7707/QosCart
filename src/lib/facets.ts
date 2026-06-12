// src/lib/facets.ts — каскадные характеристики по подкатегориям (мок-схема)
export type Facet = { key: string; ru: string; values: string[]; unit?: string };

export const FACETS: Record<string, Facet[]> = {
  smartphones: [
    { key: 'ram_gb', ru: 'Оперативная память', values: ['6', '8', '12'], unit: 'ГБ' },
    { key: 'storage_gb', ru: 'Встроенная память', values: ['128', '256', '512'], unit: 'ГБ' },
    { key: 'battery_mah', ru: 'Аккумулятор', values: ['4500', '5000', '5500'], unit: 'мА·ч' },
  ],
  tablets: [
    { key: 'storage_gb', ru: 'Память', values: ['64', '128', '256'], unit: 'ГБ' },
    { key: 'screen_in', ru: 'Диагональ', values: ['8', '10', '11', '13'], unit: '"' },
  ],
  laptops: [
    { key: 'ram_gb', ru: 'Оперативная память', values: ['8', '16', '32'], unit: 'ГБ' },
    { key: 'cpu', ru: 'Процессор', values: ['Intel Core i5', 'Intel Core i7', 'AMD Ryzen 5', 'AMD Ryzen 7', 'Apple M3'] },
    { key: 'ssd_gb', ru: 'SSD', values: ['256', '512', '1024'], unit: 'ГБ' },
  ],
  wearables: [
    { key: 'display', ru: 'Экран', values: ['AMOLED', 'LCD'] },
    { key: 'water', ru: 'Влагозащита', values: ['IP68', 'IPX7', 'Нет'] },
  ],
  chargers: [
    { key: 'power_w', ru: 'Мощность', values: ['20', '45', '65', '100'], unit: 'Вт' },
  ],
  earbuds: [
    { key: 'anc', ru: 'Шумоподавление', values: ['Да', 'Нет'] },
    { key: 'battery_h', ru: 'Автономность', values: ['5', '7', '9', '12'], unit: 'ч' },
  ],
  headphones: [
    { key: 'anc', ru: 'Шумоподавление', values: ['Да', 'Нет'] },
    { key: 'battery_h', ru: 'Автономность', values: ['20', '30', '40', '60'], unit: 'ч' },
  ],
  speakers: [
    { key: 'water', ru: 'Влагозащита', values: ['IPX5', 'IPX7', 'Нет'] },
    { key: 'battery_h', ru: 'Автономность', values: ['10', '15', '20', '24'], unit: 'ч' },
  ],
  peripherals: [
    { key: 'connection', ru: 'Подключение', values: ['Проводное', 'Bluetooth', '2.4 ГГц'] },
  ],
  storage: [
    { key: 'capacity', ru: 'Объём', values: ['256 ГБ', '512 ГБ', '1 ТБ', '2 ТБ'] },
  ],
};

export function facetsForSub(sub: string | null | undefined): Facet[] {
  return sub ? (FACETS[sub] ?? []) : [];
}

export function facetValueLabel(f: Facet, v: string): string {
  return f.unit ? `${v} ${f.unit}` : v;
}
