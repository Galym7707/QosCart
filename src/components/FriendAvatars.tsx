// src/components/FriendAvatars.tsx
export default function FriendAvatars({ names, max = 4 }: { names: string[]; max?: number }) {
  if (!names.length) return null;
  const shown = names.slice(0, max);
  return (
    <div className="flex items-center">
      {shown.map((n, i) => (
        <span key={i} title={n}
          className="w-7 h-7 -ml-1.5 first:ml-0 rounded-full bg-emerald-100 border-2 border-white text-emerald-800 text-[11px] font-semibold flex items-center justify-center">
          {n.trim()[0]?.toUpperCase() ?? '?'}
        </span>
      ))}
      {names.length > max && <span className="text-[11px] text-zinc-500 ml-1">+{names.length - max}</span>}
    </div>
  );
}
