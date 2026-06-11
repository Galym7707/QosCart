// src/components/BottomNav.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/feed', label: 'Каталог', icon: '🛍', center: false },
  { href: '/chat', label: 'Агент', icon: '🤖', center: true },
  { href: '/feed?liked=1', label: 'Избранное', icon: '♥', center: false },
  { href: '/profile', label: 'Профиль', icon: '👤', center: false },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t flex justify-around items-end pb-[max(env(safe-area-inset-bottom),8px)] pt-2">
      {items.map(it => it.center ? (
        <Link key={it.href} href={it.href} aria-label={it.label}
          className="relative -top-4 w-14 h-14 rounded-full bg-zinc-900 text-white text-2xl flex items-center justify-center shadow-lg">
          {it.icon}
        </Link>
      ) : (
        <Link key={it.href} href={it.href}
          className={`flex flex-col items-center gap-0.5 text-[11px] px-3 min-w-[44px] min-h-[44px] justify-center
            ${path === it.href.split('?')[0] && !it.href.includes('?') ? 'text-zinc-900 font-semibold' : 'text-zinc-400'}`}>
          <span className="text-lg leading-none">{it.icon}</span>{it.label}
        </Link>
      ))}
    </nav>
  );
}
