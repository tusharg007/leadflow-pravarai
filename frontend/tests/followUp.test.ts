import { expect, it } from 'vitest';
import { classify, partition } from '@/features/leads/lib/followUp';

const now = new Date(2026, 9, 14, 12);
it('uses local day boundaries at 23:59, 00:00 and exactly now', () => {
  expect(classify(new Date(2026, 9, 13, 23, 59).toISOString(), now)).toBe(
    'overdue',
  );
  expect(classify(new Date(2026, 9, 14, 0, 0).toISOString(), now)).toBe(
    'today',
  );
  expect(classify(now.toISOString(), now)).toBe('today');
  expect(classify(new Date(2026, 9, 14, 23, 59).toISOString(), now)).toBe(
    'today',
  );
  expect(classify(new Date(2026, 9, 15, 0, 0).toISOString(), now)).toBe(
    'upcoming',
  );
  expect(classify(null, now)).toBe('none');
});
it('partitions once, sorts today by time, preserves API order for everything else', () => {
  const leads = [
    { id: 'late', followUpAt: new Date(2026, 9, 14, 16).toISOString() },
    { id: 'overdue', followUpAt: new Date(2026, 9, 13).toISOString() },
    { id: 'early', followUpAt: new Date(2026, 9, 14, 9).toISOString() },
    { id: 'none', followUpAt: null },
  ];
  const result = partition(leads, now);
  expect(result.today.map((lead) => lead.id)).toEqual(['early', 'late']);
  expect(result.rest.map((lead) => lead.id)).toEqual(['overdue', 'none']);
});
it.each([new Date(2026, 2, 8, 12), new Date(2026, 10, 1, 12)])(
  'handles a DST transition day %s without assuming 24 hours',
  (date) => {
    const end = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
    );
    const next = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + 1,
    );
    expect(classify(end.toISOString(), date)).toBe('today');
    expect(classify(next.toISOString(), date)).toBe('upcoming');
  },
);
it('moves a previous today follow-up to overdue after midnight', () => {
  const timestamp = new Date(2026, 9, 14, 20).toISOString();
  expect(classify(timestamp, new Date(2026, 9, 14, 23, 59))).toBe('today');
  expect(classify(timestamp, new Date(2026, 9, 15))).toBe('overdue');
});
