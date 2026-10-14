import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import { Spinner } from './Spinner';

const variants = cva(
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
  {
    variants: {
      variant: {
        primary: 'bg-brand-600 text-white hover:bg-brand-700',
        secondary:
          'border border-line bg-white text-slate-700 hover:bg-slate-50',
        dark: 'bg-slate-900 text-white hover:bg-slate-800',
        ghost: 'text-slate-600 hover:bg-slate-100',
      },
    },
    defaultVariants: { variant: 'primary' },
  },
);
type Props = ComponentProps<'button'> &
  VariantProps<typeof variants> & { loading?: boolean };
export function Button({
  variant,
  className,
  loading = false,
  disabled,
  children,
  type = 'button',
  ...props
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      className={cn(variants({ variant }), className)}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}
