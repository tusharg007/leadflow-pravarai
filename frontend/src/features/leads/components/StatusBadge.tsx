import { Badge } from '@/components/ui/Badge';
import type { LeadStatus } from '../api/types';
import { statusColors, statusLabels } from '../lib/status';
export function StatusBadge({ status }: { status: LeadStatus }) {
  return <Badge className={statusColors[status]}>{statusLabels[status]}</Badge>;
}
