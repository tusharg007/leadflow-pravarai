import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { leadsApi } from '../api/leads.api';
import type { AddDiscussion } from '../api/types';
import { resync, updateDetail, updateLists } from '../lib/cache';
import { leadKeys } from './useLeads';
export function useAddDiscussion(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationKey: ['add-discussion', id],
    mutationFn: (input: AddDiscussion) => leadsApi.addDiscussion(id, input),
    onMutate: async () => {
      await Promise.all([
        client.cancelQueries({ queryKey: leadKeys.lists }),
        client.cancelQueries({ queryKey: leadKeys.detail(id) }),
      ]);
    },
    onSuccess: ({ lead, discussion }) => {
      updateDetail(client, lead, discussion);
      updateLists(client, lead);
      resync(client, id);
      toast.success('Note saved');
    },
    onError: (error) => toast.error(error.message),
  });
}
