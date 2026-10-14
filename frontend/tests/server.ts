import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { z } from 'zod';
import type { Discussion, Lead, LeadDetail } from '@/features/leads/api/types';
import { statusSchema } from '@/features/leads/api/schemas';

export const base = 'http://localhost:4000/api';
const now = () => new Date().toISOString();
const dateAt = (offset: number, hour: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};
let counter = 100;
const nextId = () => (++counter).toString(16).padStart(24, '0');
export let leads: Lead[] = [];
export let histories: Record<string, Discussion[]> = {};
export const listRequests: string[] = [];
export function resetData() {
  counter = 100;
  listRequests.length = 0;
  leads = [
    {
      id: '507f1f77bcf86cd799439011',
      name: 'Sarah Connor',
      company: 'Acme Corp',
      phone: '555-0199',
      status: 'proposal_sent',
      followUpAt: dateAt(2, 14),
      lastNote: 'Sent pricing tier PDF.',
      lastDiscussionAt: now(),
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: '507f1f77bcf86cd799439012',
      name: 'Bill Lumbergh',
      company: 'Initech',
      phone: null,
      status: 'contacted',
      followUpAt: dateAt(-1, 14),
      lastNote: 'Left a voicemail.',
      lastDiscussionAt: now(),
      createdAt: now(),
      updatedAt: now(),
    },
  ];
  histories = Object.fromEntries(
    leads.map((lead) => [
      lead.id,
      [
        {
          id: nextId(),
          leadId: lead.id,
          content: lead.lastNote ?? 'Lead created',
          kind: 'note' as const,
          followUpAt: lead.followUpAt,
          createdAt: now(),
        },
      ],
    ]),
  );
}
resetData();
const missing = () =>
  HttpResponse.json(
    { error: { code: 'not_found', message: 'Lead not found' } },
    { status: 404 },
  );
const createBody = z.object({
  name: z.string(),
  company: z.string().optional(),
  phone: z.string().optional(),
});
const updateBody = z.object({
  status: statusSchema.optional(),
  followUpAt: z.string().nullable().optional(),
});
const noteBody = z.object({
  content: z.string(),
  followUpAt: z.string().nullable().optional(),
});
export const server = setupServer(
  http.get(`${base}/leads`, ({ request }) => {
    listRequests.push(request.url);
    const query = new URL(request.url).searchParams;
    return HttpResponse.json(
      leads.filter(
        (lead) =>
          (!query.get('status') || lead.status === query.get('status')) &&
          lead.name
            .toLowerCase()
            .includes((query.get('q') ?? '').toLowerCase()),
      ),
    );
  }),
  http.get(`${base}/leads/:id`, ({ params }) => {
    const lead = leads.find((item) => item.id === params.id);
    if (!lead) return missing();
    const detail: LeadDetail = {
      ...lead,
      discussions: histories[lead.id] ?? [],
    };
    return HttpResponse.json(detail);
  }),
  http.post(`${base}/leads`, async ({ request }) => {
    const input = createBody.parse(await request.json());
    const lead: Lead = {
      id: nextId(),
      name: input.name.trim(),
      company: input.company?.trim() || null,
      phone: input.phone?.trim() || null,
      status: 'new',
      followUpAt: null,
      lastNote: 'Lead created',
      lastDiscussionAt: now(),
      createdAt: now(),
      updatedAt: now(),
    };
    leads.unshift(lead);
    histories[lead.id] = [
      {
        id: nextId(),
        leadId: lead.id,
        content: 'Lead created',
        kind: 'system',
        followUpAt: null,
        createdAt: now(),
      },
    ];
    return HttpResponse.json(lead, { status: 201 });
  }),
  http.patch(`${base}/leads/:id`, async ({ params, request }) => {
    const lead = leads.find((item) => item.id === params.id);
    if (!lead) return missing();
    Object.assign(lead, updateBody.parse(await request.json()), {
      updatedAt: now(),
    });
    return HttpResponse.json(lead);
  }),
  http.post(`${base}/leads/:id/discussions`, async ({ params, request }) => {
    const lead = leads.find((item) => item.id === params.id);
    if (!lead) return missing();
    const input = noteBody.parse(await request.json());
    const discussion: Discussion = {
      id: nextId(),
      leadId: lead.id,
      content: input.content,
      kind: 'note',
      followUpAt: input.followUpAt ?? null,
      createdAt: now(),
    };
    (histories[lead.id] ??= []).unshift(discussion);
    Object.assign(
      lead,
      {
        lastNote: discussion.content,
        lastDiscussionAt: discussion.createdAt,
        updatedAt: now(),
      },
      input.followUpAt !== undefined ? { followUpAt: input.followUpAt } : {},
    );
    return HttpResponse.json({ discussion, lead }, { status: 201 });
  }),
);
