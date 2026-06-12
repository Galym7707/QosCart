// src/lib/attributes.ts — словарь мок-атрибутов (цвета)
export type Color = { slug: string; ru: string; hex: string };

export const COLORS: Color[] = [
  { slug: 'black',  ru: 'Чёрный',     hex: '#1f1f23' },
  { slug: 'white',  ru: 'Белый',      hex: '#f4f4f5' },
  { slug: 'gray',   ru: 'Серый',      hex: '#9ca3af' },
  { slug: 'silver', ru: 'Серебристый',hex: '#d4d4d8' },
  { slug: 'blue',   ru: 'Синий',      hex: '#3b82f6' },
  { slug: 'red',    ru: 'Красный',    hex: '#ef4444' },
  { slug: 'green',  ru: 'Зелёный',    hex: '#22c55e' },
  { slug: 'beige',  ru: 'Бежевый',    hex: '#d6c7a1' },
  { slug: 'pink',   ru: 'Розовый',    hex: '#ec4899' },
  { slug: 'yellow', ru: 'Жёлтый',     hex: '#eab308' },
  { slug: 'gold',   ru: 'Золотистый', hex: '#d4af37' },
  { slug: 'purple', ru: 'Фиолетовый', hex: '#8b5cf6' },
  { slug: 'orange', ru: 'Оранжевый',  hex: '#f97316' },
  { slug: 'brown',  ru: 'Коричневый', hex: '#92400e' },
];

const BY_SLUG = new Map(COLORS.map(c => [c.slug, c]));

export function colorLabel(slug: string | null | undefined): string {
  return slug ? (BY_SLUG.get(slug)?.ru ?? slug) : '—';
}
export function colorHex(slug: string | null | undefined): string {
  return slug ? (BY_SLUG.get(slug)?.hex ?? '#e4e4e7') : '#e4e4e7';
}

export function formatPurchases(n: number | null | undefined): string {
  if (!n) return '';
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.', ',').replace(',0', '')} тыс. купили`;
  return `${n} купили`;
}
