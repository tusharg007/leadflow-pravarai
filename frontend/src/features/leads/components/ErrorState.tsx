import { Button } from '@/components/ui/Button';
export function ErrorState({
  error,
  onRetry,
}: {
  error: Error;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-white p-6 text-center"
    >
      <p className="text-sm text-red-800">{error.message}</p>
      <Button variant="secondary" className="mt-4" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}
