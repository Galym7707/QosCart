// tests/scoring.test.ts (полная замена)
import { describe, it, expect } from 'vitest';
import { scoreProduct } from '../src/lib/scoring';

const product = { category: 'audio', price_kzt: 12900, rating: 4.6 };
const profile = { interests: ['audio', 'study'], budget_kzt: 15000, city: 'Almaty' };

describe('scoring v2 (8 факторов, сумма max = 100)', () => {
  it('полное совпадение всех факторов = 100', () => {
    const r = scoreProduct(product, profile, {
      cityDemand: true, poolProgress: 0.7, trustShare: 0.9, likedCategory: true, friendsInPool: 2,
    });
    expect(r.score).toBe(100);
  });
  it('только legacy-факторы: 20+18+12+18+8+8 = 84', () => {
    const r = scoreProduct(product, profile, { cityDemand: true, poolProgress: 0.7, trustShare: 0.9 });
    expect(r.score).toBe(84);
  });
  it('без контекста: 20+18+18 = 56', () => {
    expect(scoreProduct(product, profile, {}).score).toBe(56);
  });
  it('бюджет с натяжкой (<=120%) даёт 9; без рейтинга quality 0', () => {
    const r = scoreProduct({ ...product, price_kzt: 17000, rating: undefined }, profile, {});
    expect(r.score).toBe(20 + 9);
  });
  it('liked и friends добавляют по 8', () => {
    expect(scoreProduct(product, profile, { likedCategory: true }).score).toBe(64);
    expect(scoreProduct(product, profile, { friendsInPool: 1 }).score).toBe(64);
    expect(scoreProduct(product, profile, { friendsInPool: 0 }).score).toBe(56);
  });
  it('чипы: новые факторы отражены', () => {
    const r = scoreProduct(product, profile, { likedCategory: true, friendsInPool: 2 });
    const hits = r.chips.filter(c => c.hit).map(c => c.label);
    expect(hits).toContain('Вы лайкали: audio');
    expect(hits).toContain('Друзья в группе: 2');
  });
  it('factors: 8 записей, сумма max = 100, points ≤ max', () => {
    const r = scoreProduct(product, profile, { cityDemand: true });
    expect(r.factors).toHaveLength(8);
    expect(r.factors.reduce((s, f) => s + f.max, 0)).toBe(100);
    for (const f of r.factors) { expect(f.points).toBeGreaterThanOrEqual(0); expect(f.points).toBeLessThanOrEqual(f.max); }
    expect(r.factors.reduce((s, f) => s + f.points, 0)).toBe(r.score);
  });
});
