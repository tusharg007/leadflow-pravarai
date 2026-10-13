import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { Types } from 'mongoose';
import { Lead } from '../src/models/lead.model.js';
import { Discussion } from '../src/models/discussion.model.js';
import { app, body, detailResponse, errorResponse, leadResponse, useTestDatabase } from './helpers.js';

useTestDatabase();
const api = request(app);
const create = async (name = 'Sarah Connor') => leadResponse.parse(body(
  await api.post('/api/leads').send({ name }).expect(201),
));

describe('Lead API', () => {
  it('serves liveness and security headers', async () => {
    const response = await api.get('/api/health').expect(200);
    expect(body(response)).toEqual({ status: 'ok' });
    expect(response.headers['x-powered-by']).toBeUndefined();
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  it('creates a normalized lead with exactly the contract fields', async () => {
    const lead = leadResponse.parse(body(await api.post('/api/leads').send({
      name: ' Sarah Connor ', company: ' Acme Corp ', phone: ' 555-0199 ',
    }).expect(201)));
    expect(lead).toMatchObject({ name: 'Sarah Connor', company: 'Acme Corp', phone: '555-0199', status: 'new', followUpAt: null, lastNote: 'Lead created' });
    expect(lead.lastDiscussionAt).not.toBeNull();
    expect(await Lead.findById(lead.id)).not.toBeNull();
  });

  it('normalizes absent, empty, whitespace-only and null optional strings', async () => {
    for (const optional of [{}, { company: '', phone: '  ' }, { company: null, phone: null }]) {
      const lead = leadResponse.parse(body(await api.post('/api/leads').send({ name: 'Lead', ...optional }).expect(201)));
      expect(lead.company).toBeNull();
      expect(lead.phone).toBeNull();
    }
  });

  it('writes the creation system discussion and denormalized fields', async () => {
    const lead = await create();
    const detail = detailResponse.parse(body(await api.get(`/api/leads/${lead.id}`).expect(200)));
    expect(detail.discussions).toHaveLength(1);
    expect(detail.discussions[0]).toMatchObject({ leadId: lead.id, content: 'Lead created', kind: 'system', followUpAt: null, createdAt: lead.lastDiscussionAt });
  });

  it.each([{}, { name: '' }, { name: '  ' }, { name: 10 }, { name: 'a'.repeat(121) }, { name: 'Valid', company: 'a'.repeat(121) }, { name: 'Valid', phone: 'a'.repeat(31) }])('rejects invalid creation body %j', async (input) => {
    const error = errorResponse.parse(body(await api.post('/api/leads').send(input).expect(400)));
    expect(error.error.code).toBe('validation_error');
    expect(error.error.details?.length).toBeGreaterThan(0);
    expect(await Lead.countDocuments()).toBe(0);
  });

  it('rejects server-owned and unknown creation fields', async () => {
    const error = errorResponse.parse(body(await api.post('/api/leads').send({ name: 'Lead', status: 'won' }).expect(400)));
    expect(error.error.details).toContainEqual({ field: 'status', message: 'Unknown field' });
  });

  it('rejects malformed ObjectIds with an id field error', async () => {
    const error = errorResponse.parse(body(await api.get('/api/leads/not-an-id').expect(400)));
    expect(error.error.details?.[0]?.field).toBe('id');
  });

  it('returns 404 for valid unknown IDs and routes', async () => {
    for (const path of [`/api/leads/${new Types.ObjectId().toHexString()}`, '/api/missing', '/outside-api']) {
      const error = errorResponse.parse(body(await api.get(path).expect(404)));
      expect(error.error.code).toBe('not_found');
      expect(error.error.details).toBeUndefined();
    }
  });

  it.each(['status=invalid', 'status=', 'status=new&status=won', 'q=a&q=b', 'limit=10', `q=${'a'.repeat(101)}`, 'q[$ne]=x'])('rejects invalid list query %s', async (query) => {
    expect(errorResponse.parse(body(await api.get(`/api/leads?${query}`).expect(400))).error.code).toBe('validation_error');
  });

  it('lists empty results, filters by status and combines search', async () => {
    expect(body(await api.get('/api/leads').expect(200))).toEqual([]);
    const sarah = await create();
    const hank = await create('Hank Scorpio');
    await api.patch(`/api/leads/${sarah.id}`).send({ status: 'qualified' }).expect(200);
    const leads = leadResponse.array().parse(body(await api.get('/api/leads?status=new').expect(200)));
    expect(leads.map((lead) => lead.id)).toEqual([hank.id]);
    expect(body(await api.get('/api/leads?status=qualified&q=hank').expect(200))).toEqual([]);
  });

  it('searches names case-insensitively with whitespace trimmed', async () => {
    const lead = await create();
    await create('Unrelated');
    const result = leadResponse.array().parse(body(await api.get('/api/leads').query({ q: '  cOnNoR  ' }).expect(200)));
    expect(result.map((item) => item.id)).toEqual([lead.id]);
  });

  it.each(['a.*', '(', '[', '$', '\\'])('treats regex metacharacters %s as literal text', async (q) => {
    const lead = await create(`Contains ${q}`);
    await create('Ordinary lead');
    const result = leadResponse.array().parse(body(await api.get('/api/leads').query({ q }).expect(200)));
    expect(result.map((item) => item.id)).toEqual([lead.id]);
  });

  it('sorts by last discussion descending, ID descending for ties, then null', async () => {
    const records = await Lead.create([
      { _id: '507f1f77bcf86cd799439011', name: 'Old', lastDiscussionAt: new Date('2020-01-01') },
      { _id: '507f1f77bcf86cd799439012', name: 'Recent low', lastDiscussionAt: new Date('2021-01-01') },
      { _id: '507f1f77bcf86cd799439013', name: 'Recent high', lastDiscussionAt: new Date('2021-01-01') },
      { _id: '507f1f77bcf86cd799439014', name: 'No discussions' },
    ]);
    const result = leadResponse.array().parse(body(await api.get('/api/leads').expect(200)));
    expect(result.map((item) => item.id)).toEqual([records[2]?.id, records[1]?.id, records[0]?.id, records[3]?.id]);
  });

  it('persists status and does not add history or change last-discussion fields', async () => {
    const lead = await create();
    await api.patch(`/api/leads/${lead.id}`).send({ status: 'won' }).expect(200);
    const detail = detailResponse.parse(body(await api.get(`/api/leads/${lead.id}`).expect(200)));
    expect(detail.status).toBe('won');
    expect(detail.lastDiscussionAt).toBe(lead.lastDiscussionAt);
    expect(detail.discussions).toHaveLength(1);
  });

  it('accepts an offset timestamp and clears follow-up with explicit null', async () => {
    const lead = await create();
    const updated = leadResponse.parse(body(await api.patch(`/api/leads/${lead.id}`).send({ followUpAt: '2026-10-13T14:00:00+05:30' }).expect(200)));
    expect(updated.followUpAt).toBe('2026-10-13T08:30:00.000Z');
    await api.patch(`/api/leads/${lead.id}`).send({ followUpAt: null }).expect(200);
    expect(detailResponse.parse(body(await api.get(`/api/leads/${lead.id}`))).followUpAt).toBeNull();
  });

  it.each([{}, { nope: true }, { status: 'bad' }, { followUpAt: 'tomorrow' }, { followUpAt: '2026-10-13T14:00:00' }, { followUpAt: '2026-02-30T14:00:00Z' }, { followUpAt: '2026-10-13T14:00Z' }])('rejects invalid patch %j', async (input) => {
    const lead = await create();
    expect(errorResponse.parse(body(await api.patch(`/api/leads/${lead.id}`).send(input).expect(400))).error.code).toBe('validation_error');
  });

  it('returns 404 when patching an unknown lead', async () => {
    expect(errorResponse.parse(body(await api.patch(`/api/leads/${new Types.ObjectId()}`).send({ status: 'won' }).expect(404))).error.code).toBe('not_found');
  });

  it('compensates lead creation when its system discussion fails', async () => {
    vi.spyOn(Discussion.prototype, 'save').mockRejectedValueOnce(new Error('Database unavailable'));
    await api.post('/api/leads').send({ name: 'Lead' }).expect(500);
    expect(await Lead.countDocuments()).toBe(0);
    expect(await Discussion.countDocuments()).toBe(0);
  });

  it('never exposes private error messages or stacks on unexpected failures', async () => {
    vi.spyOn(Lead, 'find').mockImplementationOnce(() => { throw new Error('mongodb://user:secret@host/private stack'); });
    expect(body(await api.get('/api/leads').expect(500))).toEqual({
      error: { code: 'internal_error', message: 'An unexpected error occurred' },
    });
  });
});
