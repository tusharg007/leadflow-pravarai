import { Plus, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
export function Header({ onAdd }: { onAdd?: () => void }) {
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-[62rem] items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <h1 className="flex items-center gap-2 text-xl font-bold text-brand-600 sm:text-2xl">
          <TrendingUp aria-hidden="true" className="size-5" />
          LeadFlow
        </h1>
        <Button
          className="add-lead-trigger px-3 sm:px-4"
          onClick={onAdd}
          disabled={!onAdd}
        >
          <Plus className="size-4" aria-hidden="true" />
          <span>Add New Lead</span>
        </Button>
      </div>
    </header>
  );
}
