// src/components/ProductCard.tsx
import Link from 'next/link';
import { formatKzt } from '@/lib/currency';
import { currentPrice } from '@/lib/ladder';
import LikeButton from './LikeButton';
import type { Chip } from '@/lib/scoring';

type Props = {
  p: any & { score?: number; chips?: Chip[] };
  pool?: { current_participants: number; min_participants: number } | null;
  liked?: boolean;
  onToggleLike?: () => void;
};

export default function ProductCard({ p, pool = null, liked = false, onToggleLike }: Props) {
  const groupPrice = currentPrice(p.price_kzt, 10);
  const discountPct = p.price_kzt > 0 ? Math.round((1 - groupPrice / p.price_kzt) * 100) : 0;
  return (
    <Link href={`/product/${p.id}`} className="group flex flex-col border rounded-2xl bg-white overflow-hidden hover:border-zinc-300 transition">
      <div className="relative aspect-square bg-zinc-50">
        {p.image_url
          ? <img src={p.image_url} alt={p.title} loading="lazy" className="w-full h-full object-contain p-3 group-hover:scale-[1.03] transition" />
          : <div className="w-full h-full flex items-center justify-center text-3xl text-zinc-200">🛍</div>}
        {onToggleLike && <div className="absolute top-2 right-2"><LikeButton liked={liked} onToggle={onToggleLike} /></div>}
        <span className="absolute bottom-2 left-2 text-[11px] font-semibold bg-emerald-600 text-white rounded-full px-2 py-0.5">−{discountPct}% в группе</span>
      </div>
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-sm leading-snug line-clamp-2 min-h-[2.5rem]">{p.title}</p>
        <p className="text-xs text-zinc-400">★ {p.rating ?? '—'}{p.reviews_count ? ` · ${p.reviews_count}` : ''}</p>
        <p className="mt-auto pt-1">
          <b className="text-emerald-700">{formatKzt(groupPrice)}</b>{' '}
          <s className="text-xs text-zinc-400">{formatKzt(p.price_kzt)}</s>
        </p>
        {pool && (
          <div>
            <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (pool.current_participants / pool.min_participants) * 100)}%` }} />
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">{pool.current_participants}/{pool.min_participants} в группе</p>
          </div>
        )}
      </div>
    </Link>
  );
}
