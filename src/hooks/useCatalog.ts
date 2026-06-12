// src/hooks/useCatalog.ts — один fetch каталога + активные пулы + лайки
'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchLikedIds, toggleLike } from '@/lib/likes';
import type { CatalogCtx } from '@/lib/filters';

export type CatalogProduct = {
  id: string; title: string; category: string; subcategory: string | null;
  price_kzt: number; rating: number | null; reviews_count: number | null;
  image_url: string | null; source: string; fetched_at: string;
  color: string | null; release_year: number | null; purchases_count: number | null;
  weight_g: number | null; warranty_months: number | null;
  attrs: Record<string, string | number | null> | null;
};

export function useCatalog() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [poolParticipants, setPoolParticipants] = useState<Map<string, number>>(new Map());
  const [poolByProduct, setPoolByProduct] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(true);
  const [user] = useState(() =>
    typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('qos_user') ?? 'null') : null
  );

  useEffect(() => {
    (async () => {
      try {
        const fetchAllProducts = async () => {
          const cols = 'id,title,category,subcategory,price_kzt,rating,reviews_count,image_url,source,fetched_at,color,release_year,purchases_count,weight_g,warranty_months,attrs';
          const all: CatalogProduct[] = [];
          for (let page = 0; page < 10; page++) {
            const { data } = await supabase.from('products').select(cols).order('id').range(page * 1000, page * 1000 + 999);
            all.push(...((data ?? []) as CatalogProduct[]));
            if (!data || data.length < 1000) break;
          }
          return all;
        };
        const [prods, { data: pools }, liked] = await Promise.all([
          fetchAllProducts(),
          supabase.from('pools').select('*').eq('status', 'forming').gt('expires_at', new Date().toISOString()),
          user?.id ? fetchLikedIds(user.id) : Promise.resolve(new Set<string>()),
        ]);
        setProducts(prods);
        setLikedIds(liked);
        setPoolParticipants(new Map((pools ?? []).map(p => [p.product_id, p.current_participants])));
        setPoolByProduct(new Map((pools ?? []).map(p => [p.product_id, p])));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onToggleLike = useCallback(async (productId: string) => {
    if (!user?.id) return;
    const was = likedIds.has(productId);
    setLikedIds(prev => { const n = new Set(prev); was ? n.delete(productId) : n.add(productId); return n; });
    await toggleLike(user.id, productId, was);
  }, [likedIds, user?.id]);

  const ctx = useMemo<CatalogCtx>(() => ({ likedIds, poolParticipants }), [likedIds, poolParticipants]);
  return { products, ctx, poolByProduct, loading, onToggleLike, user };
}
