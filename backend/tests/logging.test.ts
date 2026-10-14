import { Writable } from 'node:stream';
import request from 'supertest';
import { expect, it } from 'vitest';
import { z } from 'zod';
import { createApp } from '../src/app.js';
import { createLogger } from '../src/config/logger.js';
import { parseEnv } from '../src/config/env.js';

it('logs only request method/path, response status and duration without headers or secrets', async () => {
  let output = '';
  const destination = new Writable({
    write(chunk: Buffer, _encoding, callback) {
      output += chunk.toString();
      callback();
    },
  });
  const logger = createLogger('info', destination);
  const app = createApp(
    parseEnv({ MONGODB_URI: 'mongodb://localhost/test' }),
    logger,
  );
  await request(app)
    .get('/api/health?token=private-query')
    .set('Authorization', 'private-header')
    .expect(200);
  const line: unknown = JSON.parse(output.trim());
  const entry = z
    .object({
      req: z.strictObject({ method: z.string(), path: z.string() }),
      res: z.strictObject({ statusCode: z.number() }),
      responseTime: z.number(),
    })
    .parse(line);
  expect(entry.req).toEqual({ method: 'GET', path: '/api/health' });
  expect(entry.res.statusCode).toBe(200);
  expect(output).not.toContain('private-');
  expect(output).not.toContain('headers');
});
