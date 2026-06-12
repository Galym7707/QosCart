// tests/social.test.ts
import { describe, it, expect } from 'vitest';
import { suggestInvitees } from '../src/lib/social';

const friends = [
  { id: 'f1', name: 'Дана', interests: ['audio', 'electronics'] },
  { id: 'f2', name: 'Алибек', interests: ['sport'] },
  { id: 'f3', name: 'Аружан', interests: ['audio'] },
  { id: 'f4', name: 'Тимур', interests: ['kitchen'] },
];

describe('suggestInvitees', () => {
  it('исключает тех, кто уже в пуле', () => {
    const r = suggestInvitees(friends, 'audio', new Set(['f1']));
    expect(r.map(f => f.id)).not.toContain('f1');
  });
  it('сначала друзья с совпадающим интересом, потом остальные; внутри групп — по алфавиту', () => {
    const r = suggestInvitees(friends, 'audio', new Set());
    expect(r.map(f => f.id)).toEqual(['f3', 'f1', 'f2']);   // Аружан, Дана (обе audio, А<Д), затем Алибек
  });
  it('limit ограничивает выдачу', () => {
    expect(suggestInvitees(friends, 'audio', new Set(), 2)).toHaveLength(2);
  });
  it('пустой список друзей → пусто', () => {
    expect(suggestInvitees([], 'audio', new Set())).toEqual([]);
  });
});
