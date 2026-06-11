// src/lib/llm.ts
import OpenAI from 'openai';
import type { Chip } from './scoring';

export type Intent = { query_en: string; budget_max: number | null; city: string; category: string | null };

const CITIES: Record<string, string> = { 'алматы': 'Almaty', 'астана': 'Astana', 'шымкент': 'Shymkent', 'almaty': 'Almaty', 'astana': 'Astana' };
const CATS = ['electronics', 'audio', 'computers', 'appliances', 'home', 'kitchen', 'fashion', 'beauty', 'sport', 'study', 'kids', 'travel'];

export function fallbackParse(text: string): Intent {
  const budget = text.match(/(\d[\d\s]{2,})\s*(kzt|тг|тенге|₸)/i);
  const budget_max = budget ? parseInt(budget[1].replace(/\s/g, ''), 10) : null;
  let city = 'Almaty';
  for (const [k, v] of Object.entries(CITIES)) if (text.toLowerCase().includes(k)) { city = v; break; }
  const query_en = text
    .replace(/до\s*\d[\d\s]*\s*(kzt|тг|тенге|₸)/i, '')
    .replace(/\b(найди|найти|купи|купить|нужен|нужна|нужно|хочу)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s,]+|[\s,]+$/g, '');
  return { query_en, budget_max, city, category: null };
}

function groq() {
  return new OpenAI({ baseURL: 'https://api.groq.com/openai/v1', apiKey: process.env.GROQ_API_KEY });
}

export async function parseIntent(text: string): Promise<Intent> {
  try {
    const res = await groq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: `Extract purchase intent JSON {"query_en": string, "budget_max": number|null (KZT), "city": string (default "Almaty"), "category": one of ${JSON.stringify(CATS)} or null}. JSON only.` },
        { role: 'user', content: text },
      ],
    });
    const parsed = JSON.parse(res.choices[0].message.content ?? '{}');
    if (!parsed.query_en) throw new Error('empty');
    return { query_en: parsed.query_en, budget_max: parsed.budget_max ?? null, city: parsed.city ?? 'Almaty', category: CATS.includes(parsed.category) ? parsed.category : null };
  } catch {
    return fallbackParse(text);
  }
}

export function templateExplanation(chips: Chip[], pool: { name: string; current_participants: number; min_participants: number } | null): string {
  const why = chips.filter(c => c.hit).map(c => c.label).join(' · ');
  const poolPart = pool ? ` Уже есть группа «${pool.name}»: ${pool.current_participants}/${pool.min_participants}, нужно ещё ${pool.min_participants - pool.current_participants}.` : '';
  return `Подобрал по вашему профилю: ${why}.${poolPart}`;
}

export async function explain(chips: Chip[], pool: Parameters<typeof templateExplanation>[1], query: string): Promise<string> {
  try {
    const res = await groq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'One friendly sentence in Russian: why the product fits (based on facts below) and suggest the group if any. No fabrications.' },
        { role: 'user', content: `Query: ${query}\nFacts: ${chips.filter(c => c.hit).map(c => c.label).join(', ')}\nGroup: ${pool ? `${pool.name} ${pool.current_participants}/${pool.min_participants}` : 'none'}` },
      ],
    });
    return res.choices[0].message.content ?? templateExplanation(chips, pool);
  } catch {
    return templateExplanation(chips, pool);
  }
}
