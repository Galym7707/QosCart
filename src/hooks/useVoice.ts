// src/hooks/useVoice.ts
'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { pickVoice } from '@/lib/voice';

export function useVoice(onFinal: (text: string) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [ttsOn, setTtsOn] = useState(true);
  const recRef = useRef<any>(null);
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;

  useEffect(() => {
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    setSupported(!!SR);
    setTtsOn(localStorage.getItem('qos_tts') !== '0');
    window.speechSynthesis?.getVoices(); // прогрев async-списка голосов (Chrome)
    return () => { try { recRef.current?.stop(); } catch {} window.speechSynthesis?.cancel(); };
  }, []);

  const start = useCallback(() => {
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SR || listening) return;
    window.speechSynthesis?.cancel();
    const rec = new SR();
    recRef.current = rec;
    rec.lang = 'ru-RU';
    rec.interimResults = true;
    rec.onresult = (e: any) => {
      let final = '', inter = '';
      for (const res of e.results) (res.isFinal ? final += res[0].transcript : inter += res[0].transcript);
      setInterim(inter || final);
      if (final) { setInterim(''); onFinalRef.current(final.trim()); rec.stop(); }
    };
    rec.onend = () => { setListening(false); setInterim(''); };
    rec.onerror = () => { setListening(false); setInterim(''); };
    setListening(true);
    rec.start();
  }, [listening]);

  const stop = useCallback(() => { recRef.current?.stop(); setListening(false); setInterim(''); }, []);

  const toggleTts = useCallback(() => {
    setTtsOn(v => { localStorage.setItem('qos_tts', v ? '0' : '1'); if (v) window.speechSynthesis?.cancel(); return !v; });
  }, []);

  const speak = useCallback((text: string) => {
    if (!ttsOn || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ru-RU';
    const voices = window.speechSynthesis.getVoices();
    const i = pickVoice(voices.map(v => ({ lang: v.lang, name: v.name })));
    if (i !== -1) u.voice = voices[i];
    window.speechSynthesis.speak(u);
  }, [ttsOn]);

  return { supported, listening, interim, start, stop, ttsOn, toggleTts, speak };
}
