import { AlarmClock } from 'lucide-react';
import { classify } from '../lib/followUp';
import { absoluteTime, timeOf } from '../lib/format';
import { cn } from '@/lib/cn';
export function FollowUpChip({
  value,
  now,
}: {
  value: string | null;
  now: Date;
}) {
  const kind = classify(value, now);
  if (!value || kind === 'none') return null;
  return (
    <span
      title={absoluteTime(value)}
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 rounded px-2 py-1 text-xs font-medium',
        kind === 'today'
          ? 'bg-blue-100 text-blue-800'
          : kind === 'overdue'
            ? 'bg-red-100 text-red-800'
            : 'bg-slate-100 text-slate-700',
      )}
    >
      <AlarmClock aria-hidden="true" className="size-3.5 shrink-0" />
      <span>
        {kind === 'today'
          ? `Follow-up today at ${timeOf(value)}`
          : `${kind === 'overdue' ? 'Overdue' : 'Follow-up'}: ${absoluteTime(value)}`}
      </span>
    </span>
  );
}
