import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import { fieldClass } from './Input';

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return <textarea className={cn(fieldClass, 'min-h-20 resize-y py-2', className)} {...props} />;
}
