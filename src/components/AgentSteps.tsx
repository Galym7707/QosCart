// src/components/AgentSteps.tsx
export type Step = { text: string; done: boolean };

export default function AgentSteps({ steps }: { steps: Step[] }) {
  if (!steps.length) return null;
  return (
    <div className="flex flex-col gap-1.5 bg-zinc-50 border rounded-2xl px-4 py-3 text-xs text-zinc-600">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          {s.done
            ? <span className="text-emerald-600">✓</span>
            : <span className="w-3 h-3 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin shrink-0" />}
          <span className={s.done ? '' : 'text-zinc-900 font-medium'}>{s.text}</span>
        </div>
      ))}
    </div>
  );
}
