import type { z } from 'zod';
import type {
  discussionSchema,
  leadDetailSchema,
  leadSchema,
  statusSchema,
} from './schemas';
export type Lead = z.infer<typeof leadSchema>;
export type LeadDetail = z.infer<typeof leadDetailSchema>;
export type Discussion = z.infer<typeof discussionSchema>;
export type LeadStatus = z.infer<typeof statusSchema>;
export interface LeadFilters {
  status?: LeadStatus;
  q?: string;
}
export interface CreateLead {
  name: string;
  company?: string | null;
  phone?: string | null;
}
export interface UpdateLead {
  status?: LeadStatus;
  followUpAt?: string | null;
}
export interface AddDiscussion {
  content: string;
  followUpAt?: string | null;
}
