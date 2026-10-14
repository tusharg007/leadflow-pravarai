import { useQuery } from '@tanstack/react-query';
import { leadsApi } from '../api/leads.api';
import type { LeadFilters } from '../api/types';
export const leadKeys = {
  lists: ['leads'] as const,
  list: (filters: LeadFilters) => ['leads', filters] as const,
  detail: (id: string) => ['lead', id] as const,
};
export function useLeads(filters: LeadFilters) {
  return useQuery({
    queryKey: leadKeys.list(filters),
    queryFn: ({ signal }) => leadsApi.list(filters, signal),
  });
}
