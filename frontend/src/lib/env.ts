import { z } from 'zod';

export const apiUrl = z
  .url()
  .refine((value) => /^https?:\/\//.test(value), 'Use an HTTP(S) API URL')
  .parse(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api')
  .replace(/\/$/, '');
