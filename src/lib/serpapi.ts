// src/lib/serpapi.ts
import { normalizeShoppingResult, NormalizedProduct } from './normalize';

export async function searchShopping(query: string, category: string, subcategory: string | null = null): Promise<NormalizedProduct[]> {
  const key = process.env.SERPAPI_KEY;
  if (!key) return [];
  const url = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(query)}&num=20&api_key=${key}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  const items: any[] = data?.shopping_results ?? [];
  return items.map(i => normalizeShoppingResult(i, category, undefined, subcategory)).filter((p): p is NormalizedProduct => p !== null);
}
