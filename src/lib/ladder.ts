// src/lib/ladder.ts
export type Tier = { threshold: number; multiplier: number; label: string };
export const TIERS: Tier[] = [
  { threshold: 1,  multiplier: 1.0,  label: 'В одиночку' },
  { threshold: 5,  multiplier: 0.93, label: 'Малая группа' },
  { threshold: 10, multiplier: 0.85, label: 'Основная группа' },
  { threshold: 20, multiplier: 0.78, label: 'Большая группа' },
];
const round10 = (n: number) => Math.round(n / 10) * 10;

export function currentPrice(retailKzt: number, participants: number): number {
  const tier = [...TIERS].reverse().find(t => participants >= t.threshold) ?? TIERS[0];
  return round10(retailKzt * tier.multiplier);
}
export function nextUnlock(retailKzt: number, participants: number) {
  const next = TIERS.find(t => t.threshold > participants);
  return next ? { needed: next.threshold - participants, threshold: next.threshold, price: round10(retailKzt * next.multiplier) } : null;
}
export function savings(retailKzt: number, participants: number): number {
  return retailKzt - currentPrice(retailKzt, participants);
}
export function ladderFor(retailKzt: number) {
  return TIERS.map(t => ({ threshold: t.threshold, price: round10(retailKzt * t.multiplier), label: t.label }));
}
