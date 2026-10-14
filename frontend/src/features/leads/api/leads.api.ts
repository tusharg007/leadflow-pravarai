import { apiRequest } from './client';
import { addDiscussionResponseSchema, leadDetailSchema, leadSchema } from './schemas';
import type { AddDiscussion, CreateLead, LeadFilters, UpdateLead } from './types';

export const leadsApi = {
  list: (filters: LeadFilters, signal?: AbortSignal) => {
    const query = new URLSearchParams();
    if (filters.status) query.set('status', filters.status);
    if (filters.q) query.set('q', filters.q);
    return apiRequest(`/leads?${query}`, leadSchema.array(), signal ? { signal } : undefined);
  },
  detail: (id: string, signal?: AbortSignal) => apiRequest(`/leads/${encodeURIComponent(id)}`, leadDetailSchema, signal ? { signal } : undefined),
  create: (body: CreateLead) => apiRequest('/leads', leadSchema, { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: UpdateLead) => apiRequest(`/leads/${encodeURIComponent(id)}`, leadSchema, { method: 'PATCH', body: JSON.stringify(body) }),
  addDiscussion: (id: string, body: AddDiscussion) => apiRequest(`/leads/${encodeURIComponent(id)}/discussions`, addDiscussionResponseSchema, { method: 'POST', body: JSON.stringify(body) }),
};
