import Link from 'next/link';
import Icon from '@/components/Icon';
export default function Welcome() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 text-center">
      <Icon name="cart" size={56} className="text-zinc-900" strokeWidth={1.5} />
      <h1 className="text-4xl font-bold tracking-tight">QosCart</h1>
      <p className="text-zinc-500 max-w-sm">Скажи, что нужно. Присоединись к группе. Получи лучшую цену.</p>
      <Link href="/onboarding" className="w-full max-w-sm bg-zinc-900 text-white rounded-2xl py-4 font-semibold hover:bg-zinc-800 transition">Начать</Link>
      <Link href="/feed" className="w-full max-w-sm border rounded-2xl py-4 font-semibold text-zinc-700 hover:border-zinc-400 transition">Смотреть каталог без регистрации</Link>
    </div>
  );
}
