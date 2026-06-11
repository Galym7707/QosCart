// src/lib/social.ts
export type FriendLite = { id: string; name: string; interests: string[] };

export function suggestInvitees(friends: FriendLite[], poolCategory: string, memberIds: Set<string>, limit = 3): FriendLite[] {
  return friends
    .filter(f => !memberIds.has(f.id))
    .sort((a, b) => {
      const ai = a.interests.includes(poolCategory) ? 0 : 1;
      const bi = b.interests.includes(poolCategory) ? 0 : 1;
      return ai - bi || a.name.localeCompare(b.name, 'ru');
    })
    .slice(0, limit);
}
