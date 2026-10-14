import type { Discussion } from '../api/types';
import { TimelineEntry } from './TimelineEntry';
export function Timeline({
  entries,
  now,
}: {
  entries: Discussion[];
  now: Date;
}) {
  return entries.length ? (
    <ol
      aria-label="Discussion history"
      className="ml-2 border-l-2 border-slate-200"
    >
      {entries.map((entry, index) => (
        <TimelineEntry
          key={entry.id}
          entry={entry}
          now={now}
          latest={index === 0}
        />
      ))}
    </ol>
  ) : (
    <p className="text-sm text-slate-600">No discussions yet.</p>
  );
}
