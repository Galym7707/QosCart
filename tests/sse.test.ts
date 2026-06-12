// tests/sse.test.ts
import { describe, it, expect } from 'vitest';
import { sseEvent, splitSseEvents } from '../src/lib/sse';

describe('sseEvent', () => {
  it('формат event/data с двойным переводом строки', () => {
    expect(sseEvent('step', { text: 'Ищу' })).toBe('event: step\ndata: {"text":"Ищу"}\n\n');
  });
});

describe('splitSseEvents', () => {
  it('парсит несколько событий и возвращает неполный хвост', () => {
    const buf = sseEvent('step', { text: 'a' }) + sseEvent('step', { text: 'b' }) + 'event: result\ndata: {"x"';
    const { events, rest } = splitSseEvents(buf);
    expect(events).toEqual([{ event: 'step', data: { text: 'a' } }, { event: 'step', data: { text: 'b' } }]);
    expect(rest).toBe('event: result\ndata: {"x"');
  });
  it('пустой буфер → пусто', () => {
    expect(splitSseEvents('')).toEqual({ events: [], rest: '' });
  });
  it('событие с битым JSON пропускается, не роняя парсер', () => {
    const buf = 'event: step\ndata: {oops}\n\n' + sseEvent('step', { text: 'ok' });
    const { events } = splitSseEvents(buf);
    expect(events).toEqual([{ event: 'step', data: { text: 'ok' } }]);
  });
});
