import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { FollowUpChip } from '@/features/leads/components/FollowUpChip';
import { absoluteTime, timeOf } from '@/features/leads/lib/format';

const now = new Date(2026, 9, 14, 12);
it.each([
  { date: new Date(2026, 9, 14, 11, 59), kind: 'overdue', color: 'red' },
  { date: new Date(2026, 9, 13, 23, 59), kind: 'overdue', color: 'red' },
  { date: now, kind: 'today', color: 'blue' },
  { date: new Date(2026, 9, 14, 23, 59), kind: 'today', color: 'blue' },
  { date: new Date(2026, 9, 15), kind: 'upcoming', color: 'slate' },
])('shows $kind styling for $date', ({ date, kind, color }) => {
  const value = date.toISOString();
  const label =
    kind === 'overdue'
      ? `Overdue: ${absoluteTime(value)}`
      : kind === 'today'
        ? `Follow-up today at ${timeOf(value)}`
        : `Follow-up: ${absoluteTime(value)}`;
  render(<FollowUpChip value={value} now={now} />);
  expect(screen.getByText(label).parentElement).toHaveClass(
    `bg-${color}-100`,
    `text-${color}-${color === 'slate' ? '700' : '800'}`,
  );
});

it.each([new Date(2026, 9, 14, 11, 59), now, new Date(2026, 9, 15)])(
  'keeps closed reminders neutral at %s',
  (date) => {
    const value = date.toISOString();
    render(<FollowUpChip value={value} now={now} closed />);
    const chip = screen.getByText(
      `Follow-up: ${absoluteTime(value)}`,
    ).parentElement;
    expect(chip).toHaveClass('bg-slate-100', 'text-slate-700');
    expect(chip).not.toHaveClass('bg-red-100');
    expect(chip).not.toHaveClass('bg-blue-100');
    expect(screen.queryByText(/^Overdue:/)).not.toBeInTheDocument();
  },
);
