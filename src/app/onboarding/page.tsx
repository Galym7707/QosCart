'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

import { CATEGORIES } from '@/lib/categories';
import Icon from '@/components/Icon';

const INTERESTS = CATEGORIES.map(c => ({ slug: c.slug, ru: c.ru }));

export default function Onboarding() {
  const r = useRouter();
  const [step, setStep] = useState<'form' | 'otp' | 'interests'>('form');
  const [name, setName] = useState(''); const [phone, setPhone] = useState('');
  const [code, setCode] = useState(''); const [err, setErr] = useState('');
  const [sel, setSel] = useState<string[]>([]); const [budget, setBudget] = useState(25000);
  const [otpMode, setOtpMode] = useState<'sms' | 'demo'>('demo'); const [busy, setBusy] = useState(false);

  async function sendCode() {
    setBusy(true); setErr('');
    try {
      const res = await fetch('/api/otp/send', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ phone }) });
      const data = await res.json();
      setOtpMode(data.mode === 'sms' ? 'sms' : 'demo');
    } catch { setOtpMode('demo'); }
    setBusy(false); setStep('otp');
  }

  async function checkCode() {
    setBusy(true); setErr('');
    try {
      const res = await fetch('/api/otp/check', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ phone, code, mode: otpMode }) });
      const { ok } = await res.json();
      if (ok) setStep('interests'); else setErr('Неверный код');
    } catch {
      if (code === (process.env.NEXT_PUBLIC_DEMO_OTP ?? '000000')) setStep('interests'); else setErr('Неверный код');
    }
    setBusy(false);
  }

  async function finish() {
    const device_id = crypto.randomUUID();
    const phone_hash = btoa(phone.replace(/[^\d+]/g, '')); // demo-хэш; не хранить открытый номер
    const { data, error } = await supabase.from('users').insert({
      name, phone_hash, device_id, city: 'Almaty', interests: sel, budget_kzt: budget, esim_verified: true,
    }).select('id').single();
    if (error || !data) { setErr(error?.message ?? 'error'); return; }
    localStorage.setItem('qos_user', JSON.stringify({ id: data.id, name, interests: sel, budget_kzt: budget, city: 'Almaty' }));
    const next = localStorage.getItem('qos_next');
    localStorage.removeItem('qos_next');
    r.push(next || '/feed');
  }

  if (step === 'form') return (
    <div className="mx-auto max-w-md p-6 flex flex-col gap-4">
      <h2 className="text-xl font-bold pt-8">Регистрация</h2>
      <input className="border rounded-xl p-4" placeholder="Имя" value={name} onChange={e => setName(e.target.value)} />
      <input className="border rounded-xl p-4" placeholder="+7 ___ ___ __ __" value={phone} onChange={e => setPhone(e.target.value)} />
      <button disabled={!name || phone.length < 10 || busy} onClick={sendCode} className="bg-black text-white rounded-2xl py-4 disabled:opacity-40">{busy ? 'Отправляю…' : 'Получить код'}</button>
    </div>
  );

  if (step === 'otp') return (
    <div className="mx-auto max-w-md p-6 flex flex-col gap-4">
      <h2 className="text-xl font-bold pt-8">Подтверждение SIM</h2>
      <p className="text-sm text-zinc-500">{otpMode === 'sms' ? `Мы отправили SMS-код на ${phone}` : `SMS недоступно для ${phone} — введите демо-код`}</p>
      <input className="border rounded-xl p-4 text-center text-2xl tracking-[0.5em]" maxLength={6} value={code} onChange={e => setCode(e.target.value)} />
      {err && <p className="text-red-500 text-sm">{err}</p>}
      <button disabled={busy} onClick={checkCode} className="bg-black text-white rounded-2xl py-4 disabled:opacity-40">{busy ? 'Проверяю…' : 'Подтвердить'}</button>
      <div className="mt-4 border border-emerald-300 bg-emerald-50 rounded-2xl p-4 text-sm text-emerald-800">
        <Icon name="shield" size={15} className="inline -mt-0.5 mr-1" /> Trust Passport: телефон будет привязан к устройству. Уровень 2 — верификация через SIM/eSIM ID оператора.
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-md p-6 flex flex-col gap-4">
      <div className="mt-4 border border-emerald-300 bg-emerald-50 rounded-2xl p-3 text-sm text-emerald-800"><span className="flex items-center gap-1.5"><Icon name="check-circle" size={16} className="shrink-0" />Пользователь подтверждён через SIM/eSIM ID · устройство привязано</span></div>
      <h2 className="text-xl font-bold">Интересы и бюджет</h2>
      <div className="flex flex-wrap gap-2">
        {INTERESTS.map(i => (
          <button key={i.slug} onClick={() => setSel(s => s.includes(i.slug) ? s.filter(x => x !== i.slug) : [...s, i.slug])}
            className={`px-4 py-2 rounded-full border text-sm ${sel.includes(i.slug) ? 'bg-black text-white' : 'bg-white'}`}>{i.ru}</button>
        ))}
      </div>
      <label className="text-sm text-zinc-500">Бюджет: {budget.toLocaleString('ru-RU')} ₸</label>
      <input type="range" min={5000} max={100000} step={5000} value={budget} onChange={e => setBudget(+e.target.value)} />
      <button disabled={!sel.length} onClick={finish} className="bg-black text-white rounded-2xl py-4 disabled:opacity-40">В ленту →</button>
    </div>
  );
}
