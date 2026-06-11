// src/app/(shop)/layout.tsx
import AppShell from '@/components/AppShell';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
