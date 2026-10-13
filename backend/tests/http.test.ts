import request from 'supertest';
import { expect, it } from 'vitest';
import { app, body, errorResponse } from './helpers.js';
import { parseEnv } from '../src/config/env.js';

it('returns a validation envelope for malformed JSON', async () => {
  const error = errorResponse.parse(body(await request(app).post('/api/leads').set('Content-Type', 'application/json').send('{"name":').expect(400)));
  expect(error.error.details?.[0]?.field).toBe('body');
});

it('returns a validation envelope for oversized JSON', async () => {
  const error = errorResponse.parse(body(await request(app).post('/api/leads').send({ name: 'a'.repeat(110000) }).expect(400)));
  expect(error.error.details?.[0]?.message).toContain('100kb');
});

it('rejects a non-object body', async () => {
  expect(errorResponse.parse(body(await request(app).post('/api/leads').send([]).expect(400))).error.code).toBe('validation_error');
});

it('allows the configured browser origin and preflight', async () => {
  const response = await request(app).get('/api/health').set('Origin', 'http://localhost:3000').expect(200);
  expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
  await request(app).options('/api/leads').set('Origin', 'http://localhost:3000').set('Access-Control-Request-Method', 'POST').expect(204);
});

it('does not expose responses to an unconfigured browser origin', async () => {
  const response = await request(app).get('/api/health').set('Origin', 'https://untrusted.example').expect(200);
  expect(response.headers['access-control-allow-origin']).toBeUndefined();
});

it('validates environment configuration and splits CORS origins', () => {
  expect(parseEnv({ MONGODB_URI: 'mongodb://127.0.0.1/test', CORS_ORIGINS: 'http://localhost:3000, https://example.com' }).CORS_ORIGINS).toEqual(['http://localhost:3000', 'https://example.com']);
  for (const invalid of [ {}, { MONGODB_URI: 'invalid' }, { MONGODB_URI: 'mongodb://localhost/test', PORT: '0' }, { MONGODB_URI: 'mongodb://localhost/test', CORS_ORIGINS: '*' }, { MONGODB_URI: 'mongodb://localhost/test', CORS_ORIGINS: 'https://example.com/path' }]) {
    expect(() => parseEnv(invalid)).toThrow();
  }
});
