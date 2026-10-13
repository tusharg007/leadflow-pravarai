import { Discussion } from '../models/discussion.model.js';
import { Lead, type LeadRecord } from '../models/lead.model.js';
import type { CreateDiscussionInput } from '../schemas/discussion.schema.js';
import { AppError } from '../utils/AppError.js';
import { serializeLead, serializeDiscussion } from '../utils/serialize.js';

export async function createDiscussion(id: string, input: CreateDiscussionInput) {
  if (!await Lead.exists({ _id: id })) throw new AppError(404, 'not_found', 'Lead not found');
  const discussion = await Discussion.create({ leadId: id, ...input });
  const changes: Partial<LeadRecord> = {
    lastNote: discussion.content,
    lastDiscussionAt: discussion.createdAt,
  };
  if (input.followUpAt !== undefined) changes.followUpAt = input.followUpAt;
  try {
    const lead = await Lead.findOneAndUpdate({ _id: id }, { $set: changes }, {
      new: true, runValidators: true,
    });
    if (!lead) throw new AppError(404, 'not_found', 'Lead not found');
    return { discussion: serializeDiscussion(discussion), lead: serializeLead(lead) };
  } catch (error) {
    await Discussion.deleteOne({ _id: discussion._id });
    throw error;
  }
}
