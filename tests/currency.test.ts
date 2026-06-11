// tests/currency.test.ts
import { describe, it, expect } from 'vitest';
import { usdToKzt, formatKzt } from '../src/lib/currency';

describe('currency', () => {
  it('конвертирует USD в KZT по курсу и округляет до 10', () => {
    expect(usdToKzt(25.99, 520)).toBe(13510);   // 13514.8 → до 10 вниз/математически: 13510
    expect(usdToKzt(50, 520)).toBe(26000);
  });
  it('formatKzt: разделители тысяч + символ', () => {
    expect(formatKzt(15900)).toBe('15 900 ₸');
  });
});
