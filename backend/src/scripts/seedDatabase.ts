import { Lead } from '../models/lead.model.js';
import { Discussion } from '../models/discussion.model.js';
import { buildSeedData } from './seedData.js';

export async function seedDatabase(reset = false, now = new Date()) {
  if (reset) {
    await Discussion.deleteMany({});
    await Lead.deleteMany({});
  }
  let inserted = 0;
  for (const fixture of buildSeedData(now)) {
    if (await Lead.exists({ _id: fixture.lead._id })) continue;
    await Lead.create(fixture.lead);
    try {
      await Discussion.insertMany(fixture.discussions, { ordered: true });
    } catch (error) {
      await Discussion.deleteMany({ leadId: fixture.lead._id });
      await Lead.deleteOne({ _id: fixture.lead._id });
      throw error;
    }
    inserted++;
  }
  return { inserted, skipped: 6 - inserted };
}
