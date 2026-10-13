import type { Types } from 'mongoose';
import type { LeadRecord } from '../models/lead.model.js';
import type { DiscussionRecord } from '../models/discussion.model.js';

export function serializeLead(lead: LeadRecord & { _id: Types.ObjectId }) {
  return {
    id: lead._id.toHexString(),
    name: lead.name,
    company: lead.company,
    phone: lead.phone,
    status: lead.status,
    followUpAt: lead.followUpAt?.toISOString() ?? null,
    lastNote: lead.lastNote,
    lastDiscussionAt: lead.lastDiscussionAt?.toISOString() ?? null,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  };
}

export function serializeDiscussion(discussion: DiscussionRecord & { _id: Types.ObjectId }) {
  return {
    id: discussion._id.toHexString(),
    leadId: discussion.leadId.toHexString(),
    content: discussion.content,
    kind: discussion.kind,
    followUpAt: discussion.followUpAt?.toISOString() ?? null,
    createdAt: discussion.createdAt.toISOString(),
  };
}
