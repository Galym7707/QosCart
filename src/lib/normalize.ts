// src/lib/normalize.ts
import { usdToKzt } from './currency';

export type NormalizedProduct = {
  title: string; category: string; source: string;
  product_url: string | null; image_url: string | null;
  price_kzt: number; rating: number | null; reviews_count: number | null;
  raw: unknown;
};

export function normalizeShoppingResult(r: any, category: string, rate?: number): NormalizedProduct | null {
  const title = (r?.title ?? '').trim();
  const usd = typeof r?.extracted_price === 'number'
    ? r.extracted_price
    : parseFloat(String(r?.price ?? '').replace(/[^0-9.]/g, ''));
  if (!title || !usd || Number.isNaN(usd)) return null;
  return {
    title,
    category,
    source: `google_shopping:${r?.source ?? 'unknown'}`,
    product_url: r?.link ?? r?.product_link ?? null,
    image_url: r?.thumbnail ?? null,
    price_kzt: usdToKzt(usd, rate),
    rating: r?.rating ?? null,
    reviews_count: r?.reviews ?? null,
    raw: r,
  };
}
