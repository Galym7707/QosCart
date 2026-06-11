// src/lib/voice.ts
export type VoiceLite = { lang: string; name: string };

export function pickVoice(voices: VoiceLite[]): number {
  const ru = (x: VoiceLite) => x.lang.toLowerCase().startsWith('ru');
  const google = voices.findIndex(x => ru(x) && x.name.toLowerCase().includes('google'));
  if (google !== -1) return google;
  return voices.findIndex(ru);
}
