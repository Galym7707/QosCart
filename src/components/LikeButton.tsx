// src/components/LikeButton.tsx
'use client';
export default function LikeButton({ liked, onToggle }: { liked: boolean; onToggle: () => void }) {
  return (
    <button
      aria-label={liked ? 'Убрать из избранного' : 'В избранное'}
      onClick={e => { e.preventDefault(); e.stopPropagation(); onToggle(); }}
      className={`w-9 h-9 rounded-full flex items-center justify-center text-lg transition
        ${liked ? 'bg-red-50 text-red-500' : 'bg-white/90 text-zinc-400 hover:text-zinc-600'}`}>
      {liked ? '♥' : '♡'}
    </button>
  );
}
