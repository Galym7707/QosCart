// src/lib/scoring.ts
import { formatKzt } from './currency';

export type ScoreInputProduct = { category: string; price_kzt: number; rating?: number | null };
export type Profile = { interests: string[]; budget_kzt?: number | null; city: string };
export type ScoreCtx = { cityDemand?: boolean; poolProgress?: number; trustShare?: number };
export type Chip = { label: string; hit: boolean };

export function scoreProduct(p: ScoreInputProduct, u: Profile, ctx: ScoreCtx): { score: number; chips: Chip[] } {
  let score = 0;
  const chips: Chip[] = [];

  const interestHit = u.interests.includes(p.category);
  if (interestHit) score += 25;
  chips.push({ label: `Интерес: ${p.category}`, hit: interestHit });

  let budgetPts = 0;
  if (u.budget_kzt) {
    if (p.price_kzt <= u.budget_kzt) budgetPts = 20;
    else if (p.price_kzt <= u.budget_kzt * 1.2) budgetPts = 10;
  }
  score += budgetPts;
  chips.push({ label: `Бюджет: до ${formatKzt(u.budget_kzt ?? 0)}`, hit: budgetPts > 0 });

  if (ctx.cityDemand) score += 15;
  chips.push({ label: `Спрос в ${u.city}`, hit: !!ctx.cityDemand });

  let q = 0;
  if (p.rating != null) q = p.rating >= 4.5 ? 20 : p.rating >= 4 ? 15 : p.rating >= 3.5 ? 10 : 5;
  score += q;
  chips.push({ label: `Рейтинг ${p.rating ?? '—'}`, hit: q >= 15 });

  if ((ctx.poolProgress ?? 0) >= 0.7) score += 10;
  chips.push({ label: 'Группа почти собрана', hit: (ctx.poolProgress ?? 0) >= 0.7 });

  if ((ctx.trustShare ?? 0) >= 0.8) score += 10;
  chips.push({ label: 'Участники верифицированы', hit: (ctx.trustShare ?? 0) >= 0.8 });

  return { score, chips };
}
