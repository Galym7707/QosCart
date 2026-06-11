import Link from 'next/link';
export default function Welcome() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="text-6xl">🛒</div>
      <h1 className="text-4xl font-bold tracking-tight">QosCart</h1>
      <p className="text-zinc-500 max-w-sm">Скажи, что нужно. Присоединись к группе. Получи лучшую цену.</p>
      <Link href="/onboarding" className="w-full max-w-sm bg-zinc-900 text-white rounded-2xl py-4 font-semibold hover:bg-zinc-800 transition">Начать</Link>
    </div>
  );
}
