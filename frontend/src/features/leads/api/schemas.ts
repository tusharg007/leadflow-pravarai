import { z } from 'zod';
export const statuses = ['new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost'] as const;
export const statusSchema = z.enum(statuses);
const id = z.string().regex(/^[a-f0-9]{24}$/i);
const timestamp = z.iso.datetime();
export const leadSchema = z.strictObject({
  id, name: z.string().min(1).max(120), company: z.string().max(120).nullable(), phone: z.string().max(30).nullable(),
  status: statusSchema, followUpAt: timestamp.nullable(), lastNote: z.string().nullable(), lastDiscussionAt: timestamp.nullable(), createdAt: timestamp, updatedAt: timestamp,
});
export const discussionSchema = z.strictObject({ id, leadId: id, content: z.string().min(1).max(5000), kind: z.enum(['note', 'system']), followUpAt: timestamp.nullable(), createdAt: timestamp });
export const leadDetailSchema = leadSchema.extend({ discussions: discussionSchema.array() });
export const addDiscussionResponseSchema = z.strictObject({ discussion: discussionSchema, lead: leadSchema });
export const errorSchema = z.strictObject({ error: z.strictObject({ code: z.enum(['validation_error', 'not_found', 'internal_error']), message: z.string(), details: z.array(z.strictObject({ field: z.string(), message: z.string() })).optional() }) });
