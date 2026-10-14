import type { Discussion } from '../api/types';
import { absoluteTime, relativeTime } from '../lib/format';
import { cn } from '@/lib/cn';
export function TimelineEntry({
  entry,
  now,
  latest,
}: {
  entry: Discussion;
  now: Date;
  latest: boolean;
}) {
  return (
    <li className="relative pb-5 pl-7 last:pb-0">
      <span
        aria-hidden="true"
        className={cn(
          'absolute -left-[6px] top-1 size-3 rounded-full ring-4 ring-slate-50',
          latest ? 'bg-brand-600' : 'bg-slate-400',
        )}
      />
      <time dateTime={entry.createdAt} className="text-xs text-slate-600">
        {absoluteTime(entry.createdAt)}{' '}
        <span className="text-slate-500">
          ({relativeTime(entry.createdAt, now)})
        </span>
      </time>
      <div className="mt-2 rounded-md border border-line bg-white p-3">
        <p
          className={cn(
            'whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700',
            entry.kind === 'system' && 'italic',
          )}
        >
          {entry.content}
        </p>
        {entry.followUpAt && (
          <p className="mt-2 inline-block rounded bg-brand-50 px-2 py-1 text-xs font-medium text-blue-800">
            Follow-up set for: {absoluteTime(entry.followUpAt)}
          </p>
        )}
      </div>
    </li>
  );
}
