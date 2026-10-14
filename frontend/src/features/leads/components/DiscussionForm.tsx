import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { useAddDiscussion } from '../hooks/useAddDiscussion';
import {
  discussionFormSchema,
  toFollowUp,
  type DiscussionFormValues,
} from '../lib/formSchemas';
import { mapFormError } from '../lib/formErrors';
import { localDateValue } from '../lib/format';
import { FormField } from './FormField';
export function DiscussionForm({
  id,
  disabled,
  now,
}: {
  id: string;
  disabled: boolean;
  now: Date;
}) {
  const mutation = useAddDiscussion(id);
  const form = useForm<DiscussionFormValues>({
    resolver: zodResolver(discussionFormSchema),
    defaultValues: { content: '', setFollowUp: false, date: '', time: '' },
  });
  const setFollowUp = useWatch({ control: form.control, name: 'setFollowUp' });
  const pending = disabled || mutation.isPending || form.formState.isSubmitting;
  const errors = form.formState.errors;
  const save = form.handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync({
        content: values.content,
        ...(values.setFollowUp
          ? { followUpAt: toFollowUp(values.date, values.time) }
          : {}),
      });
      form.reset();
    } catch (error) {
      mapFormError(error, form.setError, ['content', 'date', 'time'], {
        followUpAt: 'date',
      });
    }
  });
  return (
    <form
      onSubmit={save}
      noValidate
      aria-label="Add discussion"
      className="shrink-0 border-t border-line bg-white p-4 sm:p-5"
    >
      <fieldset disabled={pending}>
        <FormField
          id="note-content"
          label="Log a new discussion"
          error={errors.content?.message}
        >
          <Textarea
            id="note-content"
            {...form.register('content')}
            placeholder="Log a new discussion..."
            maxLength={5000}
            rows={2}
            aria-invalid={Boolean(errors.content)}
            aria-describedby="note-content-error"
          />
        </FormField>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              {...form.register('setFollowUp')}
              className="size-4 accent-brand-600 focus-visible:outline-2 focus-visible:outline-brand-600"
            />
            Set Follow-up
          </label>
          <Button
            type="submit"
            variant="dark"
            loading={mutation.isPending || form.formState.isSubmitting}
            disabled={disabled}
          >
            Save Note
          </Button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <FormField
            id="follow-up-date"
            label="Follow-up date"
            error={errors.date?.message}
          >
            <Input
              id="follow-up-date"
              type="date"
              {...form.register('date')}
              min={localDateValue(now)}
              disabled={!setFollowUp || pending}
              aria-invalid={Boolean(errors.date)}
              aria-describedby="follow-up-date-error"
            />
          </FormField>
          <FormField
            id="follow-up-time"
            label="Follow-up time"
            error={errors.time?.message}
          >
            <Input
              id="follow-up-time"
              type="time"
              {...form.register('time')}
              disabled={!setFollowUp || pending}
              aria-invalid={Boolean(errors.time)}
              aria-describedby="follow-up-time-error"
            />
          </FormField>
        </div>
        <p role="alert" className="text-sm text-red-800">
          {errors.root?.message}
        </p>
      </fieldset>
    </form>
  );
}
