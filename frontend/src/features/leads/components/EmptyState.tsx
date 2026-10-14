import { Users } from 'lucide-react';
export function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div
      role="status"
      className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center"
    >
      <Users
        aria-hidden="true"
        className="mx-auto mb-3 size-8 text-slate-400"
      />
      <h2 className="font-semibold">
        {filtered ? 'No matching leads' : 'No leads yet'}
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        {filtered
          ? 'Try another status or search term.'
          : 'Add your first lead to start tracking discussions.'}
      </p>
    </div>
  );
}
