import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { leadsApi } from '../api/leads.api';
import { resync, updateLists } from '../lib/cache';
import { leadKeys } from './useLeads';
export function useCreateLead() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: leadsApi.create,
    onSuccess: async (lead) => {
      await client.cancelQueries({ queryKey: leadKeys.lists });
      updateLists(client, lead);
      resync(client);
      toast.success('Lead added');
    },
    onError: (error) => toast.error(error.message),
  });
}
