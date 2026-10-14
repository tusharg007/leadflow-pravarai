import { useQuery } from '@tanstack/react-query';
import { leadsApi } from '../api/leads.api';
import { leadKeys } from './useLeads';
export function useLeadDetail(id: string) {
  return useQuery({
    queryKey: leadKeys.detail(id),
    queryFn: ({ signal }) => leadsApi.detail(id, signal),
  });
}
