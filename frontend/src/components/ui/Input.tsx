import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

export const fieldClass =
  'w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-ink placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 disabled:bg-slate-100 disabled:cursor-not-allowed';
export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(fieldClass, 'min-h-10', className)} {...props} />;
}
