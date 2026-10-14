'use client';
import { useState } from 'react';
import { useLeadUrlState } from '../hooks/useLeadUrlState';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useNow } from '../hooks/useNow';
import { useLeads } from '../hooks/useLeads';
import { Header } from './Header';
import { StatusFilter } from './StatusFilter';
import { LeadSearch } from './LeadSearch';
import { LeadList } from './LeadList';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { ListSkeleton } from './ListSkeleton';
import { AddLeadDialog } from './AddLeadDialog';
import { LeadTimelineDialog } from './LeadTimelineDialog';

export function LeadScreen() {
  const [adding, setAdding] = useState(false);
  const url = useLeadUrlState();
  const q = useDebouncedValue(url.q.trim());
  const filters = {
    ...(url.status ? { status: url.status } : {}),
    ...(q ? { q } : {}),
  };
  const query = useLeads(filters);
  const now = useNow();
  return (
    <>
      <Header onAdd={() => setAdding(true)} />
      <main className="mx-auto max-w-[62rem] px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-7 flex flex-col-reverse gap-4">
          <StatusFilter
            status={url.status}
            onChange={(value) => url.setParam('status', value)}
          />
          <div className="sm:self-end">
            <LeadSearch
              value={url.q}
              onChange={(value) => url.setParam('q', value)}
            />
          </div>
        </div>
        {query.isPending ? (
          <ListSkeleton />
        ) : query.isError ? (
          <ErrorState
            error={query.error}
            onRetry={() => {
              void query.refetch();
            }}
          />
        ) : query.data.length ? (
          <LeadList
            leads={query.data}
            now={now}
            onOpen={(id) => url.setParam('lead', id)}
          />
        ) : (
          <EmptyState filtered={Boolean(url.status || q)} />
        )}
      </main>
      {adding && <AddLeadDialog onClose={() => setAdding(false)} />}
      {url.leadId && (
        <LeadTimelineDialog
          key={url.leadId}
          id={url.leadId}
          onClose={() => url.setParam('lead', undefined)}
        />
      )}
    </>
  );
}
