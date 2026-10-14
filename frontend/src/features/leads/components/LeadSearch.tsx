import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
export function LeadSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative w-full sm:w-60">
      <label className="sr-only" htmlFor="lead-search">
        Search leads by name
      </label>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-3 size-4 text-slate-500"
      />
      <Input
        id="lead-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={100}
        placeholder="Search leads..."
        className="pl-9"
      />
    </div>
  );
}
