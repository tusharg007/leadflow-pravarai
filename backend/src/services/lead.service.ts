import type { FilterQuery } from 'mongoose';
import { Lead, type LeadRecord } from '../models/lead.model.js';
import { Discussion } from '../models/discussion.model.js';
import type {
  CreateLeadInput,
  ListLeadQuery,
  UpdateLeadInput,
} from '../schemas/lead.schema.js';
import { AppError } from '../utils/AppError.js';
import { escapeRegex } from '../utils/escapeRegex.js';
import { serializeLead, serializeDiscussion } from '../utils/serialize.js';

export async function listLeads(query: ListLeadQuery) {
  const filter: FilterQuery<LeadRecord> = {};
  if (query.status) filter.status = query.status;
  if (query.q) filter.name = { $regex: escapeRegex(query.q), $options: 'i' };
  const leads = await Lead.find(filter)
    .sort({ lastDiscussionAt: -1, _id: -1 })
    .lean();
  return leads.map(serializeLead);
}

export async function createLead(input: CreateLeadInput) {
  const lead = new Lead(input);
  const discussion = new Discussion({
    leadId: lead._id,
    content: 'Lead created',
    kind: 'system',
  });
  discussion.createdAt = new Date();
  lead.lastNote = discussion.content;
  lead.lastDiscussionAt = discussion.createdAt;
  await lead.save();
  try {
    await discussion.save();
  } catch (error) {
    await Lead.deleteOne({ _id: lead._id });
    throw error;
  }
  return serializeLead(lead);
}

export async function getLead(id: string) {
  const lead = await Lead.findById(id).lean();
  if (!lead) throw new AppError(404, 'not_found', 'Lead not found');
  const discussions = await Discussion.find({ leadId: id })
    .sort({ createdAt: -1, _id: -1 })
    .lean();
  return {
    ...serializeLead(lead),
    discussions: discussions.map(serializeDiscussion),
  };
}

export async function updateLead(id: string, input: UpdateLeadInput) {
  const lead = await Lead.findOneAndUpdate(
    { _id: id },
    { $set: input },
    {
      new: true,
      runValidators: true,
    },
  );
  if (!lead) throw new AppError(404, 'not_found', 'Lead not found');
  return serializeLead(lead);
}
