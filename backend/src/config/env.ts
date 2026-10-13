import { z } from 'zod';

const originSchema = z
  .string()
  .url()
  .refine((value) => {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && url.origin === value;
  }, 'Use an HTTP(S) origin without a path or credentials');

export const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  MONGODB_URI: z
    .string()
    .regex(/^mongodb(?:\+srv)?:\/\/\S+$/, 'Invalid MongoDB URI'),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:3000')
    .transform((value) => value.split(',').map((origin) => origin.trim()))
    .pipe(z.array(originSchema).min(1)),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
});

export type Env = z.output<typeof envSchema>;
export function parseEnv(input: NodeJS.ProcessEnv): Env {
  return envSchema.parse(input);
}
