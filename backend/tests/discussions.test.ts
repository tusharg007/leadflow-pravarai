import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { Types } from 'mongoose';
import { Lead } from '../src/models/lead.model.js';
import { Discussion } from '../src/models/discussion.model.js';
import {
  app,
  body,
  detailResponse,
  errorResponse,
  leadResponse,
  noteResponse,
  useTestDatabase,
} from './helpers.js';

useTestDatabase();
const api = request(app);
const create = async () =>
  leadResponse.parse(
    body(
      await api.post('/api/leads').send({ name: 'Sarah Connor' }).expect(201),
    ),
  );

describe('Discussion API', () => {
  it('inserts a trimmed note and updates follow-up and summary atomically', async () => {
    const lead = await create();
    const result = noteResponse.parse(
      body(
        await api
          .post(`/api/leads/${lead.id}/discussions`)
          .send({
            content: ' Sent pricing tier PDF. ',
            followUpAt: '2026-10-13T14:00:00+05:30',
          })
          .expect(201),
      ),
    );
    expect(result.discussion).toMatchObject({
      leadId: lead.id,
      kind: 'note',
      content: 'Sent pricing tier PDF.',
      followUpAt: '2026-10-13T08:30:00.000Z',
    });
    expect(result.lead).toMatchObject({
      lastNote: result.discussion.content,
      lastDiscussionAt: result.discussion.createdAt,
      followUpAt: result.discussion.followUpAt,
    });
    expect(
      detailResponse.parse(body(await api.get(`/api/leads/${lead.id}`)))
        .followUpAt,
    ).toBe(result.lead.followUpAt);
  });

  it('preserves an existing follow-up when a note omits it', async () => {
    const lead = await create();
    const followUpAt = '2026-10-14T09:00:00.000Z';
    await api.patch(`/api/leads/${lead.id}`).send({ followUpAt }).expect(200);
    const result = noteResponse.parse(
      body(
        await api
          .post(`/api/leads/${lead.id}/discussions`)
          .send({ content: 'Called again' })
          .expect(201),
      ),
    );
    expect(result.lead.followUpAt).toBe(followUpAt);
    expect(result.discussion.followUpAt).toBeNull();
  });

  it('clears a follow-up when a note explicitly supplies null', async () => {
    const lead = await create();
    await api
      .patch(`/api/leads/${lead.id}`)
      .send({ followUpAt: '2026-10-14T09:00:00Z' })
      .expect(200);
    const result = noteResponse.parse(
      body(
        await api
          .post(`/api/leads/${lead.id}/discussions`)
          .send({ content: 'No follow-up needed', followUpAt: null })
          .expect(201),
      ),
    );
    expect(result.lead.followUpAt).toBeNull();
  });

  it('returns newest-first history and uses ID to break timestamp ties', async () => {
    const lead = await create();
    await Discussion.deleteMany({ leadId: lead.id });
    await Discussion.create([
      {
        _id: '507f1f77bcf86cd799439011',
        leadId: lead.id,
        content: 'Old',
        createdAt: new Date('2020-01-01'),
      },
      {
        _id: '507f1f77bcf86cd799439012',
        leadId: lead.id,
        content: 'Recent low',
        createdAt: new Date('2021-01-01'),
      },
      {
        _id: '507f1f77bcf86cd799439013',
        leadId: lead.id,
        content: 'Recent high',
        createdAt: new Date('2021-01-01'),
      },
    ]);
    const detail = detailResponse.parse(
      body(await api.get(`/api/leads/${lead.id}`).expect(200)),
    );
    expect(detail.discussions.map((item) => item.content)).toEqual([
      'Recent high',
      'Recent low',
      'Old',
    ]);
  });

  it.each([
    {},
    { content: '' },
    { content: ' ' },
    { content: 'a'.repeat(5001) },
    { content: 'Valid', kind: 'system' },
    { content: 'Valid', followUpAt: 'invalid' },
  ])('rejects invalid note %j', async (input) => {
    const lead = await create();
    expect(
      errorResponse.parse(
        body(
          await api
            .post(`/api/leads/${lead.id}/discussions`)
            .send(input)
            .expect(400),
        ),
      ).error.code,
    ).toBe('validation_error');
    expect(await Discussion.countDocuments()).toBe(1);
  });

  it('rejects malformed parent IDs and does not write for missing leads', async () => {
    await api
      .post('/api/leads/bad/discussions')
      .send({ content: 'Note' })
      .expect(400);
    await api
      .post(`/api/leads/${new Types.ObjectId()}/discussions`)
      .send({ content: 'Note' })
      .expect(404);
    expect(await Discussion.countDocuments()).toBe(0);
  });

  it('deletes the inserted note when the parent update fails', async () => {
    const lead = await create();
    vi.spyOn(Lead, 'findOneAndUpdate').mockImplementationOnce(() => {
      throw new Error('Update failed');
    });
    await api
      .post(`/api/leads/${lead.id}/discussions`)
      .send({ content: 'Not committed' })
      .expect(500);
    expect(await Discussion.countDocuments({ leadId: lead.id })).toBe(1);
    expect((await Lead.findById(lead.id))?.lastNote).toBe('Lead created');
  });

  it('compensates when the lead disappears between existence check and update', async () => {
    const lead = await create();
    vi.spyOn(Lead, 'findOneAndUpdate').mockResolvedValueOnce(null);
    await api
      .post(`/api/leads/${lead.id}/discussions`)
      .send({ content: 'Not committed' })
      .expect(404);
    expect(await Discussion.countDocuments({ leadId: lead.id })).toBe(1);
  });
});
