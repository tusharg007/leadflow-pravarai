import { statuses } from '../api/schemas';
import type { LeadStatus } from '../api/types';
import { statusLabels } from '../lib/status';
import { cn } from '@/lib/cn';
export function StatusFilter({
  status,
  onChange,
}: {
  status: LeadStatus | undefined;
  onChange: (status: LeadStatus | undefined) => void;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="shrink-0 text-xs font-semibold tracking-wide text-slate-600">
        FILTERS:
      </span>
      <div
        className="flex gap-2 overflow-x-auto py-1"
        role="group"
        aria-label="Filter by status"
      >
        {(['all', ...statuses] as const).map((value) => {
          const selected =
            value === 'all' ? status === undefined : status === value;
          return (
            <button
              key={value}
              aria-pressed={selected}
              onClick={() => onChange(value === 'all' ? undefined : value)}
              className={cn(
                'min-h-10 shrink-0 rounded-full border px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2',
                selected
                  ? 'border-slate-800 bg-slate-800 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100',
              )}
            >
              {value === 'all' ? 'All' : statusLabels[value]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
