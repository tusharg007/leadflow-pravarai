import type { LeadStatus } from '../api/types';
export const statusLabels: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  proposal_sent: 'Proposal Sent',
  won: 'Won',
  lost: 'Lost',
};
export const statusColors: Record<LeadStatus, string> = {
  new: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  contacted: 'border-amber-200 bg-amber-50 text-amber-800',
  qualified: 'border-blue-200 bg-blue-50 text-blue-800',
  proposal_sent: 'border-purple-200 bg-purple-50 text-purple-800',
  won: 'border-slate-200 bg-slate-100 text-slate-700',
  lost: 'border-rose-200 bg-rose-50 text-rose-800',
};
