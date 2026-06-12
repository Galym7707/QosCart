// src/components/AppShell.tsx
'use client';
import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import SearchBar from './SearchBar';
import BottomNav from './BottomNav';
import Icon from './Icon';

function HeaderSearch() {
  const router = useRouter();
  const sp = useSearchParams();
  const q = sp.get('q') ?? '';
  return <SearchBar value={q} onChange={v => router.push(v ? `/feed?q=${encodeURIComponent(v)}` : '/feed')} />;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b h-14">
        <div className="mx-auto max-w-7xl h-full px-4 flex items-center gap-4">
          <Link href="/feed" className="font-bold text-lg shrink-0 flex items-center gap-2"><Icon name="cart" size={22} />QosCart</Link>
          <div className="hidden lg:block flex-1 max-w-xl">
            <Suspense fallback={null}><HeaderSearch /></Suspense>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Link href="/feed?liked=1" aria-label="Избранное" className="w-10 h-10 rounded-full hover:bg-zinc-100 hidden lg:flex items-center justify-center"><Icon name="heart" size={19} /></Link>
            <Link href="/profile" aria-label="Профиль" className="w-10 h-10 rounded-full hover:bg-zinc-100 hidden lg:flex items-center justify-center"><Icon name="user" size={19} /></Link>
          </div>
        </div>
      </header>
      {children}
      <BottomNav />
    </div>
  );
}
