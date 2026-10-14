'use client';
import * as Radix from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
interface Props {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: ReadonlyArray<{ value: string; label: string }>;
  disabled?: boolean;
}
export function Select({
  label,
  value,
  onValueChange,
  options,
  disabled = false,
}: Props) {
  return (
    <Radix.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <Radix.Trigger
        aria-label={label}
        className="flex min-h-10 min-w-36 items-center justify-between gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 disabled:opacity-60"
      >
        <Radix.Value />
        <Radix.Icon>
          <ChevronDown className="size-4" />
        </Radix.Icon>
      </Radix.Trigger>
      <Radix.Portal>
        <Radix.Content
          position="popper"
          sideOffset={4}
          className="z-[60] max-h-[var(--radix-select-content-available-height)] overflow-auto rounded-lg border border-line bg-white p-1 shadow-lg"
        >
          <Radix.Viewport>
            {options.map((option) => (
              <Radix.Item
                key={option.value}
                value={option.value}
                className="relative cursor-pointer rounded-md py-2 pl-8 pr-4 text-sm outline-none data-[highlighted]:bg-brand-50 data-[highlighted]:text-brand-700"
              >
                <Radix.ItemIndicator className="absolute left-2">
                  <Check className="size-4" />
                </Radix.ItemIndicator>
                <Radix.ItemText>{option.label}</Radix.ItemText>
              </Radix.Item>
            ))}
          </Radix.Viewport>
        </Radix.Content>
      </Radix.Portal>
    </Radix.Root>
  );
}
