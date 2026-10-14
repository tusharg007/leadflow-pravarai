import { expect, it } from 'vitest';
import { classify, isPastDue, partition } from '@/features/leads/lib/followUp';

const now = new Date(2026, 9, 14, 12);
it('uses strict elapsed-time overdue boundaries independently of today membership', () => {
  expect(isPastDue(now.toISOString(), now)).toBe(false);
  expect(isPastDue(new Date(now.getTime() - 1).toISOString(), now)).toBe(true);
  const minuteAgo = new Date(now.getTime() - 60_000).toISOString();
  expect(isPastDue(minuteAgo, now)).toBe(true);
  expect(classify(minuteAgo, now)).toBe('today');
  expect(isPastDue(new Date(2026, 9, 14).toISOString(), now)).toBe(true);
  expect(isPastDue(new Date(2026, 9, 14, 23, 59).toISOString(), now)).toBe(
    false,
  );
  expect(isPastDue(new Date(2026, 9, 15).toISOString(), now)).toBe(false);
  expect(isPastDue(null, now)).toBe(false);
  expect(isPastDue('invalid', now)).toBe(false);
  const midnight = new Date(2026, 9, 14);
  expect(isPastDue(midnight.toISOString(), midnight)).toBe(false);
  expect(
    isPastDue(new Date(midnight.getTime() - 1).toISOString(), midnight),
  ).toBe(true);
});
it('compares instants across skipped and repeated DST hours', () => {
  expect(
    isPastDue('2026-03-08T06:59:00Z', new Date('2026-03-08T07:00:00Z')),
  ).toBe(true);
  expect(
    isPastDue('2026-11-01T05:30:00Z', new Date('2026-11-01T06:15:00Z')),
  ).toBe(true);
  expect(
    classify('2026-11-01T05:30:00Z', new Date('2026-11-01T06:15:00Z')),
  ).toBe('today');
});
it('runs DST assertions in a timezone with 23- and 25-hour days', () => {
  expect(new Date(2026, 2, 9).getTime() - new Date(2026, 2, 8).getTime()).toBe(
    23 * 3600000,
  );
  expect(
    new Date(2026, 10, 2).getTime() - new Date(2026, 10, 1).getTime(),
  ).toBe(25 * 3600000);
});
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
    expect(isPastDue(end.toISOString(), date)).toBe(false);
    expect(isPastDue(next.toISOString(), date)).toBe(false);
    const minuteAgo = new Date(date.getTime() - 60_000).toISOString();
    expect(isPastDue(minuteAgo, date)).toBe(true);
    expect(classify(minuteAgo, date)).toBe('today');
    expect(
      isPastDue(
        new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
        ).toISOString(),
        date,
      ),
    ).toBe(true);
    expect(isPastDue(date.toISOString(), date)).toBe(false);
  },
);
it('moves a previous today follow-up to overdue after midnight', () => {
  const timestamp = new Date(2026, 9, 14, 20).toISOString();
  expect(classify(timestamp, new Date(2026, 9, 14, 23, 59))).toBe('today');
  expect(classify(timestamp, new Date(2026, 9, 15))).toBe('overdue');
});
