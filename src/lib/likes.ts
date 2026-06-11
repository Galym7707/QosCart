// src/lib/likes.ts — тонкая I/O-обёртка над supabase (browser)
import { supabase } from './supabase';

export async function fetchLikedIds(userId: string): Promise<Set<string>> {
  const { data } = await supabase.from('likes').select('product_id').eq('user_id', userId);
  return new Set((data ?? []).map(r => r.product_id));
}

export async function toggleLike(userId: string, productId: string, liked: boolean): Promise<void> {
  if (liked) await supabase.from('likes').delete().eq('user_id', userId).eq('product_id', productId);
  else await supabase.from('likes').insert({ user_id: userId, product_id: productId });
}
