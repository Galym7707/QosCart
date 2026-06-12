// src/components/Icon.tsx — единый набор stroke-иконок (заменяет emoji)
type IconName =
  | 'cart' | 'bag' | 'agent' | 'heart' | 'heart-filled' | 'user' | 'users'
  | 'search' | 'x' | 'mic' | 'volume' | 'volume-off' | 'flame' | 'shield'
  | 'share' | 'undo' | 'arrow-up' | 'arrow-right' | 'grid' | 'check-circle';

const PATHS: Record<IconName, React.ReactNode> = {
  cart: (
    <>
      <circle cx="9" cy="20" r="1.6" />
      <circle cx="17" cy="20" r="1.6" />
      <path d="M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.47 1.18h7.66a1.5 1.5 0 0 0 1.46-1.15L20 8H6" />
    </>
  ),
  bag: <path d="M6 8h12l-.8 11.2a1.8 1.8 0 0 1-1.8 1.66H8.6a1.8 1.8 0 0 1-1.8-1.66L6 8Zm3 0V6.8a3 3 0 0 1 6 0V8" />,
  agent: (
    <>
      <rect x="5" y="8" width="14" height="10" rx="3" />
      <path d="M12 8V5m0 0h.01M9 13h.01M15 13h.01M9.5 16h5" />
    </>
  ),
  heart: <path d="M12 20s-6.6-4.1-8.5-8A4.8 4.8 0 0 1 12 7.3 4.8 4.8 0 0 1 20.5 12c-1.9 3.9-8.5 8-8.5 8Z" />,
  'heart-filled': <path fill="currentColor" stroke="none" d="M12 20s-6.6-4.1-8.5-8A4.8 4.8 0 0 1 12 7.3 4.8 4.8 0 0 1 20.5 12c-1.9 3.9-8.5 8-8.5 8Z" />,
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 19.5a7 7 0 0 1 14 0" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="9" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0M15.5 6.6a3 3 0 0 1 0 4.8M17.5 13.7a5.5 5.5 0 0 1 3 4.8" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-3.8-3.8" />
    </>
  ),
  x: <path d="M6 6l12 12M18 6L6 18" />,
  mic: (
    <>
      <rect x="9.2" y="3.5" width="5.6" height="10" rx="2.8" />
      <path d="M6 11.5a6 6 0 0 0 12 0M12 17.5V21" />
    </>
  ),
  volume: (
    <>
      <path d="M4 9.5v5h3.2L12 19V5L7.2 9.5H4Z" />
      <path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.6a8 8 0 0 1 0 10.8" />
    </>
  ),
  'volume-off': (
    <>
      <path d="M4 9.5v5h3.2L12 19V5L7.2 9.5H4Z" />
      <path d="m16 9.5 5 5m0-5-5 5" />
    </>
  ),
  flame: <path d="M12 21c3.9 0 6.5-2.5 6.5-6 0-2.6-1.6-4.4-3-6-.6 1-1.3 1.6-2 1.9.2-2.4-.8-5-3-6.9.2 2.3-.7 3.6-1.9 5C7.2 10.6 5.5 12.4 5.5 15c0 3.5 2.6 6 6.5 6Z" />,
  shield: <path d="M12 3.5 5.5 6v5.2c0 4.2 2.8 7.4 6.5 9.3 3.7-1.9 6.5-5.1 6.5-9.3V6L12 3.5Zm-2.8 8.1 2 2 3.6-3.8" />,
  share: <path d="M12 14.5V4m0 0L8.5 7.5M12 4l3.5 3.5M6 12v6.5A1.5 1.5 0 0 0 7.5 20h9a1.5 1.5 0 0 0 1.5-1.5V12" />,
  undo: <path d="M8.5 7H15a4.5 4.5 0 0 1 0 9H7M8.5 7 11 4.5M8.5 7 11 9.5" />,
  'arrow-up': <path d="M12 19V5m0 0-5.5 5.5M12 5l5.5 5.5" />,
  'arrow-right': <path d="M5 12h14m0 0-5.5-5.5M19 12l-5.5 5.5" />,
  grid: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </>
  ),
  'check-circle': (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 12.2 2.4 2.4 4.6-5" />
    </>
  ),
};

export default function Icon({ name, size = 20, className = '', strokeWidth = 1.8 }:
  { name: IconName; size?: number; className?: string; strokeWidth?: number }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"
      fill="none" stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      {PATHS[name]}
    </svg>
  );
}
