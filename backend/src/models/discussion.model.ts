import { Schema, model, type Types } from 'mongoose';

export interface DiscussionRecord {
  leadId: Types.ObjectId;
  content: string;
  kind: 'note' | 'system';
  followUpAt: Date | null;
  createdAt: Date;
}

const discussionSchema = new Schema<DiscussionRecord>({
  leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
  content: { type: String, required: true, trim: true, minlength: 1, maxlength: 5000 },
  kind: { type: String, enum: ['note', 'system'], required: true, default: 'note' },
  followUpAt: { type: Date, default: null },
}, { timestamps: { createdAt: true, updatedAt: false } });

discussionSchema.index({ leadId: 1, createdAt: -1 });

export const Discussion = model<DiscussionRecord>('Discussion', discussionSchema);
