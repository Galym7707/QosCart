// src/hooks/useVoice.ts
'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { pickVoice, cleanSpeechText } from '@/lib/voice';

export function useVoice(onFinal: (text: string) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [ttsOn, setTtsOn] = useState(true);
  const recRef = useRef<any>(null);
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;
  const finalRef = useRef('');
  const silenceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    setSupported(!!SR);
    setTtsOn(localStorage.getItem('qos_tts') !== '0');
    window.speechSynthesis?.getVoices(); // прогрев async-списка голосов (Chrome)
    return () => { try { recRef.current?.stop(); } catch {} window.speechSynthesis?.cancel(); };
  }, []);

  const clearTimers = () => {
    if (silenceRef.current) { clearTimeout(silenceRef.current); silenceRef.current = null; }
    if (maxRef.current) { clearTimeout(maxRef.current); maxRef.current = null; }
  };

  const start = useCallback(() => {
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SR || listening) return;
    window.speechSynthesis?.cancel();
    const rec = new SR();
    recRef.current = rec;
    rec.lang = 'ru-RU';
    rec.interimResults = true;
    rec.continuous = true;            // не обрываемся на паузах движка
    finalRef.current = '';
    // ждём начала речи до 4с; после каждой реплики — ещё 1.4с тишины на продолжение
    const arm = (ms: number) => {
      if (silenceRef.current) clearTimeout(silenceRef.current);
      silenceRef.current = setTimeout(() => { try { rec.stop(); } catch {} }, ms);
    };
    rec.onresult = (e: any) => {
      let inter = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) finalRef.current += res[0].transcript + ' ';
        else inter += res[0].transcript;
      }
      setInterim((finalRef.current + inter).trim());
      arm(1400);
    };
    rec.onend = () => {
      clearTimers();
      setListening(false); setInterim('');
      const text = finalRef.current.trim();
      finalRef.current = '';
      if (text) onFinalRef.current(text);
    };
    rec.onerror = () => { clearTimers(); setListening(false); setInterim(''); finalRef.current = ''; };
    setListening(true);
    arm(4000);
    maxRef.current = setTimeout(() => { try { rec.stop(); } catch {} }, 30000);  // потолок сессии
    rec.start();
  }, [listening]);

  // тап по микрофону во время записи = «я закончил»: отправляем накопленное через onend
  const stop = useCallback(() => { try { recRef.current?.stop(); } catch {} }, []);

  const toggleTts = useCallback(() => {
    setTtsOn(v => { localStorage.setItem('qos_tts', v ? '0' : '1'); if (v) window.speechSynthesis?.cancel(); return !v; });
  }, []);

  const speak = useCallback((text: string) => {
    if (!ttsOn || !window.speechSynthesis) return;
    const clean = cleanSpeechText(text);
    if (!clean) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = 'ru-RU';
    u.rate = 1.05;   // чуть живее монотонных системных голосов
    u.pitch = 1.03;
    const voices = window.speechSynthesis.getVoices();
    const i = pickVoice(voices.map(v => ({ lang: v.lang, name: v.name })));
    if (i !== -1) u.voice = voices[i];
    window.speechSynthesis.speak(u);
  }, [ttsOn]);

  return { supported, listening, interim, start, stop, ttsOn, toggleTts, speak };
}
