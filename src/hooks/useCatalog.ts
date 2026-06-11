// src/hooks/useCatalog.ts — один fetch каталога + активные пулы + лайки
'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchLikedIds, toggleLike } from '@/lib/likes';
import type { CatalogCtx } from '@/lib/filters';

export type CatalogProduct = {
  id: string; title: string; category: string; subcategory: string | null;
  price_kzt: number; rating: number | null; reviews_count: number | null;
  image_url: string | null; source: string; fetched_at: string;
};

export function useCatalog() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [poolParticipants, setPoolParticipants] = useState<Map<string, number>>(new Map());
  const [poolByProduct, setPoolByProduct] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(true);
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('qos_user') ?? 'null') : null;

  useEffect(() => {
    (async () => {
      const [{ data: prods }, { data: pools }, liked] = await Promise.all([
        supabase.from('products')
          .select('id,title,category,subcategory,price_kzt,rating,reviews_count,image_url,source,fetched_at')
          .limit(2000),
        supabase.from('pools').select('*').eq('status', 'forming').gt('expires_at', new Date().toISOString()),
        user?.id ? fetchLikedIds(user.id) : Promise.resolve(new Set<string>()),
      ]);
      setProducts(prods ?? []);
      setLikedIds(liked);
      setPoolParticipants(new Map((pools ?? []).map(p => [p.product_id, p.current_participants])));
      setPoolByProduct(new Map((pools ?? []).map(p => [p.product_id, p])));
      setLoading(false);
    })();
  }, []);

  const onToggleLike = useCallback(async (productId: string) => {
    if (!user?.id) return;
    const was = likedIds.has(productId);
    setLikedIds(prev => { const n = new Set(prev); was ? n.delete(productId) : n.add(productId); return n; });
    await toggleLike(user.id, productId, was);
  }, [likedIds, user?.id]);

  const ctx: CatalogCtx = { likedIds, poolParticipants };
  return { products, ctx, poolByProduct, loading, onToggleLike, user };
}
