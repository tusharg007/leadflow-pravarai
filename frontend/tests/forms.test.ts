import { expect, it } from 'vitest';
import {
  leadFormSchema,
  discussionFormSchema,
  toFollowUp,
} from '@/features/leads/lib/formSchemas';
import { localDateValue } from '@/features/leads/lib/format';
it('requires a trimmed lead name and applies contact length limits', () => {
  expect(
    leadFormSchema.safeParse({ name: ' ', company: '', phone: '' }).success,
  ).toBe(false);
  expect(
    leadFormSchema.parse({ name: ' Sarah ', company: ' Acme ', phone: '' })
      .name,
  ).toBe('Sarah');
  expect(
    leadFormSchema.safeParse({
      name: 'Sarah',
      company: '',
      phone: 'a'.repeat(31),
    }).success,
  ).toBe(false);
});
it('requires both follow-up inputs only when enabled', () => {
  const base = { content: 'Note', setFollowUp: false, date: '', time: '' };
  expect(discussionFormSchema.safeParse(base).success).toBe(true);
  expect(
    discussionFormSchema.safeParse({ ...base, setFollowUp: true }).success,
  ).toBe(false);
  expect(
    discussionFormSchema.safeParse({
      ...base,
      setFollowUp: true,
      date: localDateValue(new Date()),
      time: '14:00',
    }).success,
  ).toBe(true);
});
it('rejects empty notes, past dates and impossible times', () => {
  const base = {
    content: 'Note',
    setFollowUp: true,
    date: localDateValue(new Date()),
    time: '14:00',
  };
  expect(
    discussionFormSchema.safeParse({ ...base, content: ' ' }).success,
  ).toBe(false);
  expect(
    discussionFormSchema.safeParse({ ...base, date: '2020-01-01' }).success,
  ).toBe(false);
  expect(
    discussionFormSchema.safeParse({ ...base, time: '25:00' }).success,
  ).toBe(false);
});
it('converts local date/time into an explicit UTC timestamp', () => {
  const value = toFollowUp('2026-10-14', '14:00');
  expect(new Date(value).getHours()).toBe(14);
  expect(value.endsWith('Z')).toBe(true);
});
