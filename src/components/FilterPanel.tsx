// src/components/FilterPanel.tsx
'use client';
import { CATEGORIES } from '@/lib/categories';
import { DEFAULT_FILTERS, FilterState } from '@/lib/filters';
import { COLORS } from '@/lib/attributes';
import { facetsForSub, facetValueLabel } from '@/lib/facets';
import Icon from './Icon';

export default function FilterPanel({ f, onChange }: { f: FilterState; onChange: (f: FilterState) => void }) {
  const set = (patch: Partial<FilterState>) => onChange({ ...f, ...patch });
  const cat = CATEGORIES.find(c => c.slug === f.cat);
  const facets = facetsForSub(f.sub);
  const toggleColor = (slug: string) =>
    set({ colors: f.colors.includes(slug) ? f.colors.filter(c => c !== slug) : [...f.colors, slug] });
  const toggleAttr = (key: string, val: string) => {
    const cur = f.attrs[key] ?? [];
    const next = cur.includes(val) ? cur.filter(v => v !== val) : [...cur, val];
    const attrs = { ...f.attrs };
    if (next.length) attrs[key] = next; else delete attrs[key];
    set({ attrs });
  };
  return (
    <div className="flex flex-col gap-5 text-sm">
      <section>
        <p className="font-semibold mb-2">Категории</p>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => set({ cat: null, sub: null, attrs: {} })}
            className={`px-3 py-1.5 rounded-full border text-xs ${!f.cat ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white'}`}>Все</button>
          {CATEGORIES.map(c => (
            <button key={c.slug} onClick={() => set({ cat: c.slug, sub: null, attrs: {} })}
              className={`px-3 py-1.5 rounded-full border text-xs ${f.cat === c.slug ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white'}`}>
              {c.ru}
            </button>
          ))}
        </div>
        {cat && (
          <div className="flex flex-wrap gap-1.5 mt-2 pl-1 border-l-2 border-zinc-200">
            {cat.subs.map(s => (
              <button key={s.slug} onClick={() => set({ sub: f.sub === s.slug ? null : s.slug, attrs: {} })}
                className={`px-3 py-1 rounded-full border text-xs ${f.sub === s.slug ? 'bg-zinc-700 text-white border-zinc-700' : 'bg-white text-zinc-600'}`}>
                {s.ru}
              </button>
            ))}
          </div>
        )}
      </section>

      {facets.length > 0 && facets.map(fc => (
        <section key={fc.key}>
          <p className="font-semibold mb-2">{fc.ru}{fc.unit ? `, ${fc.unit}` : ''}</p>
          <div className="flex flex-col gap-1.5">
            {fc.values.map(v => (
              <label key={v} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={(f.attrs[fc.key] ?? []).includes(v)}
                  onChange={() => toggleAttr(fc.key, v)} className="w-4 h-4 accent-zinc-900" />
                {facetValueLabel({ ...fc, unit: undefined }, v)}{fc.unit ? ` ${fc.unit}` : ''}
              </label>
            ))}
          </div>
        </section>
      ))}

      <section>
        <p className="font-semibold mb-2">Цвет</p>
        <div className="flex flex-wrap gap-2">
          {COLORS.map(c => {
            const on = f.colors.includes(c.slug);
            return (
              <button key={c.slug} type="button" onClick={() => toggleColor(c.slug)}
                aria-label={c.ru} aria-pressed={on} title={c.ru}
                className={`w-7 h-7 rounded-full border flex items-center justify-center transition
                  ${on ? 'ring-2 ring-zinc-900 ring-offset-1 border-transparent' : 'border-zinc-200 hover:border-zinc-400'}`}
                style={{ backgroundColor: c.hex }}>
                {on && <Icon name="check-circle" size={14} className={['white','silver','beige','yellow'].includes(c.slug) ? 'text-zinc-900' : 'text-white'} />}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <p className="font-semibold mb-2">Цена, ₸</p>
        <div className="flex items-center gap-2">
          <input type="number" inputMode="numeric" placeholder="от" value={f.min ?? ''}
            onChange={e => { const v = e.target.value; set({ min: v === '' || Number.isNaN(+v) ? null : +v }); }}
            className="w-full border rounded-xl px-3 py-2" />
          <span className="text-zinc-400">—</span>
          <input type="number" inputMode="numeric" placeholder="до" value={f.max ?? ''}
            onChange={e => { const v = e.target.value; set({ max: v === '' || Number.isNaN(+v) ? null : +v }); }}
            className="w-full border rounded-xl px-3 py-2" />
        </div>
      </section>

      <section>
        <p className="font-semibold mb-2">Рейтинг</p>
        <div className="flex gap-1.5">
          {[4.5, 4, 3.5].map(r => (
            <button key={r} onClick={() => set({ rating: f.rating === r ? null : r })}
              className={`px-3 py-1.5 rounded-full border text-xs ${f.rating === r ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white'}`}>
              ★ {r}+
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={f.pool} onChange={e => set({ pool: e.target.checked })} className="w-4 h-4 accent-zinc-900" />
          Только с активной группой
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={f.liked} onChange={e => set({ liked: e.target.checked })} className="w-4 h-4 accent-zinc-900" />
          Только избранное
        </label>
      </section>

      <button onClick={() => onChange({ ...DEFAULT_FILTERS, q: f.q })} className="text-xs text-zinc-500 underline self-start">
        Сбросить фильтры
      </button>
    </div>
  );
}
