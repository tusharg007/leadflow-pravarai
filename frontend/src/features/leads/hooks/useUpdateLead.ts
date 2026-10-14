import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { leadsApi } from '../api/leads.api';
import type { Lead, LeadDetail, UpdateLead } from '../api/types';
import { cachedLead, resync, updateDetail, updateLists } from '../lib/cache';
import { leadKeys } from './useLeads';
export function useUpdateLead(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationKey: ['update-lead', id],
    mutationFn: (input: UpdateLead) => leadsApi.update(id, input),
    onMutate: async (input) => {
      await Promise.all([
        client.cancelQueries({ queryKey: leadKeys.lists }),
        client.cancelQueries({ queryKey: leadKeys.detail(id) }),
      ]);
      const lists = client.getQueriesData<Lead[]>({ queryKey: leadKeys.lists });
      const detail = client.getQueryData<LeadDetail>(leadKeys.detail(id));
      const lead = cachedLead(client, id);
      if (lead) updateLists(client, { ...lead, ...input });
      if (detail)
        client.setQueryData(leadKeys.detail(id), { ...detail, ...input });
      return { lists, detail };
    },
    onError: (error, _input, context) => {
      for (const [key, data] of context?.lists ?? [])
        client.setQueryData(key, data);
      if (context?.detail)
        client.setQueryData(leadKeys.detail(id), context.detail);
      toast.error(error.message);
    },
    onSuccess: (lead) => {
      updateLists(client, lead);
      updateDetail(client, lead);
      toast.success('Lead updated');
    },
    onSettled: () => resync(client, id),
  });
}
