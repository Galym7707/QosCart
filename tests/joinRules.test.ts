// tests/joinRules.test.ts
import { describe, it, expect } from 'vitest';
import { canJoin, applyJoin } from '../src/lib/joinRules';

const now = new Date('2026-06-12T12:00:00Z');
const pool = (over = {}) => ({
  status: 'forming', min_participants: 10, current_participants: 7,
  expires_at: '2026-06-13T12:00:00Z', ...over,
});
const user = (over = {}) => ({ id: 'u1', esim_verified: true, phone_hash: 'ph1', device_id: 'd1', ...over });

describe('canJoin', () => {
  it('ok для верифицированного нового участника', () => {
    expect(canJoin(pool(), user(), [], now)).toEqual({ ok: true });
  });
  it('блок: пул истёк по TTL', () => {
    expect(canJoin(pool({ expires_at: '2026-06-12T11:00:00Z' }), user(), [], now)).toEqual({ ok: false, reason: 'expired' });
  });
  it('блок: не верифицирован (Trust Passport)', () => {
    expect(canJoin(pool(), user({ esim_verified: false }), [], now)).toEqual({ ok: false, reason: 'not_verified' });
  });
  it('блок: дубликат пользователя/телефона/устройства', () => {
    const members = [{ user_id: 'u1', phone_hash: 'phX', device_id: 'dX' }];
    expect(canJoin(pool(), user(), members, now)).toEqual({ ok: false, reason: 'duplicate' });
    const members2 = [{ user_id: 'uX', phone_hash: 'ph1', device_id: 'dX' }];
    expect(canJoin(pool(), user(), members2, now)).toEqual({ ok: false, reason: 'duplicate' });
    const members3 = [{ user_id: 'uX', phone_hash: 'phX', device_id: 'd1' }];
    expect(canJoin(pool(), user(), members3, now)).toEqual({ ok: false, reason: 'duplicate' });
  });
  it('блок: пул уже completed', () => {
    expect(canJoin(pool({ status: 'completed' }), user(), [], now)).toEqual({ ok: false, reason: 'closed' });
  });
});

describe('applyJoin', () => {
  it('инкремент; при достижении min — статус unlocked (порог 10 из ТЗ)', () => {
    expect(applyJoin(pool({ current_participants: 8 }))).toEqual({ current_participants: 9, status: 'forming' });
    expect(applyJoin(pool({ current_participants: 9 }))).toEqual({ current_participants: 10, status: 'unlocked' });
  });
});
