import { expect, it } from 'vitest';
import { relativeTime } from '@/features/leads/lib/format';

it('describes a new discussion as ago when it is newer than the cached clock', () => {
  const now = new Date('2026-10-16T00:00:00Z');
  expect(relativeTime('2026-10-16T00:00:30Z', now)).toBe(
    'less than a minute ago',
  );
});

it('keeps the elapsed age for an older discussion', () => {
  const now = new Date('2026-10-16T00:00:00Z');
  expect(relativeTime('2026-10-15T22:00:00Z', now)).toBe('about 2 hours ago');
});
