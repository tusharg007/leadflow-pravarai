import type { z } from 'zod';
import type { ApiHandler } from '../middleware/validate.js';
import type {
  createLeadRequest,
  leadDetailRequest,
  listLeadRequest,
  updateLeadRequest,
} from '../schemas/lead.schema.js';
import * as service from '../services/lead.service.js';

export const listLeads: ApiHandler<z.output<typeof listLeadRequest>> = async (
  _req,
  res,
) => {
  res.json(await service.listLeads(res.locals.input.query));
};
export const createLead: ApiHandler<
  z.output<typeof createLeadRequest>
> = async (_req, res) => {
  res.status(201).json(await service.createLead(res.locals.input.body));
};
export const getLead: ApiHandler<z.output<typeof leadDetailRequest>> = async (
  _req,
  res,
) => {
  res.json(await service.getLead(res.locals.input.params.id));
};
export const updateLead: ApiHandler<
  z.output<typeof updateLeadRequest>
> = async (_req, res) => {
  const { params, body } = res.locals.input;
  res.json(await service.updateLead(params.id, body));
};
