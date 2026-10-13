import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { z } from 'zod';
import type { Response } from 'supertest';
import { createApp } from '../src/app.js';
import { connectDb, disconnectDb } from '../src/config/db.js';
import { parseEnv } from '../src/config/env.js';
import { Lead, leadStatuses } from '../src/models/lead.model.js';
import { Discussion } from '../src/models/discussion.model.js';

const iso = z.iso.datetime();
const id = z.string().regex(/^[a-f0-9]{24}$/);
export const leadResponse = z.strictObject({
  id, name: z.string(), company: z.string().nullable(), phone: z.string().nullable(),
  status: z.enum(leadStatuses), followUpAt: iso.nullable(), lastNote: z.string().nullable(),
  lastDiscussionAt: iso.nullable(), createdAt: iso, updatedAt: iso,
});
export const discussionResponse = z.strictObject({
  id, leadId: id, content: z.string(), kind: z.enum(['note', 'system']),
  followUpAt: iso.nullable(), createdAt: iso,
});
export const detailResponse = leadResponse.extend({ discussions: z.array(discussionResponse) });
export const noteResponse = z.strictObject({ discussion: discussionResponse, lead: leadResponse });
export const errorResponse = z.strictObject({ error: z.strictObject({
  code: z.enum(['validation_error', 'not_found', 'internal_error']),
  message: z.string(), details: z.array(z.strictObject({ field: z.string(), message: z.string() })).optional(),
}) });
export const body = (response: Response): unknown => response.body;

export const app = createApp(parseEnv({
  MONGODB_URI: 'mongodb://127.0.0.1:27017/test', NODE_ENV: 'test', LOG_LEVEL: 'silent',
}));

export function useTestDatabase(): void {
  let mongo: MongoMemoryServer;
  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await connectDb(mongo.getUri());
    await Promise.all([Lead.init(), Discussion.init()]);
  });
  afterEach(async () => {
    vi.restoreAllMocks();
    await Promise.all([Lead.deleteMany({}), Discussion.deleteMany({})]);
  });
  afterAll(async () => {
    await disconnectDb();
    await mongo?.stop();
  });
}
