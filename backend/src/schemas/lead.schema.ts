import { z } from 'zod';
import { leadStatuses } from '../models/lead.model.js';
import { normalizeOptionalString } from '../utils/normalizeOptionalString.js';

export const followUpSchema = z.iso.datetime({ offset: true })
  .regex(/T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/, 'Include seconds and a timezone offset')
  .refine((value) => Number.isFinite(new Date(value).getTime()), 'Invalid timestamp')
  .transform((value) => new Date(value)).nullable();

export const idParamSchema = z.strictObject({
  id: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid lead ID'),
});

const optionalString = (max: number) => z.string().trim().max(max)
  .nullish().transform(normalizeOptionalString);

export const createLeadSchema = z.strictObject({
  name: z.string().trim().min(1, 'Name is required').max(120),
  company: optionalString(120),
  phone: optionalString(30),
});

export const updateLeadSchema = z.strictObject({
  status: z.enum(leadStatuses).optional(),
  followUpAt: followUpSchema.optional(),
}).refine((body) => body.status !== undefined || body.followUpAt !== undefined, {
  message: 'Provide status or followUpAt',
});

export const listQuerySchema = z.strictObject({
  status: z.enum(leadStatuses).optional(),
  q: z.string().trim().max(100).optional(),
});

export const createLeadRequest = z.object({ body: createLeadSchema });
export const updateLeadRequest = z.object({ params: idParamSchema, body: updateLeadSchema });
export const listLeadRequest = z.object({ query: listQuerySchema });
export const leadDetailRequest = z.object({ params: idParamSchema });

export type CreateLeadInput = z.output<typeof createLeadSchema>;
export type UpdateLeadInput = z.output<typeof updateLeadSchema>;
export type ListLeadQuery = z.output<typeof listQuerySchema>;
