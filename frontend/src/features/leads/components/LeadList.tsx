import { Pin } from 'lucide-react';
import type { Lead } from '../api/types';
import { partition } from '../lib/followUp';
import { LeadCard } from './LeadCard';
export function LeadList({
  leads,
  now,
  onOpen,
}: {
  leads: Lead[];
  now: Date;
  onOpen: (id: string) => void;
}) {
  const { today, rest } = partition(leads, now);
  return (
    <div className="space-y-8">
      {[
        { title: "Today's follow-ups", items: today, pinned: true },
        { title: 'All leads', items: rest, pinned: false },
      ].map((section) => (
        <section key={section.title} aria-label={section.title}>
          <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-600">
            {section.pinned && (
              <Pin className="size-3.5 text-red-700" aria-hidden="true" />
            )}
            {section.title}
            <span className="sr-only"> ({section.items.length})</span>
          </h2>
          {section.items.length ? (
            <div className="space-y-3">
              {section.items.map((lead) => (
                <LeadCard key={lead.id} lead={lead} now={now} onOpen={onOpen} />
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-600">
              {section.pinned ? 'No follow-ups today.' : 'No other leads.'}
            </p>
          )}
        </section>
      ))}
    </div>
  );
}
