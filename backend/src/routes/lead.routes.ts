import { Router } from 'express';
import * as controller from '../controllers/lead.controller.js';
import { addDiscussion } from '../controllers/discussion.controller.js';
import { validate } from '../middleware/validate.js';
import {
  createLeadRequest,
  leadDetailRequest,
  listLeadRequest,
  updateLeadRequest,
} from '../schemas/lead.schema.js';
import { createDiscussionRequest } from '../schemas/discussion.schema.js';

export const leadRoutes = Router();
leadRoutes.get('/', validate(listLeadRequest), controller.listLeads);
leadRoutes.post('/', validate(createLeadRequest), controller.createLead);
leadRoutes.get('/:id', validate(leadDetailRequest), controller.getLead);
leadRoutes.patch('/:id', validate(updateLeadRequest), controller.updateLead);
leadRoutes.post(
  '/:id/discussions',
  validate(createDiscussionRequest),
  addDiscussion,
);
