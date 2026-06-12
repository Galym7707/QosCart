// src/lib/filters.ts

export type SortKey =
  | 'relevance' | 'price_asc' | 'price_desc' | 'rating'
  | 'purchases' | 'popularity' | 'year' | 'newest' | 'weight' | 'warranty';
export const SORT_LABELS: Record<SortKey, string> = {
  relevance: 'По релевантности', price_asc: 'Дешевле', price_desc: 'Дороже',
  rating: 'По рейтингу',
  purchases: 'Чаще покупают', popularity: 'Больше отзывов',
  year: 'Новее по году', newest: 'Недавно добавлены',
  weight: 'Легче', warranty: 'Гарантия дольше',
};

export type FilterState = {
  cat: string | null; sub: string | null;
  min: number | null; max: number | null; rating: number | null;
  pool: boolean; liked: boolean; q: string;
  colors: string[];
  attrs: Record<string, string[]>;
};
export const DEFAULT_FILTERS: FilterState = {
  cat: null, sub: null, min: null, max: null, rating: null, pool: false, liked: false, q: '',
  colors: [], attrs: {},
};

export type ProductLike = {
  id: string; title: string; category: string; subcategory: string | null;
  price_kzt: number; rating: number | null; reviews_count: number | null;
  fetched_at: string; score?: number;
  color?: string | null; release_year?: number | null; purchases_count?: number | null;
  weight_g?: number | null; warranty_months?: number | null;
  attrs?: Record<string, string | number | null> | null;
};
export type CatalogCtx = { likedIds: Set<string>; poolParticipants: Map<string, number> };

import { matchesQuery } from './search';

export function applyFilters<T extends ProductLike>(items: T[], f: FilterState, ctx: CatalogCtx): T[] {
  const q = f.q.trim();
  return items.filter(p =>
    (!f.cat || p.category === f.cat) &&
    (!f.sub || p.subcategory === f.sub) &&
    (f.min == null || p.price_kzt >= f.min) &&
    (f.max == null || p.price_kzt <= f.max) &&
    (f.rating == null || (p.rating ?? 0) >= f.rating) &&
    (!f.pool || ctx.poolParticipants.has(p.id)) &&
    (!f.liked || ctx.likedIds.has(p.id)) &&
    (!f.colors.length || (p.color != null && f.colors.includes(p.color))) &&
    Object.entries(f.attrs).every(([k, vals]) => !vals.length || vals.includes(String((p.attrs ?? {})[k] ?? ''))) &&
    (!q || matchesQuery(p.title, q))
  );
}

export function applySort<T extends ProductLike>(items: T[], key: SortKey, ctx: CatalogCtx): T[] {
  const a = [...items];
  switch (key) {
    case 'price_asc':  return a.sort((x, y) => x.price_kzt - y.price_kzt);
    case 'price_desc': return a.sort((x, y) => y.price_kzt - x.price_kzt);
    case 'rating':     return a.sort((x, y) => (y.rating ?? 0) - (x.rating ?? 0));
    case 'popularity': return a.sort((x, y) => (y.reviews_count ?? 0) - (x.reviews_count ?? 0));
    case 'newest':     return a.sort((x, y) => (Date.parse(y.fetched_at) || 0) - (Date.parse(x.fetched_at) || 0));
    case 'purchases':  return a.sort((x, y) => (y.purchases_count ?? 0) - (x.purchases_count ?? 0));
    case 'year':       return a.sort((x, y) => (y.release_year ?? 0) - (x.release_year ?? 0));
    case 'weight':     return a.sort((x, y) => (x.weight_g ?? Number.MAX_SAFE_INTEGER) - (y.weight_g ?? Number.MAX_SAFE_INTEGER));
    case 'warranty':   return a.sort((x, y) => (y.warranty_months ?? 0) - (x.warranty_months ?? 0));
    case 'relevance':
    default:           return a.sort((x, y) => (y.score ?? 0) - (x.score ?? 0));
  }
}

const SORT_KEYS = Object.keys(SORT_LABELS) as SortKey[];

export function filtersFromParams(sp: URLSearchParams): { filters: FilterState; sort: SortKey } {
  const num = (k: string) => {
    if (!sp.has(k) || sp.get(k) === '') return null;
    const v = Number(sp.get(k));
    return Number.isNaN(v) ? null : v;
  };
  const sort = (sp.get('sort') as SortKey) ?? 'relevance';
  return {
    filters: {
      cat: sp.get('cat') || null, sub: sp.get('sub') || null,
      min: num('min'), max: num('max'), rating: num('rating'),
      pool: sp.get('pool') === '1', liked: sp.get('liked') === '1', q: sp.get('q') ?? '',
      colors: sp.get('colors')?.split(',').filter(Boolean) ?? [],
      attrs: [...sp.keys()].filter(k => k.startsWith('a_')).reduce((acc, k) => {
        const vals = sp.get(k)?.split('|').filter(Boolean) ?? [];
        if (vals.length) acc[k.slice(2)] = vals;
        return acc;
      }, {} as Record<string, string[]>),
    },
    sort: SORT_KEYS.includes(sort) ? sort : 'relevance',
  };
}

export function paramsFromFilters(f: FilterState, sort: SortKey): string {
  const sp = new URLSearchParams();
  if (f.cat) sp.set('cat', f.cat);
  if (f.sub) sp.set('sub', f.sub);
  if (f.min != null) sp.set('min', String(f.min));
  if (f.max != null) sp.set('max', String(f.max));
  if (f.rating != null) sp.set('rating', String(f.rating));
  if (f.pool) sp.set('pool', '1');
  if (f.liked) sp.set('liked', '1');
  if (f.q) sp.set('q', f.q);
  if (f.colors.length) sp.set('colors', f.colors.join(','));
  for (const [k, vals] of Object.entries(f.attrs)) if (vals.length) sp.set(`a_${k}`, vals.join('|'));
  if (sort !== 'relevance') sp.set('sort', sort);
  return sp.toString();
}
