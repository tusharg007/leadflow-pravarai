import { z } from 'zod';
import { followUpSchema, idParamSchema } from './lead.schema.js';

export const createDiscussionSchema = z.strictObject({
  content: z.string().trim().min(1, 'Discussion content is required').max(5000),
  followUpAt: followUpSchema.optional(),
});
export const createDiscussionRequest = z.object({
  params: idParamSchema,
  body: createDiscussionSchema,
});
export type CreateDiscussionInput = z.output<typeof createDiscussionSchema>;
