// tests/ladder.test.ts
import { describe, it, expect } from 'vitest';
import { TIERS, currentPrice, nextUnlock, savings, ladderFor } from '../src/lib/ladder';

const RETAIL = 15900;

describe('price ladder', () => {
  it('4 тира с порогами 1/5/10/20', () => {
    expect(TIERS.map(t => t.threshold)).toEqual([1, 5, 10, 20]);
  });
  it('цена по числу участников: до 5 — retail, 5..9 — 0.93, 10..19 — 0.85, 20+ — 0.78 (окр. до 10)', () => {
    expect(currentPrice(RETAIL, 1)).toBe(15900);
    expect(currentPrice(RETAIL, 7)).toBe(14790);   // 15900*0.93=14787 → 14790
    expect(currentPrice(RETAIL, 10)).toBe(13520);  // 13515 → 13520
    expect(currentPrice(RETAIL, 25)).toBe(12400);  // 12402 → 12400
  });
  it('nextUnlock: сколько людей до следующего тира и его цена', () => {
    expect(nextUnlock(RETAIL, 7)).toEqual({ needed: 3, threshold: 10, price: 13520 });
    expect(nextUnlock(RETAIL, 25)).toBeNull();     // выше bulk некуда
  });
  it('savings относительно retail', () => {
    expect(savings(RETAIL, 10)).toBe(2380);        // 15900-13520
  });
  it('ladderFor: полная лестница для UI', () => {
    const l = ladderFor(RETAIL);
    expect(l).toHaveLength(4);
    expect(l[2]).toEqual({ threshold: 10, price: 13520, label: 'Основная группа' });
  });
});
