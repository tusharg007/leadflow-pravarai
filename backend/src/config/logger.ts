import { pino } from 'pino';
import type { Env } from './env.js';

export function createLogger(level: Env['LOG_LEVEL']) {
  return pino({
    level,
    serializers: {
      // Driver error messages can contain credentials; keep only the error type.
      err: (error: unknown) => ({ type: error instanceof Error ? error.name : 'UnknownError' }),
    },
  });
}
