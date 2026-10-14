import { useIsMutating } from '@tanstack/react-query';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { useLeadDetail } from '../hooks/useLeadDetail';
import { useUpdateLead } from '../hooks/useUpdateLead';
import { useNow } from '../hooks/useNow';
import { DiscussionForm } from './DiscussionForm';
import { Timeline } from './Timeline';
import { StatusSelect } from './StatusSelect';
import { ErrorState } from './ErrorState';
import { ListSkeleton } from './ListSkeleton';
import { FollowUpChip } from './FollowUpChip';
export function LeadTimelineDialog({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const query = useLeadDetail(id);
  const now = useNow();
  const update = useUpdateLead(id);
  const pending =
    useIsMutating({
      predicate: (mutation) =>
        mutation.options.mutationKey?.includes(id) ?? false,
    }) > 0;
  const data = query.data;
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={
        data ? (
          <>
            {data.name}
            {data.company && (
              <span className="font-normal text-slate-600">
                {' '}
                ({data.company})
              </span>
            )}
          </>
        ) : (
          'Lead timeline'
        )
      }
      subtitle={data?.phone}
      actions={
        data && <StatusSelect id={id} status={data.status} disabled={pending} />
      }
      description="Discussion history, status and follow-up details."
      className="max-w-2xl"
      returnFocus={() => {
        const trigger = Array.from(
          document.querySelectorAll<HTMLButtonElement>('[data-lead-id]'),
        ).find((item) => item.dataset.leadId === id);
        (
          trigger ?? document.querySelector<HTMLInputElement>('#lead-search')
        )?.focus();
      }}
    >
      <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-5 sm:p-6">
        {query.isPending ? (
          <ListSkeleton />
        ) : query.isError ? (
          <ErrorState
            error={query.error}
            onRetry={() => {
              void query.refetch();
            }}
          />
        ) : data ? (
          <>
            {data.followUpAt && (
              <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                <FollowUpChip value={data.followUpAt} now={now} />
                <Button
                  variant="ghost"
                  disabled={pending}
                  loading={update.isPending}
                  onClick={() => update.mutate({ followUpAt: null })}
                >
                  Clear follow-up
                </Button>
              </div>
            )}
            <Timeline entries={data.discussions} now={now} />
          </>
        ) : null}
      </div>
      {data && !query.isError && (
        <DiscussionForm id={id} disabled={pending} now={now} />
      )}
    </Dialog>
  );
}
