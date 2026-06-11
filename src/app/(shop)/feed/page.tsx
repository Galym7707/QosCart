// src/app/feed/page.tsx
'use client';
import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCatalog } from '@/hooks/useCatalog';
import { applyFilters, applySort, filtersFromParams, paramsFromFilters, FilterState, SortKey } from '@/lib/filters';
import { scoreProduct } from '@/lib/scoring';
import ProductCard from '@/components/ProductCard';
import SearchBar from '@/components/SearchBar';
import SortBar from '@/components/SortBar';
import FilterPanel from '@/components/FilterPanel';
import FilterSheet from '@/components/FilterSheet';

function FeedInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const { filters, sort } = useMemo(() => filtersFromParams(new URLSearchParams(sp.toString())), [sp]);
  const { products, ctx, poolByProduct, loading, onToggleLike, user } = useCatalog();
  const [sheetOpen, setSheetOpen] = useState(false);

  const update = (f: FilterState, s: SortKey) => {
    const qs = paramsFromFilters(f, s);
    router.replace(qs ? `/feed?${qs}` : '/feed', { scroll: false });
  };

  const visible = useMemo(() => {
    const prof = { interests: user?.interests ?? [], budget_kzt: user?.budget_kzt, city: user?.city ?? 'Almaty' };
    const likedCats = new Set(products.filter(x => ctx.likedIds.has(x.id)).map(x => x.category));
    const scored = products.map(p => ({
      ...p,
      ...scoreProduct(p, prof, {
        poolProgress: (ctx.poolParticipants.get(p.id) ?? 0) / 10,
        likedCategory: likedCats.has(p.category),
      }),
    }));
    return applySort(applyFilters(scored, filters, ctx), sort, ctx);
  }, [products, ctx, filters, sort, user]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 lg:pb-8">
      <div className="lg:hidden pt-3"><SearchBar value={filters.q} onChange={q => update({ ...filters, q }, sort)} /></div>

      <div className="flex gap-6 pt-3">
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-20 border rounded-2xl p-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <FilterPanel f={filters} onChange={f => update(f, sort)} />
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0"><SortBar sort={sort} onChange={s => update(filters, s)} /></div>
            <button onClick={() => setSheetOpen(true)}
              className="lg:hidden shrink-0 text-xs border rounded-full px-3 py-1.5 bg-white">Фильтры</button>
          </div>
          <p className="text-xs text-zinc-400 mt-1">{loading ? 'Загрузка…' : `${visible.length} товаров`}</p>

          {!loading && visible.length === 0 && (
            <div className="text-center py-16 text-sm text-zinc-500">
              Ничего не нашлось.
              <Link href="/chat" className="block mt-3 underline">Спросить AI-агента</Link>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 mt-2">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="border rounded-2xl bg-zinc-50 animate-pulse aspect-[3/4]" />)
              : visible.map(p => (
                  <ProductCard key={p.id} p={p} pool={poolByProduct.get(p.id)}
                    liked={ctx.likedIds.has(p.id)} onToggleLike={() => onToggleLike(p.id)} />
                ))}
          </div>
        </main>
      </div>

      <FilterSheet open={sheetOpen} onClose={() => setSheetOpen(false)} f={filters} onChange={f => update(f, sort)} />
    </div>
  );
}

export default function Feed() {
  return <Suspense fallback={<div className="p-6 text-sm text-zinc-400">Загрузка…</div>}><FeedInner /></Suspense>;
}
