import { z } from 'zod';
import { localDateValue } from './format';

export const leadFormSchema = z.strictObject({
  name: z.string().trim().min(1, 'Full name is required').max(120),
  company: z.string().trim().max(120),
  phone: z.string().trim().max(30),
});
export const discussionFormSchema = z
  .strictObject({
    content: z.string().trim().min(1, 'A note is required').max(5000),
    setFollowUp: z.boolean(),
    date: z.string(),
    time: z.string(),
  })
  .superRefine((input, ctx) => {
    if (!input.setFollowUp) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date))
      ctx.addIssue({
        code: 'custom',
        path: ['date'],
        message: 'Choose a follow-up date',
      });
    else if (input.date < localDateValue(new Date()))
      ctx.addIssue({
        code: 'custom',
        path: ['date'],
        message: 'Choose today or a future date',
      });
    if (!/^\d{2}:\d{2}$/.test(input.time))
      ctx.addIssue({
        code: 'custom',
        path: ['time'],
        message: 'Choose a follow-up time',
      });
    const value = new Date(`${input.date}T${input.time}:00`);
    if (
      input.date &&
      input.time &&
      (!Number.isFinite(value.getTime()) ||
        localDateValue(value) !== input.date ||
        `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}` !==
          input.time)
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['time'],
        message: 'Choose a valid local date and time',
      });
    }
  });
export type LeadForm = z.infer<typeof leadFormSchema>;
export type DiscussionFormValues = z.infer<typeof discussionFormSchema>;
export const toFollowUp = (date: string, time: string) =>
  new Date(`${date}T${time}:00`).toISOString();
