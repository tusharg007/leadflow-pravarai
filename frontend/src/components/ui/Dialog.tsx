'use client';
import * as Radix from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface Props { open: boolean; onOpenChange: (open: boolean) => void; title: ReactNode; description: string; children: ReactNode; className?: string; returnFocus?: () => void }
export function Dialog({ open, onOpenChange, title, description, children, className, returnFocus }: Props) {
  return <Radix.Root open={open} onOpenChange={onOpenChange}><Radix.Portal>
    <Radix.Overlay className="fixed inset-0 z-40 bg-slate-900/45 backdrop-blur-sm" />
    <Radix.Content onCloseAutoFocus={(event) => { if (returnFocus) { event.preventDefault(); returnFocus(); } }} className={cn('fixed left-1/2 top-1/2 z-50 flex max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl bg-white shadow-xl focus:outline-none', className)}>
      <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line p-5">
        <div className="min-w-0"><Radix.Title className="break-words text-lg font-semibold">{title}</Radix.Title><Radix.Description className="sr-only">{description}</Radix.Description></div>
        <Radix.Close className="shrink-0 rounded-md p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600" aria-label="Close dialog"><X className="size-5" /></Radix.Close>
      </div>{children}
    </Radix.Content>
  </Radix.Portal></Radix.Root>;
}
