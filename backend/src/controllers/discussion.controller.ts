import type { z } from 'zod';
import type { ApiHandler } from '../middleware/validate.js';
import type { createDiscussionRequest } from '../schemas/discussion.schema.js';
import { createDiscussion } from '../services/discussion.service.js';

export const addDiscussion: ApiHandler<
  z.output<typeof createDiscussionRequest>
> = async (_req, res) => {
  const { params, body } = res.locals.input;
  res.status(201).json(await createDiscussion(params.id, body));
};
