import type { QueryClient } from '@tanstack/react-query';
import type { Discussion, Lead, LeadDetail, LeadFilters } from '../api/types';
import { z } from 'zod';
import { statusSchema } from '../api/schemas';
import { leadKeys } from '../hooks/useLeads';

const filtersSchema = z.object({
  status: statusSchema.optional(),
  q: z.string().optional(),
});
export function matches(lead: Lead, filters: LeadFilters): boolean {
  return (
    (!filters.status || lead.status === filters.status) &&
    (!filters.q ||
      lead.name.toLowerCase().includes(filters.q.trim().toLowerCase()))
  );
}
export function updateLists(client: QueryClient, lead: Lead): void {
  for (const [key, data] of client.getQueriesData<Lead[]>({
    queryKey: leadKeys.lists,
  })) {
    if (!data) continue;
    const filters = filtersSchema.safeParse(key[1]);
    if (!filters.success) continue;
    const without = data.filter((item) => item.id !== lead.id);
    const selected: LeadFilters = {
      ...(filters.data.status ? { status: filters.data.status } : {}),
      ...(filters.data.q ? { q: filters.data.q } : {}),
    };
    const next = matches(lead, selected) ? [...without, lead] : without;
    next.sort(
      (a, b) =>
        (b.lastDiscussionAt ? Date.parse(b.lastDiscussionAt) : -Infinity) -
          (a.lastDiscussionAt ? Date.parse(a.lastDiscussionAt) : -Infinity) ||
        b.id.localeCompare(a.id),
    );
    client.setQueryData(key, next);
  }
}
export function updateDetail(
  client: QueryClient,
  lead: Lead,
  discussion?: Discussion,
): void {
  client.setQueryData<LeadDetail>(leadKeys.detail(lead.id), (old) =>
    old
      ? {
          ...old,
          ...lead,
          discussions: discussion
            ? [
                discussion,
                ...old.discussions.filter((item) => item.id !== discussion.id),
              ].sort(
                (a, b) =>
                  Date.parse(b.createdAt) - Date.parse(a.createdAt) ||
                  b.id.localeCompare(a.id),
              )
            : old.discussions,
        }
      : undefined,
  );
}
export function cachedLead(client: QueryClient, id: string): Lead | undefined {
  return client
    .getQueriesData<Lead[]>({ queryKey: leadKeys.lists })
    .flatMap(([, data]) => data ?? [])
    .find((lead) => lead.id === id);
}
export function resync(client: QueryClient, id?: string): void {
  void client.invalidateQueries({ queryKey: leadKeys.lists });
  if (id) void client.invalidateQueries({ queryKey: leadKeys.detail(id) });
}
