export function normalizePhone(raw: string): string {
  let p = raw.replace(/[\s\-()]/g, '');
  if (p.startsWith('8') && p.length === 11) p = '+7' + p.slice(1);
  else if (p.startsWith('7') && p.length === 11) p = '+' + p;
  else if (!p.startsWith('+')) p = '+' + p;
  return p;
}
