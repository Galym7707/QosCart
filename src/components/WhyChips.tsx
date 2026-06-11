// src/components/WhyChips.tsx
import type { Chip } from '@/lib/scoring';
export default function WhyChips({ chips }: { chips: Chip[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.filter(c => c.hit).map(c => (
        <span key={c.label} className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5">✓ {c.label}</span>
      ))}
    </div>
  );
}
