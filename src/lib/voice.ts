// src/lib/voice.ts — выбор голоса и подготовка текста к озвучке
export type VoiceLite = { lang: string; name: string };

// Ранжирование: neural/natural-голоса (Edge) > Google (Chrome) > любой русский > нет
export function voiceRank(v: VoiceLite): number {
  if (!v.lang.toLowerCase().startsWith('ru')) return 0;
  const n = v.name.toLowerCase();
  if (n.includes('natural') || n.includes('neural')) return 3;
  if (n.includes('google')) return 2;
  return 1;
}

export function pickVoice(voices: VoiceLite[]): number {
  let best = -1, bestRank = 0;
  voices.forEach((v, i) => {
    const r = voiceRank(v);
    if (r > bestRank) { bestRank = r; best = i; }
  });
  return best;
}

// Чистим текст для приятной озвучки: без эмодзи/markdown/URL, с обрезкой по предложению
export function cleanSpeechText(text: string, maxLen = 220): string {
  let t = text
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[*_`#|>~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (t.length <= maxLen) return t;
  const cut = t.slice(0, maxLen);
  const lastEnd = Math.max(cut.lastIndexOf('.'), cut.lastIndexOf('!'), cut.lastIndexOf('?'));
  if (lastEnd > 40) return cut.slice(0, lastEnd + 1);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + '…';
}
