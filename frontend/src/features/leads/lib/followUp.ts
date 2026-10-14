export type FollowUpKind = 'today' | 'overdue' | 'upcoming' | 'none';
export function isPastDue(followUpAt: string | null, now: Date): boolean {
  if (!followUpAt) return false;
  return new Date(followUpAt).getTime() < now.getTime();
}
export function classify(followUpAt: string | null, now: Date): FollowUpKind {
  if (!followUpAt) return 'none';
  const time = new Date(followUpAt).getTime();
  if (!Number.isFinite(time)) return 'none';
  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const next = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  ).getTime();
  return time < start ? 'overdue' : time < next ? 'today' : 'upcoming';
}
export function partition<T extends { followUpAt: string | null }>(
  leads: readonly T[],
  now: Date,
) {
  const today: T[] = [];
  const rest: T[] = [];
  for (const lead of leads)
    (classify(lead.followUpAt, now) === 'today' ? today : rest).push(lead);
  today.sort(
    (a, b) =>
      new Date(a.followUpAt ?? '').getTime() -
      new Date(b.followUpAt ?? '').getTime(),
  );
  return { today, rest };
}
