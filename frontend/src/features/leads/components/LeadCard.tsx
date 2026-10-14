import type { Lead } from '../api/types';
import { classify } from '../lib/followUp';
import { absoluteTime, relativeTime } from '../lib/format';
import { StatusBadge } from './StatusBadge';
import { FollowUpChip } from './FollowUpChip';
import { cn } from '@/lib/cn';
export function LeadCard({
  lead,
  now,
  onOpen,
}: {
  lead: Lead;
  now: Date;
  onOpen: (id: string) => void;
}) {
  const today = classify(lead.followUpAt, now) === 'today';
  return (
    <button
      data-lead-id={lead.id}
      onClick={() => onOpen(lead.id)}
      aria-label={`View ${lead.name}`}
      className={cn(
        'w-full rounded-lg border p-4 text-left shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 sm:p-5',
        today
          ? 'border-blue-200 bg-brand-50 hover:bg-blue-100'
          : 'border-line bg-white hover:border-slate-300',
        ['won', 'lost'].includes(lead.status) && 'bg-slate-50 text-slate-600',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 sm:flex sm:items-baseline sm:gap-1">
          <span
            className="block min-w-0 truncate font-semibold"
            title={lead.name}
          >
            {lead.name}
          </span>
          {lead.company && (
            <span
              className="block min-w-0 truncate text-sm text-slate-600"
              title={lead.company}
            >
              ({lead.company})
            </span>
          )}
        </div>
        <StatusBadge status={lead.status} />
      </div>
      <div className="mt-2 flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:gap-2">
        <p className="min-w-0 truncate" title={lead.lastNote ?? undefined}>
          <strong className="font-medium">Last Note: </strong>
          <span className="text-slate-600">
            {lead.lastNote ?? 'No discussions yet.'}
          </span>
        </p>
        {lead.lastDiscussionAt && (
          <time
            dateTime={lead.lastDiscussionAt}
            title={absoluteTime(lead.lastDiscussionAt)}
            className="shrink-0 text-xs text-slate-500"
          >
            {relativeTime(lead.lastDiscussionAt, now)}
          </time>
        )}
      </div>
      {lead.followUpAt && (
        <div className="mt-3">
          <FollowUpChip value={lead.followUpAt} now={now} />
        </div>
      )}
    </button>
  );
}
