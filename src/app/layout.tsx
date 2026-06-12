// src/app/layout.tsx
import './globals.css';
export const metadata = { title: 'QosCart', description: 'AI collective buying agent' };
export const viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-white text-zinc-900 min-h-screen antialiased">{children}</body>
    </html>
  );
}
