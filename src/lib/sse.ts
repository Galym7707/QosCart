// src/lib/sse.ts
export function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export function splitSseEvents(buffer: string): { events: { event: string; data: unknown }[]; rest: string } {
  const parts = buffer.split('\n\n');
  const rest = parts.pop() ?? '';
  const events: { event: string; data: unknown }[] = [];
  for (const part of parts) {
    const ev = part.match(/^event: (.*)$/m)?.[1];
    const raw = part.match(/^data: (.*)$/m)?.[1];
    if (!ev || raw == null) continue;
    try { events.push({ event: ev, data: JSON.parse(raw) }); } catch { /* битый JSON пропускаем */ }
  }
  return { events, rest };
}
