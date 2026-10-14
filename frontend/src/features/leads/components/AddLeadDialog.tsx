import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateLead } from '../hooks/useCreateLead';
import { leadFormSchema, type LeadForm } from '../lib/formSchemas';
import { mapFormError } from '../lib/formErrors';
import { FormField } from './FormField';
export function AddLeadDialog({ onClose }: { onClose: () => void }) {
  const mutation = useCreateLead();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LeadForm>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: { name: '', company: '', phone: '' },
  });
  const pending = mutation.isPending || isSubmitting;
  const save = handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync(values);
      onClose();
    } catch (error) {
      mapFormError(error, setError, ['name', 'company', 'phone']);
    }
  });
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Add New Lead"
      description="Enter the lead's name and optional contact details."
      returnFocus={() =>
        document.querySelector<HTMLButtonElement>('.add-lead-trigger')?.focus()
      }
    >
      <form onSubmit={save} noValidate className="overflow-y-auto">
        <fieldset disabled={pending} className="space-y-2 p-5">
          {(
            [
              {
                field: 'name',
                label: 'Full Name *',
                placeholder: 'e.g., John Doe',
                max: 120,
              },
              {
                field: 'company',
                label: 'Company (Optional)',
                placeholder: 'e.g., Stark Industries',
                max: 120,
              },
              {
                field: 'phone',
                label: 'Phone (Optional)',
                placeholder: 'e.g., 555-0123',
                max: 30,
              },
            ] as const
          ).map((field) => (
            <FormField
              key={field.field}
              id={`lead-${field.field}`}
              label={field.label}
              error={errors[field.field]?.message}
            >
              <Input
                id={`lead-${field.field}`}
                {...register(field.field)}
                maxLength={field.max}
                placeholder={field.placeholder}
                type={field.field === 'phone' ? 'tel' : 'text'}
                aria-invalid={Boolean(errors[field.field])}
                aria-describedby={`lead-${field.field}-error`}
                autoComplete={
                  field.field === 'name'
                    ? 'name'
                    : field.field === 'company'
                      ? 'organization'
                      : 'tel'
                }
              />
            </FormField>
          ))}
          <p role="alert" className="text-sm text-red-800">
            {errors.root?.message}
          </p>
        </fieldset>
        <footer className="flex justify-end gap-3 border-t border-line bg-slate-50 p-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={pending}>
            Save Lead
          </Button>
        </footer>
      </form>
    </Dialog>
  );
}
