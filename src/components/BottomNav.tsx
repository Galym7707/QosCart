// src/components/BottomNav.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from './Icon';

const items = [
  { href: '/feed', label: 'Каталог', icon: 'grid' as const, center: false },
  { href: '/chat', label: 'Агент', icon: 'agent' as const, center: true },
  { href: '/feed?liked=1', label: 'Избранное', icon: 'heart' as const, center: false },
  { href: '/profile', label: 'Профиль', icon: 'user' as const, center: false },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t flex justify-around items-end pb-[max(env(safe-area-inset-bottom),8px)] pt-2">
      {items.map(it => it.center ? (
        <Link key={it.href} href={it.href} aria-label={it.label}
          className="relative -top-4 w-14 h-14 rounded-full bg-zinc-900 text-white flex items-center justify-center shadow-lg">
          <Icon name={it.icon} size={26} />
        </Link>
      ) : (
        <Link key={it.href} href={it.href}
          className={`flex flex-col items-center gap-0.5 text-[11px] px-3 min-w-[44px] min-h-[44px] justify-center
            ${path === it.href.split('?')[0] && !it.href.includes('?') ? 'text-zinc-900 font-semibold' : 'text-zinc-400'}`}>
          <Icon name={it.icon} size={20} />{it.label}
        </Link>
      ))}
    </nav>
  );
}
