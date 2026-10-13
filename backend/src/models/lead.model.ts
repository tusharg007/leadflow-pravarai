import { Schema, model } from 'mongoose';
import { normalizeOptionalString } from '../utils/normalizeOptionalString.js';

export const leadStatuses = [
  'new',
  'contacted',
  'qualified',
  'proposal_sent',
  'won',
  'lost',
] as const;
export type LeadStatus = (typeof leadStatuses)[number];

export interface LeadRecord {
  name: string;
  company: string | null;
  phone: string | null;
  status: LeadStatus;
  followUpAt: Date | null;
  lastNote: string | null;
  lastDiscussionAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<LeadRecord>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 120,
    },
    company: {
      type: String,
      maxlength: 120,
      default: null,
      set: normalizeOptionalString,
    },
    phone: {
      type: String,
      maxlength: 30,
      default: null,
      set: normalizeOptionalString,
    },
    status: {
      type: String,
      enum: leadStatuses,
      required: true,
      default: 'new',
    },
    followUpAt: { type: Date, default: null },
    lastNote: { type: String, default: null },
    lastDiscussionAt: { type: Date, default: null },
  },
  { timestamps: true },
);

leadSchema.index({ status: 1, lastDiscussionAt: -1 });
leadSchema.index({ followUpAt: 1 });
leadSchema.index({ name: 1 });

export const Lead = model<LeadRecord>('Lead', leadSchema);
