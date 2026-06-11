// src/lib/currency.ts
export function usdToKzt(usd: number, rate = Number(process.env.USD_TO_KZT ?? 520)): number {
  return Math.round((usd * rate) / 10) * 10;
}
export function formatKzt(kzt: number): string {
  return `${new Intl.NumberFormat('ru-RU').format(kzt).replace(/ /g, ' ')} ₸`;
}
