import type { ReactNode } from 'react';
export function FormField({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error: string | undefined;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>
      {children}
      <p
        id={`${id}-error`}
        aria-live="polite"
        className="mt-1 min-h-4 text-xs text-red-800"
      >
        {error}
      </p>
    </div>
  );
}
