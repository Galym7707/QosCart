'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { scoreProduct } from '@/lib/scoring';
import ProductCard from '@/components/ProductCard';
import TrustBadge from '@/components/TrustBadge';

export default function Feed() {
  const [items, setItems] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('qos_user') ?? 'null'); setUser(u);
    supabase.from('products').select('*').limit(60).then(({ data }) => {
      const prof = { interests: u?.interests ?? [], budget_kzt: u?.budget_kzt, city: u?.city ?? 'Almaty' };
      const ranked = (data ?? []).map(p => ({ ...p, ...scoreProduct(p, prof, {}) })).sort((a, b) => b.score - a.score);
      setItems(ranked);
    });
  }, []);
  return (
    <div className="p-4 pb-24">
      <div className="flex items-center justify-between py-2">
        <div><h1 className="font-bold text-lg">Привет, {user?.name ?? 'гость'}</h1><TrustBadge /></div>
        <Link href="/chat" className="bg-black text-white text-sm rounded-full px-4 py-2">🤖 Спросить агента</Link>
      </div>
      <div className="flex flex-col gap-3 mt-2">{items.map(p => <ProductCard key={p.id} p={p} />)}</div>
    </div>
  );
}
