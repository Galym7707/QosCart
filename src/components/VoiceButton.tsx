// src/components/VoiceButton.tsx
'use client';
export default function VoiceButton({ listening, onStart, onStop }:
  { listening: boolean; onStart: () => void; onStop: () => void }) {
  return (
    <button onClick={listening ? onStop : onStart}
      aria-label={listening ? 'Остановить запись' : 'Голосовой ввод'}
      className={`w-12 h-12 rounded-full shrink-0 text-lg flex items-center justify-center border transition
        ${listening ? 'bg-red-500 text-white border-red-500 animate-pulse' : 'bg-white text-zinc-600 hover:border-zinc-400'}`}>
      🎤
    </button>
  );
}
