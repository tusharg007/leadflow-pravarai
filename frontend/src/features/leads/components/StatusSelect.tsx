import { Select } from '@/components/ui/Select';
import { statuses, statusSchema } from '../api/schemas';
import type { LeadStatus } from '../api/types';
import { useUpdateLead } from '../hooks/useUpdateLead';
import { statusLabels } from '../lib/status';
export function StatusSelect({
  id,
  status,
  disabled,
}: {
  id: string;
  status: LeadStatus;
  disabled: boolean;
}) {
  const mutation = useUpdateLead(id);
  return (
    <Select
      label="Lead status"
      value={status}
      disabled={disabled}
      options={statuses.map((value) => ({ value, label: statusLabels[value] }))}
      onValueChange={(value) => {
        const parsed = statusSchema.safeParse(value);
        if (parsed.success) mutation.mutate({ status: parsed.data });
      }}
    />
  );
}
