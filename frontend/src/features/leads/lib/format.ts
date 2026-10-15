import { format, formatDistance } from 'date-fns';
export const absoluteTime = (value: string) =>
  format(new Date(value), 'MMM d, yyyy, h:mm a');
export const timeOf = (value: string) => format(new Date(value), 'h:mm a');
export const relativeTime = (value: string, now: Date) =>
  formatDistance(
    new Date(Math.min(new Date(value).getTime(), now.getTime())),
    now,
    { addSuffix: true },
  );
export const localDateValue = (date: Date) => format(date, 'yyyy-MM-dd');
