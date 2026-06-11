// src/components/ProductCard.tsx
import Link from 'next/link';
import { formatKzt } from '@/lib/currency';
import { currentPrice } from '@/lib/ladder';
import WhyChips from './WhyChips';
import type { Chip } from '@/lib/scoring';

export default function ProductCard({ p, participants = 0 }: { p: any & { score?: number; chips?: Chip[] }; participants?: number }) {
  const group = currentPrice(p.price_kzt, Math.max(participants, 10)); // показываем цену main group как цель
  return (
    <Link href={`/product/${p.id}`} className="block border rounded-2xl p-3 bg-white">
      <div className="flex gap-3">
        {p.image_url ? <img src={p.image_url} alt="" className="w-20 h-20 object-cover rounded-xl bg-zinc-100" /> : <div className="w-20 h-20 rounded-xl bg-zinc-100" />}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium line-clamp-2">{p.title}</p>
          <p className="text-xs text-zinc-400 mt-0.5">{p.source} · обновлено {new Date(p.fetched_at).toLocaleDateString('ru-RU')}</p>
          <p className="mt-1 text-sm"><s className="text-zinc-400">{formatKzt(p.price_kzt)}</s> <b className="text-emerald-600">{formatKzt(group)}</b> <span className="text-[11px] text-emerald-600">в группе 10+</span></p>
        </div>
        {typeof p.score === 'number' && <div className="text-xs font-bold text-blue-600 shrink-0">{p.score}%</div>}
      </div>
      {p.chips && <div className="mt-2"><WhyChips chips={p.chips} /></div>}
    </Link>
  );
}
