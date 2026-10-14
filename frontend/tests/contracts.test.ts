import { expect, it } from 'vitest';
import { leadSchema, errorSchema } from '@/features/leads/api/schemas';

const lead = { id: '507f1f77bcf86cd799439011', name: 'Sarah Connor', company: null, phone: null, status: 'new', followUpAt: null, lastNote: 'Lead created', lastDiscussionAt: '2026-10-14T00:00:00.000Z', createdAt: '2026-10-14T00:00:00.000Z', updatedAt: '2026-10-14T00:00:00.000Z' };
it('validates the API contract and rejects internal fields', () => {
  expect(leadSchema.parse(lead).name).toBe('Sarah Connor');
  expect(leadSchema.safeParse({ ...lead, _id: lead.id }).success).toBe(false);
});
it('rejects invalid timestamps and statuses', () => {
  expect(leadSchema.safeParse({ ...lead, status: 'other' }).success).toBe(false);
  expect(leadSchema.safeParse({ ...lead, followUpAt: 'tomorrow' }).success).toBe(false);
});
it('accepts validation field details in the error envelope', () => {
  expect(errorSchema.parse({ error: { code: 'validation_error', message: 'Invalid', details: [{ field: 'name', message: 'Required' }] } }).error.details?.[0]?.field).toBe('name');
});
