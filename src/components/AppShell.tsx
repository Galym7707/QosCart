// src/components/AppShell.tsx
'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SearchBar from './SearchBar';
import BottomNav from './BottomNav';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b h-14">
        <div className="mx-auto max-w-7xl h-full px-4 flex items-center gap-4">
          <Link href="/feed" className="font-bold text-lg shrink-0">🛒 QosCart</Link>
          <div className="hidden lg:block flex-1 max-w-xl">
            <SearchBar value="" onChange={q => router.push(q ? `/feed?q=${encodeURIComponent(q)}` : '/feed')} />
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Link href="/feed?liked=1" aria-label="Избранное" className="w-10 h-10 rounded-full hover:bg-zinc-100 hidden lg:flex items-center justify-center">♥</Link>
            <Link href="/profile" aria-label="Профиль" className="w-10 h-10 rounded-full hover:bg-zinc-100 hidden lg:flex items-center justify-center">👤</Link>
          </div>
        </div>
      </header>
      {children}
      <BottomNav />
    </div>
  );
}
