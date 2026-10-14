import { QueryClient } from '@tanstack/react-query';
import { expect, it } from 'vitest';
import { updateLists } from '@/features/leads/lib/cache';
import { leads } from './server';
import type { Lead } from '@/features/leads/api/types';
it('maintains membership across every cached status/search combination', () => {
  const client = new QueryClient();
  const lead = leads[0];
  if (!lead) throw new Error('Missing fixture');
  const all = ['leads', {}];
  const proposal = ['leads', { status: 'proposal_sent' }];
  const won = ['leads', { status: 'won' }];
  const search = ['leads', { q: 'Bill' }];
  client.setQueryData(all, leads);
  client.setQueryData(proposal, [lead]);
  client.setQueryData(won, []);
  client.setQueryData(
    search,
    leads.filter((item) => item.name.includes('Bill')),
  );
  updateLists(client, { ...lead, status: 'won' });
  expect(client.getQueryData<Lead[]>(proposal)).toEqual([]);
  expect(client.getQueryData<Lead[]>(won)?.[0]?.id).toBe(lead.id);
  expect(
    client.getQueryData<Lead[]>(all)?.find((item) => item.id === lead.id)
      ?.status,
  ).toBe('won');
  expect(client.getQueryData<Lead[]>(search)?.map((item) => item.name)).toEqual(
    ['Bill Lumbergh'],
  );
});
