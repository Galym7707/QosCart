import Link from 'next/link';
export default function Welcome() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8 text-center">
      <div className="text-5xl">🛒</div>
      <h1 className="text-3xl font-bold">QosCart</h1>
      <p className="text-zinc-500">Скажи, что нужно. Присоединись к группе. Получи лучшую цену.</p>
      <Link href="/onboarding" className="w-full bg-black text-white rounded-2xl py-4 font-semibold">Начать</Link>
    </div>
  );
}
