import 'dotenv/config';
import { connectDb, disconnectDb } from '../config/db.js';
import { parseEnv } from '../config/env.js';
import { createLogger } from '../config/logger.js';
import { seedDatabase } from './seedDatabase.js';

let logger = createLogger('info');
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== '--reset'))
    throw new Error('Use seed with only optional --reset');
  const config = parseEnv(process.env);
  logger = createLogger(config.LOG_LEVEL);
  await connectDb(config.MONGODB_URI);
  const result = await seedDatabase(args.includes('--reset'));
  logger.info(result, 'Seed complete');
}

main()
  .catch((error: unknown) => {
    logger.error(
      { err: error },
      'Seed failed; check arguments, environment, and database availability',
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await disconnectDb();
    } catch (error) {
      logger.error({ err: error }, 'Seed disconnect failed');
      process.exitCode = 1;
    }
  });
