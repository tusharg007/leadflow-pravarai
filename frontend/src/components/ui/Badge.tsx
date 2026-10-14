import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

export function Badge({ className, ...props }: ComponentProps<'span'>) {
  return <span className={cn('inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-medium', className)} {...props} />;
}
