// src/lib/scoring.ts
import { formatKzt } from './currency';

export type ScoreInputProduct = { category: string; price_kzt: number; rating?: number | null };
export type Profile = { interests: string[]; budget_kzt?: number | null; city: string };
export type ScoreCtx = {
  cityDemand?: boolean; poolProgress?: number; trustShare?: number;
  likedCategory?: boolean; friendsInPool?: number;
};
export type Chip = { label: string; hit: boolean };
export type Factor = { key: string; label: string; points: number; max: number };

export function scoreProduct(p: ScoreInputProduct, u: Profile, ctx: ScoreCtx): { score: number; chips: Chip[]; factors: Factor[] } {
  const factors: Factor[] = [];
  const chips: Chip[] = [];
  const add = (key: string, label: string, points: number, max: number, chipLabel: string) => {
    factors.push({ key, label, points, max });
    chips.push({ label: chipLabel, hit: points > 0 });
  };

  const interestHit = u.interests.includes(p.category);
  add('interest', 'Совпадение интересов', interestHit ? 20 : 0, 20, `Интерес: ${p.category}`);

  let budgetPts = 0;
  if (u.budget_kzt) {
    if (p.price_kzt <= u.budget_kzt) budgetPts = 18;
    else if (p.price_kzt <= u.budget_kzt * 1.2) budgetPts = 9;
  }
  add('budget', 'Попадание в бюджет', budgetPts, 18, `Бюджет: до ${formatKzt(u.budget_kzt ?? 0)}`);

  add('city', 'Спрос в городе', ctx.cityDemand ? 12 : 0, 12, `Спрос в ${u.city}`);

  let q = 0;
  if (p.rating != null) q = p.rating >= 4.5 ? 18 : p.rating >= 4 ? 14 : p.rating >= 3.5 ? 9 : 4;
  add('quality', 'Качество (рейтинг)', q, 18, `Рейтинг ${p.rating ?? '—'}`);

  add('momentum', 'Группа почти собрана', (ctx.poolProgress ?? 0) >= 0.7 ? 8 : 0, 8, 'Группа почти собрана');
  add('trust', 'Верификация участников', (ctx.trustShare ?? 0) >= 0.8 ? 8 : 0, 8, 'Участники верифицированы');
  add('liked', 'Похоже на ваши лайки', ctx.likedCategory ? 8 : 0, 8, `Вы лайкали: ${p.category}`);
  add('friends', 'Друзья в группе', (ctx.friendsInPool ?? 0) >= 1 ? 8 : 0, 8, `Друзья в группе: ${ctx.friendsInPool ?? 0}`);

  const score = factors.reduce((s, f) => s + f.points, 0);
  return { score, chips, factors };
}
