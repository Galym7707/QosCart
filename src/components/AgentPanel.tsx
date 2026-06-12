// src/components/AgentPanel.tsx
'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import ProductCard from './ProductCard';
import AgentSteps, { Step } from './AgentSteps';
import WhyPanel from './WhyPanel';
import { splitSseEvents } from '@/lib/sse';
import { suggestInvitees, FriendLite } from '@/lib/social';
import VoiceButton from './VoiceButton';
import { useVoice } from '@/hooks/useVoice';
import Icon from './Icon';

type Msg = {
  role: 'user' | 'agent';
  text?: string;
  steps?: Step[];
  products?: any[];
  pool?: any;
  done?: boolean;
};

export default function AgentPanel({ fullScreen = false }: { fullScreen?: boolean }) {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'agent', text: 'Что хотите купить? Например: «наушники до 20 000 тенге»', done: true },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const lastQuery = useRef('');
  const [profile] = useState(() => (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('qos_user') ?? 'null') : null));

  const voice = useVoice(text => send(text));

  function patchLast(patch: Partial<Msg>) {
    setMsgs(m => [...m.slice(0, -1), { ...m[m.length - 1], ...patch }]);
  }

  async function send(message: string) {
    if (!message.trim() || busy) return;
    lastQuery.current = message;
    setMsgs(m => [...m, { role: 'user', text: message, done: true }, { role: 'agent', steps: [] }]);
    setInput(''); setBusy(true);
    try {
      try {
      const res = await fetch('/api/agent', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message, profile, stream: true }),
      });
      if (!res.body) throw new Error('no stream');
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = '';
      let steps: Step[] = [];
      for (;;) {
        const { value, done } = await reader.read();
        if (done) { buf += dec.decode(); break; }
        buf += dec.decode(value, { stream: true });
        const { events, rest } = splitSseEvents(buf);
        buf = rest;
        for (const ev of events) {
          if (ev.event === 'step') {
            steps = [...steps.map(s => ({ ...s, done: true })), { text: (ev.data as any).text, done: false }];
            patchLast({ steps });
          } else if (ev.event === 'result') {
            const r = ev.data as any;
            patchLast({ steps: steps.map(s => ({ ...s, done: true })), text: r.explanation, products: r.products, pool: r.pool, done: true });
            voice.speak(r.explanation ?? '');
          }
        }
      }
      } catch {
        const res = await fetch('/api/agent', {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ message, profile }),
        });
        const r = await res.json();
        patchLast({ steps: [], text: r.explanation, products: r.products, pool: r.pool, done: true });
        voice.speak(r.explanation ?? '');
      }
    } catch {
      patchLast({ steps: [], text: 'Агент недоступен — попробуйте ещё раз.', done: true });
    } finally {
      setBusy(false);
    }
  }

  async function inviteFriends(pool: any) {
    if (!profile?.id) { setMsgs(m => [...m, { role: 'agent', text: 'Сначала пройдите регистрацию.', done: true }]); return; }
    const fRes = await fetch(`/api/friends?userId=${profile.id}`).then(r => r.json()).catch(() => ({ friends: [] }));
    const friends: FriendLite[] = fRes.friends ?? [];
    if (!friends.length) {
      setMsgs(m => [...m, { role: 'agent', text: 'У вас пока нет друзей в QosCart. Добавьте их в профиле — и собирайте группы вместе.', done: true }]);
      return;
    }
    const picks = suggestInvitees(friends, '', new Set());
    const names = picks.map(f => f.name).join(', ');
    const link = pool ? `${location.origin}/product/${pool.product_id}?invite=${profile.id}` : location.origin;
    await navigator.clipboard.writeText(link).catch(() => {});
    setMsgs(m => [...m, { role: 'agent', text: `Позовите: ${names}. Ссылка-приглашение скопирована — отправьте её, и вы автоматически станете друзьями в QosCart.`, done: true }]);
  }

  return (
    <div className={`flex flex-col ${fullScreen ? 'min-h-[calc(100vh-3.5rem)]' : 'h-full'}`}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b">
        <p className="text-sm font-semibold flex items-center gap-2"><Icon name="agent" size={18} />AI-агент</p>
        <button style={{ marginRight: fullScreen ? 0 : 40 }} onClick={voice.toggleTts} aria-label={voice.ttsOn ? 'Выключить озвучку' : 'Включить озвучку'}
          className="w-9 h-9 rounded-full hover:bg-zinc-100 flex items-center justify-center">{voice.ttsOn ? <Icon name="volume" size={18} /> : <Icon name="volume-off" size={18} />}</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 pb-32">
        {msgs.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'self-end bg-zinc-900 text-white rounded-2xl px-4 py-2 max-w-[80%] text-sm' : 'self-start w-full flex flex-col gap-2'}>
            {m.role === 'user' ? m.text : (
              <>
                {m.steps && m.steps.length > 0 && <AgentSteps steps={m.steps} />}
                {m.text && <p className="bg-zinc-100 rounded-2xl px-4 py-2.5 text-sm">{m.text}</p>}
                {m.products && (
                  <div className="grid grid-cols-2 gap-2">
                    {m.products.map(p => (
                      <div key={p.id} className="flex flex-col gap-1">
                        <ProductCard p={p} pool={m.pool && m.pool.product_id === p.id ? m.pool : null} />
                        {p.factors && <WhyPanel factors={p.factors} score={p.score} />}
                      </div>
                    ))}
                  </div>
                )}
                {m.pool && (
                  <Link href={`/product/${m.pool.product_id}`} className="block border border-amber-300 bg-amber-50 rounded-2xl p-3 text-sm">
                    <Icon name="flame" size={16} className="inline -mt-0.5 mr-1 text-amber-600" /> {m.pool.name}: {m.pool.current_participants}/{m.pool.min_participants} — нужно ещё {m.pool.min_participants - m.pool.current_participants} →
                  </Link>
                )}
                {m.done && m.products && (
                  <div className="flex flex-wrap gap-1.5">
                    <button onClick={() => send(`${lastQuery.current} дешевле`)} className="text-xs border rounded-full px-3 py-1.5 bg-white hover:border-zinc-400">Похожие дешевле</button>
                    {m.pool && <button onClick={() => inviteFriends(m.pool)} className="text-xs border rounded-full px-3 py-1.5 bg-white hover:border-zinc-400">Собрать группу с друзьями</button>}
                    <button onClick={() => send(`${lastQuery.current} ещё варианты`)} className="text-xs border rounded-full px-3 py-1.5 bg-white hover:border-zinc-400">Показать ещё</button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
      <div className={`${fullScreen ? 'fixed bottom-16 inset-x-0 lg:bottom-0 max-w-2xl mx-auto' : 'absolute bottom-0 inset-x-0'} p-3 bg-white border-t flex gap-2`}>
        <input
          aria-label="Сообщение агенту"
          className="flex-1 border rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          value={voice.listening && voice.interim ? voice.interim : input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send(input)}
          placeholder={voice.listening ? 'Говорите…' : 'Что хотите купить?'} />
        {voice.supported && <VoiceButton listening={voice.listening} onStart={voice.start} onStop={voice.stop} />}
        <button onClick={() => send(input)} disabled={busy} aria-label="Отправить"
          className="bg-zinc-900 text-white rounded-full w-12 h-12 shrink-0 disabled:opacity-40 flex items-center justify-center"><Icon name="arrow-right" size={20} /></button>
      </div>
    </div>
  );
}
