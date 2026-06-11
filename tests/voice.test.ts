// tests/voice.test.ts
import { describe, it, expect } from 'vitest';
import { pickVoice } from '../src/lib/voice';

const v = (lang: string, name: string) => ({ lang, name });

describe('pickVoice', () => {
  it('предпочитает Google-голос с ru', () => {
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
