// tests/filters.test.ts
import { describe, it, expect } from 'vitest';
import { DEFAULT_FILTERS, applyFilters, applySort, filtersFromParams, paramsFromFilters, FilterState } from '../src/lib/filters';

const P = (over: Partial<any> = {}) => ({
  id: 'p1', title: 'Anker PowerCore', category: 'electronics', subcategory: 'chargers',
  price_kzt: 13510, rating: 4.6, reviews_count: 1280, fetched_at: '2026-06-10T10:00:00Z', score: 50,
  color: 'black', release_year: 2024, purchases_count: 5000, weight_g: 300, warranty_months: 12, ...over,
});
const items = [
  P({ id: 'a', title: 'Anker PowerCore', price_kzt: 13510, rating: 4.6, reviews_count: 1280, score: 80, color: 'white', release_year: 2024, purchases_count: 5000, weight_g: 300, warranty_months: 12 }),
  P({ id: 'b', title: 'JBL Speaker', category: 'audio', subcategory: 'speakers', price_kzt: 25000, rating: 4.2, reviews_count: 300, fetched_at: '2026-06-11T10:00:00Z', score: 60, color: 'red', release_year: 2026, purchases_count: 900, weight_g: 600, warranty_months: 24 }),
  P({ id: 'c', title: 'Cheap cable', price_kzt: 1500, rating: 3.0, reviews_count: 12, fetched_at: '2026-06-09T10:00:00Z', score: 20, color: 'black', release_year: 2022, purchases_count: 12000, weight_g: 50, warranty_months: 6 }),
];
const ctx = { likedIds: new Set(['b']), poolParticipants: new Map([['a', 9]]) };
const F = (over: Partial<FilterState> = {}): FilterState => ({ ...DEFAULT_FILTERS, ...over });

describe('applyFilters', () => {
  it('категория и подкатегория', () => {
    expect(applyFilters(items, { ...DEFAULT_FILTERS, cat: 'audio' }, ctx).map(i => i.id)).toEqual(['b']);
    expect(applyFilters(items, { ...DEFAULT_FILTERS, cat: 'electronics', sub: 'chargers' }, ctx)).toHaveLength(2);
  });
  it('ценовой диапазон и мин. рейтинг', () => {
    expect(applyFilters(items, { ...DEFAULT_FILTERS, min: 2000, max: 20000 }, ctx).map(i => i.id)).toEqual(['a']);
    expect(applyFilters(items, { ...DEFAULT_FILTERS, rating: 4 }, ctx).map(i => i.id)).toEqual(['a', 'b']);
  });
  it('только с активным пулом / только избранное', () => {
    expect(applyFilters(items, { ...DEFAULT_FILTERS, pool: true }, ctx).map(i => i.id)).toEqual(['a']);
    expect(applyFilters(items, { ...DEFAULT_FILTERS, liked: true }, ctx).map(i => i.id)).toEqual(['b']);
  });
  it('поиск по подстроке без регистра', () => {
    expect(applyFilters(items, { ...DEFAULT_FILTERS, q: 'anker' }, ctx).map(i => i.id)).toEqual(['a']);
  });
});

describe('applySort', () => {
  it('price_asc / price_desc / rating / popularity / newest / relevance', () => {
    expect(applySort(items, 'price_asc', ctx).map(i => i.id)).toEqual(['c', 'a', 'b']);
    expect(applySort(items, 'price_desc', ctx).map(i => i.id)).toEqual(['b', 'a', 'c']);
    expect(applySort(items, 'rating', ctx).map(i => i.id)).toEqual(['a', 'b', 'c']);
    expect(applySort(items, 'popularity', ctx).map(i => i.id)).toEqual(['a', 'b', 'c']);
    expect(applySort(items, 'newest', ctx).map(i => i.id)).toEqual(['b', 'a', 'c']);
    expect(applySort(items, 'relevance', ctx).map(i => i.id)).toEqual(['a', 'b', 'c']);
  });
  it('фильтр по цветам (мультивыбор)', () => {
    expect(applyFilters(items, F({ colors: ['red'] }), ctx).map(i => i.id)).toEqual(['b']);
    expect(applyFilters(items, F({ colors: ['red', 'white'] }), ctx).map(i => i.id)).toEqual(['a', 'b']);
  });
  it('фильтр по характеристикам: все выбранные ключи должны совпасть', () => {
    const withAttrs = [
      P({ id: 'x', subcategory: 'laptops', attrs: { ram_gb: '16', cpu: 'Apple M3' } }),
      P({ id: 'y', subcategory: 'laptops', attrs: { ram_gb: '8', cpu: 'Apple M3' } }),
    ];
    expect(applyFilters(withAttrs, F({ attrs: { ram_gb: ['16'] } }), ctx).map(i => i.id)).toEqual(['x']);
    expect(applyFilters(withAttrs, F({ attrs: { ram_gb: ['8', '16'], cpu: ['Apple M3'] } }), ctx)).toHaveLength(2);
    expect(applyFilters(withAttrs, F({ attrs: { cpu: ['Intel Core i5'] } }), ctx)).toHaveLength(0);
  });
  it('purchases / year / weight / warranty', () => {
    expect(applySort(items, 'purchases', ctx).map(i => i.id)).toEqual(['c', 'a', 'b']);
    expect(applySort(items, 'year', ctx).map(i => i.id)).toEqual(['b', 'a', 'c']);
    expect(applySort(items, 'weight', ctx).map(i => i.id)).toEqual(['c', 'a', 'b']);
    expect(applySort(items, 'warranty', ctx).map(i => i.id)).toEqual(['b', 'a', 'c']);
  });
  it('не мутирует вход', () => {
    const before = items.map(i => i.id).join();
    applySort(items, 'price_asc', ctx);
    expect(items.map(i => i.id).join()).toBe(before);
  });
});

describe('URL state', () => {
  it('roundtrip: filters → params → filters', () => {
    const f: FilterState = { cat: 'audio', sub: 'earbuds', min: 5000, max: 50000, rating: 4, pool: true, liked: false, q: 'sony', colors: ['black', 'white'], attrs: { anc: ['Да'], battery_h: ['9', '12'] } };
    const qs = paramsFromFilters(f, 'price_asc');
    const back = filtersFromParams(new URLSearchParams(qs));
    expect(back.filters).toEqual(f);
    expect(back.sort).toBe('price_asc');
  });
  it('мусорные параметры: min=abc → null (не NaN), sort=evil → relevance', () => {
    const back = filtersFromParams(new URLSearchParams('min=abc&sort=evil'));
    expect(back.filters.min).toBeNull();
    expect(back.sort).toBe('relevance');
  });
  it('дефолты не попадают в строку, пустая строка → дефолты', () => {
    expect(paramsFromFilters(DEFAULT_FILTERS, 'relevance')).toBe('');
    const back = filtersFromParams(new URLSearchParams(''));
    expect(back.filters).toEqual(DEFAULT_FILTERS);
    expect(back.sort).toBe('relevance');
  });
});
