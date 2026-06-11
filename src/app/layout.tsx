import './globals.css';

export const metadata = { title: 'QosCart', description: 'AI collective buying agent' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-zinc-200 min-h-screen flex justify-center">
        <main className="w-full max-w-[390px] min-h-screen bg-white shadow-xl relative">{children}</main>
      </body>
    </html>
  );
}
