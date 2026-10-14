import { Skeleton } from '@/components/ui/Skeleton';
export function ListSkeleton() {
  return (
    <div role="status" aria-label="Loading leads" className="space-y-3">
      <span className="sr-only">Loading leads...</span>
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="space-y-3 rounded-lg border border-line bg-white p-5"
        >
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}
