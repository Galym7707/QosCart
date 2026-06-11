import Icon from './Icon';
// src/components/TrustBadge.tsx
export default function TrustBadge() {
  return <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5"><Icon name="shield" size={12} />eSIM verified</span>;
}
