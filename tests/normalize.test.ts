// tests/normalize.test.ts
import { describe, it, expect } from 'vitest';
import { normalizeShoppingResult } from '../src/lib/normalize';

const raw = {
  title: 'Anker PowerCore 10000 Power Bank',
  extracted_price: 25.99,
  price: '$25.99',
  link: 'https://example-shop.com/anker-10000',
  thumbnail: 'https://serpapi.example/img.jpg',
  rating: 4.6,
  reviews: 1280,
  source: 'ExampleShop',
};

describe('normalizeShoppingResult', () => {
  it('маппит поля, конвертирует цену в KZT (курс 520), проставляет категорию', () => {
    const p = normalizeShoppingResult(raw, 'tech', 520);
    expect(p).toMatchObject({
      title: 'Anker PowerCore 10000 Power Bank',
      category: 'tech',
      source: 'google_shopping:ExampleShop',
      product_url: 'https://example-shop.com/anker-10000',
      image_url: 'https://serpapi.example/img.jpg',
      price_kzt: 13510,
      rating: 4.6,
      reviews_count: 1280,
    });
    expect(p.raw).toEqual(raw);
  });
  it('возвращает null без цены или названия (мусор не пускаем в каталог)', () => {
    expect(normalizeShoppingResult({ ...raw, extracted_price: undefined, price: undefined }, 'tech', 520)).toBeNull();
    expect(normalizeShoppingResult({ ...raw, title: '' }, 'tech', 520)).toBeNull();
  });
  it('fallback: парсит цену из строки "$25.99", если нет extracted_price', () => {
    const p = normalizeShoppingResult({ ...raw, extracted_price: undefined }, 'tech', 520);
    expect(p?.price_kzt).toBe(13510);
  });
  it('проставляет subcategory, по умолчанию null', () => {
    const withSub = normalizeShoppingResult(raw, 'audio', 520, 'earbuds');
    expect(withSub?.category).toBe('audio');
    expect(withSub?.subcategory).toBe('earbuds');
    const noSub = normalizeShoppingResult(raw, 'audio', 520);
    expect(noSub?.subcategory).toBeNull();
  });
});
