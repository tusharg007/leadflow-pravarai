import { expect, it, vi } from 'vitest';
import { Lead, leadStatuses } from '../src/models/lead.model.js';
import { Discussion } from '../src/models/discussion.model.js';
import { seedDatabase } from '../src/scripts/seedDatabase.js';
import { buildSeedData } from '../src/scripts/seedData.js';
import { useTestDatabase } from './helpers.js';

useTestDatabase();

it('seeds all statuses with three discussions each and relative follow-ups', async () => {
  const now = new Date('2026-10-13T10:00:00Z');
  expect(await seedDatabase(false, now)).toEqual({ inserted: 6, skipped: 0 });
  const leads = await Lead.find().lean();
  expect(leads.map((lead) => lead.status).sort()).toEqual(
    [...leadStatuses].sort(),
  );
  expect(await Discussion.countDocuments()).toBe(18);
  for (const lead of leads) {
    const history = await Discussion.find({ leadId: lead._id })
      .sort({ createdAt: -1 })
      .lean();
    expect(history).toHaveLength(3);
    expect(history[0]?.content).toBe(lead.lastNote);
    expect(history[0]?.createdAt).toEqual(lead.lastDiscussionAt);
    expect(history[0]?.followUpAt).toEqual(lead.followUpAt);
  }
  const sarah = leads.find((lead) => lead.name === 'Sarah Connor');
  expect(sarah?.company).toBe('Acme Corp');
  expect(sarah?.phone).toBe('555-0199');
  expect(sarah?.followUpAt?.getTime()).toBe(now.getTime() + 30 * 60_000);
  expect(
    leads.find((lead) => lead.name === 'Bill Lumbergh')?.followUpAt?.getTime(),
  ).toBe(now.getTime() - 26 * 3_600_000);
  expect(
    leads.find((lead) => lead.name === 'Diana Prince')?.followUpAt?.getTime(),
  ).toBe(now.getTime() + 50 * 3_600_000);
});

it('keeps exact seed instants across timezones, midnight and DST transitions', () => {
  const originalTimezone = process.env.TZ;
  try {
    for (const timezone of [
      'UTC',
      'Asia/Kolkata',
      'America/Los_Angeles',
      'Pacific/Auckland',
    ]) {
      process.env.TZ = timezone;
      for (const instant of [
        '2026-10-13T23:50:00Z',
        '2026-03-08T09:50:00Z',
        '2026-11-01T08:50:00Z',
      ]) {
        const now = new Date(instant);
        const data = buildSeedData(now);
        expect(
          data.map(({ lead }) => lead.followUpAt?.getTime() ?? null),
        ).toEqual([
          now.getTime() + 30 * 60_000,
          null,
          now.getTime() - 26 * 3_600_000,
          null,
          now.getTime() + 50 * 3_600_000,
          null,
        ]);
        expect(data[0]?.lead.lastDiscussionAt.getTime()).toBe(
          now.getTime() - 50 * 3_600_000,
        );
      }
    }
  } finally {
    if (originalTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = originalTimezone;
  }
});

it('reruns without duplicates and preserves user edits and timestamps', async () => {
  await seedDatabase(false, new Date('2026-10-13T10:00:00Z'));
  const sarah = await Lead.findOneAndUpdate(
    { name: 'Sarah Connor' },
    { $set: { status: 'won' } },
    { new: true },
  );
  expect(await seedDatabase(false, new Date('2026-10-14T10:00:00Z'))).toEqual({
    inserted: 0,
    skipped: 6,
  });
  expect(await Lead.countDocuments()).toBe(6);
  expect(await Discussion.countDocuments()).toBe(18);
  expect((await Lead.findById(sarah?._id))?.updatedAt).toEqual(
    sarah?.updatedAt,
  );
  expect((await Lead.findById(sarah?._id))?.status).toBe('won');
});

it('resets all data and reseeds with dates relative to the new run', async () => {
  await seedDatabase();
  await Lead.create({ name: 'Nonfixture lead' });
  const now = new Date('2026-10-15T10:00:00Z');
  expect(await seedDatabase(true, now)).toEqual({ inserted: 6, skipped: 0 });
  expect(await Lead.countDocuments()).toBe(6);
  expect(await Lead.exists({ name: 'Nonfixture lead' })).toBeNull();
  expect(
    (await Lead.findOne({ name: 'Sarah Connor' }))?.followUpAt?.getTime(),
  ).toBe(now.getTime() + 30 * 60_000);
  expect(await Discussion.countDocuments()).toBe(18);
});

it('cleans up a fixture when discussion insertion fails and supports retry', async () => {
  vi.spyOn(Discussion, 'insertMany').mockImplementationOnce(() => {
    throw new Error('Insert failed');
  });
  await expect(seedDatabase()).rejects.toThrow('Insert failed');
  expect(await Lead.countDocuments()).toBe(0);
  expect(await Discussion.countDocuments()).toBe(0);
  expect(await seedDatabase()).toEqual({ inserted: 6, skipped: 0 });
});
