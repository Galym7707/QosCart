// tests/categories.test.ts
import { describe, it, expect } from 'vitest';
import { CATEGORIES, LEGACY_MAP, allQueryJobs, parentLabel, subLabel } from '../src/lib/categories';

describe('categories tree', () => {
  it('12 родителей, у каждого 3-5 подкатегорий, у каждой 2 запроса', () => {
    expect(CATEGORIES).toHaveLength(12);
    for (const c of CATEGORIES) {
      expect(c.subs.length).toBeGreaterThanOrEqual(3);
      expect(c.subs.length).toBeLessThanOrEqual(5);
      for (const s of c.subs) expect(s.queries).toHaveLength(2);
    }
  });
  it('slug-и уникальны (родители и подкатегории глобально)', () => {
    const slugs = [...CATEGORIES.map(c => c.slug), ...CATEGORIES.flatMap(c => c.subs.map(s => s.slug))];
    expect(new Set(slugs).size).toBe(slugs.length);
  });
  it('русские лейблы непустые', () => {
    for (const c of CATEGORIES) {
      expect(c.ru.length).toBeGreaterThan(0);
      for (const s of c.subs) expect(s.ru.length).toBeGreaterThan(0);
    }
  });
  it('LEGACY_MAP покрывает все 6 старых категорий и ведёт на существующие родительские slug-и', () => {
    const parents = new Set(CATEGORIES.map(c => c.slug));
    for (const old of ['tech', 'study', 'home', 'fashion', 'sport', 'beauty']) {
      expect(LEGACY_MAP[old]).toBeDefined();
      expect(parents.has(LEGACY_MAP[old])).toBe(true);
    }
  });
  it('allQueryJobs: по 2 задания на каждую подкатегорию', () => {
    const jobs = allQueryJobs();
    const expected = CATEGORIES.reduce((s, c) => s + c.subs.length * 2, 0);
    expect(jobs).toHaveLength(expected);
    expect(jobs[0]).toHaveProperty('cat');
    expect(jobs[0]).toHaveProperty('sub');
    expect(jobs[0]).toHaveProperty('query');
  });
  it('лейбл-хелперы: известный slug → RU, неизвестный → сам slug', () => {
    expect(parentLabel('audio')).toBe('Аудио');
    expect(parentLabel('nope')).toBe('nope');
    expect(subLabel('audio', 'earbuds')).toBe('Наушники TWS');
  });
});
