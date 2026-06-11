// tests/scoring.test.ts
import { describe, it, expect } from 'vitest';
import { scoreProduct } from '../src/lib/scoring';

const product = { category: 'tech', price_kzt: 12900, rating: 4.6 };
const profile = { interests: ['tech', 'study'], budget_kzt: 15000, city: 'Almaty' };

describe('scoring', () => {
  it('полное совпадение: 25+20+15+20+10+10 = 100', () => {
    const r = scoreProduct(product, profile, { cityDemand: true, poolProgress: 0.7, trustShare: 0.9 });
    expect(r.score).toBe(100);
  });
  it('без пула в городе и моментума: 25+20+0+20+0+0 = 65', () => {
    const r = scoreProduct(product, profile, {});
    expect(r.score).toBe(65);
  });
  it('бюджет с натяжкой (<=120%) даёт половину веса: 10', () => {
    const r = scoreProduct({ ...product, price_kzt: 17000, rating: undefined }, profile, {});
    expect(r.score).toBe(25 + 10); // интерес + полбюджета, качество без рейтинга = 0
  });
  it('чипы отражают факторы', () => {
    const r = scoreProduct(product, profile, { cityDemand: true });
    const labels = r.chips.filter(c => c.hit).map(c => c.label);
    expect(labels).toContain('Интерес: tech');
    expect(labels).toContain('Бюджет: до 15 000 ₸');
    expect(labels).toContain('Спрос в Almaty');
  });
});
