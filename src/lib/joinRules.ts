// src/lib/joinRules.ts
export type PoolRow = { status: string; min_participants: number; current_participants: number; expires_at: string };
export type UserRow = { id: string; esim_verified: boolean; phone_hash: string; device_id: string };
export type MemberRow = { user_id: string; phone_hash: string; device_id: string };
export type JoinCheck = { ok: true } | { ok: false; reason: 'expired' | 'closed' | 'not_verified' | 'duplicate' };

export function canJoin(pool: PoolRow, user: UserRow, members: MemberRow[], now = new Date()): JoinCheck {
  if (pool.status === 'completed' || pool.status === 'expired') return { ok: false, reason: 'closed' };
  if (new Date(pool.expires_at) <= now) return { ok: false, reason: 'expired' };
  if (!user.esim_verified) return { ok: false, reason: 'not_verified' };
  const dup = members.some(m => m.user_id === user.id || m.phone_hash === user.phone_hash || m.device_id === user.device_id);
  if (dup) return { ok: false, reason: 'duplicate' };
  return { ok: true };
}

export function applyJoin(pool: PoolRow): { current_participants: number; status: string } {
  const n = pool.current_participants + 1;
  return { current_participants: n, status: n >= pool.min_participants ? 'unlocked' : pool.status };
}
