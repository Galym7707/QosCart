// tests/voice.test.ts
import { describe, it, expect } from 'vitest';
import { pickVoice, cleanSpeechText } from '../src/lib/voice';

const v = (lang: string, name: string) => ({ lang, name });

describe('pickVoice', () => {
  it('neural/natural-голос важнее Google', () => {
    const voices = [v('en-US', 'Samantha'), v('ru-RU', 'Microsoft Irina'), v('ru-RU', 'Google русский'), v('ru-RU', 'Microsoft Svetlana Online (Natural)')];
    expect(pickVoice(voices)).toBe(3);
  });
  it('Google важнее обычного ru-голоса', () => {
    const voices = [v('en-US', 'Samantha'), v('ru-RU', 'Microsoft Irina'), v('ru-RU', 'Google русский')];
    expect(pickVoice(voices)).toBe(2);
  });
  it('иначе первый ru-голос', () => {
    const voices = [v('en-US', 'Samantha'), v('ru-RU', 'Microsoft Irina'), v('ru-RU', 'Microsoft Pavel')];
    expect(pickVoice(voices)).toBe(1);
  });
  it('ru-голосов нет → -1', () => {
    expect(pickVoice([v('en-US', 'Samantha')])).toBe(-1);
    expect(pickVoice([])).toBe(-1);
  });
});

describe('cleanSpeechText', () => {
  it('убирает эмодзи, markdown и URL, схлопывает пробелы', () => {
    expect(cleanSpeechText('Отличный 🔥 выбор!  *Скидка*   тут: https://x.kz/p/1')).toBe('Отличный выбор! Скидка тут:');
  });
  it('короткий текст не трогает', () => {
    expect(cleanSpeechText('Подобрал по вашему профилю.')).toBe('Подобрал по вашему профилю.');
  });
  it('длинный текст режет по границе предложения в пределах лимита', () => {
    const long = 'Первое предложение про наушники. Второе предложение про цену и группу. ' + 'х'.repeat(300);
    const out = cleanSpeechText(long);
    expect(out.length).toBeLessThanOrEqual(220);
    expect(out.endsWith('.')).toBe(true);
  });
  it('без точек — режет по слову с многоточием', () => {
    const out = cleanSpeechText('слово '.repeat(60));
    expect(out.length).toBeLessThanOrEqual(221);
    expect(out.endsWith('…')).toBe(true);
  });
});
