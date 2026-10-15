import { AlarmClock } from 'lucide-react';
import { classify, isPastDue } from '../lib/followUp';
import { absoluteTime, timeOf } from '../lib/format';
import { cn } from '@/lib/cn';
export function FollowUpChip({
  value,
  now,
  closed = false,
}: {
  value: string | null;
  now: Date;
  closed?: boolean;
}) {
  const kind = classify(value, now);
  const pastDue = !closed && isPastDue(value, now);
  const today = !closed && kind === 'today';
  if (!value || kind === 'none') return null;
  return (
    <span
      title={absoluteTime(value)}
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 rounded px-2 py-1 text-xs font-medium',
        pastDue
          ? 'bg-red-100 text-red-800'
          : today
            ? 'bg-blue-100 text-blue-800'
            : 'bg-slate-100 text-slate-700',
      )}
    >
      <AlarmClock aria-hidden="true" className="size-3.5 shrink-0" />
      <span>
        {pastDue
          ? `Overdue: ${absoluteTime(value)}`
          : today
            ? `Follow-up today at ${timeOf(value)}`
            : `Follow-up: ${absoluteTime(value)}`}
      </span>
    </span>
  );
}
