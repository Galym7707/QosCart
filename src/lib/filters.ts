// src/lib/filters.ts
import { currentPrice } from './ladder';

export type SortKey = 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'savings' | 'popularity' | 'newest';
export const SORT_LABELS: Record<SortKey, string> = {
  relevance: 'По релевантности', price_asc: 'Дешевле', price_desc: 'Дороже',
  rating: 'По рейтингу', savings: 'Выгода группы', popularity: 'Популярные', newest: 'Новинки',
};

export type FilterState = {
  cat: string | null; sub: string | null;
  min: number | null; max: number | null; rating: number | null;
  pool: boolean; liked: boolean; q: string;
};
export const DEFAULT_FILTERS: FilterState = { cat: null, sub: null, min: null, max: null, rating: null, pool: false, liked: false, q: '' };

export type ProductLike = {
  id: string; title: string; category: string; subcategory: string | null;
  price_kzt: number; rating: number | null; reviews_count: number | null;
  fetched_at: string; score?: number;
};
export type CatalogCtx = { likedIds: Set<string>; poolParticipants: Map<string, number> };

export function applyFilters<T extends ProductLike>(items: T[], f: FilterState, ctx: CatalogCtx): T[] {
  const q = f.q.trim().toLowerCase();
  return items.filter(p =>
    (!f.cat || p.category === f.cat) &&
    (!f.sub || p.subcategory === f.sub) &&
    (f.min == null || p.price_kzt >= f.min) &&
    (f.max == null || p.price_kzt <= f.max) &&
    (f.rating == null || (p.rating ?? 0) >= f.rating) &&
    (!f.pool || ctx.poolParticipants.has(p.id)) &&
    (!f.liked || ctx.likedIds.has(p.id)) &&
    (!q || p.title.toLowerCase().includes(q))
  );
}

export function applySort<T extends ProductLike>(items: T[], key: SortKey, ctx: CatalogCtx): T[] {
  const a = [...items];
  const savingsNow = (p: ProductLike) => p.price_kzt - currentPrice(p.price_kzt, ctx.poolParticipants.get(p.id) ?? 1);
  switch (key) {
    case 'price_asc':  return a.sort((x, y) => x.price_kzt - y.price_kzt);
    case 'price_desc': return a.sort((x, y) => y.price_kzt - x.price_kzt);
    case 'rating':     return a.sort((x, y) => (y.rating ?? 0) - (x.rating ?? 0));
    case 'popularity': return a.sort((x, y) => (y.reviews_count ?? 0) - (x.reviews_count ?? 0));
    case 'newest':     return a.sort((x, y) => (Date.parse(y.fetched_at) || 0) - (Date.parse(x.fetched_at) || 0));
    case 'savings':    return a.sort((x, y) => savingsNow(y) - savingsNow(x));
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
  if (sort !== 'relevance') sp.set('sort', sort);
  return sp.toString();
}
