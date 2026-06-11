// tests/llm-fallback.test.ts
import { describe, it, expect } from 'vitest';
import { fallbackParse, templateExplanation } from '../src/lib/llm';

describe('fallbackParse', () => {
  it('вытаскивает бюджет в KZT и город из русского запроса', () => {
    const i = fallbackParse('Найди power bank до 15 000 KZT, быстрая зарядка, Алматы');
    expect(i.budget_max).toBe(15000);
    expect(i.city).toBe('Almaty');
    expect(i.query_en.toLowerCase()).toContain('power bank');
  });
  it('дефолты: город Almaty, бюджет null', () => {
    const i = fallbackParse('наушники для учёбы');
    expect(i.city).toBe('Almaty');
    expect(i.budget_max).toBeNull();
  });
});

describe('templateExplanation', () => {
  it('собирает фразу из чипов и пула', () => {
    const s = templateExplanation(
      [{ label: 'Интерес: tech', hit: true }, { label: 'Бюджет: до 15 000 ₸', hit: true }, { label: 'Рейтинг 4.6', hit: false }],
      { name: 'Almaty Tech Drop', current_participants: 7, min_participants: 10 }
    );
    expect(s).toContain('Интерес: tech');
    expect(s).toContain('Almaty Tech Drop');
    expect(s).toContain('3'); // нужно ещё 3
  });
});
