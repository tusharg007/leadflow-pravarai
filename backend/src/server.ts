import 'dotenv/config';
import type { Server } from 'node:http';
import { createApp } from './app.js';
import { connectDb, disconnectDb } from './config/db.js';
import { parseEnv } from './config/env.js';
import { createLogger } from './config/logger.js';

let logger = createLogger('info');
let server: Server | undefined;
let shuttingDown = false;

async function shutdown(exitCode: number): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  const timeout = setTimeout(() => process.exit(1), 10000);
  timeout.unref();
  try {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server?.close((error) => error ? reject(error) : resolve());
      });
    }
    await disconnectDb();
    process.exitCode = exitCode;
  } catch (error) {
    logger.error({ err: error }, 'Shutdown failed');
    process.exitCode = 1;
  } finally {
    clearTimeout(timeout);
  }
}

async function main(): Promise<void> {
  const config = parseEnv(process.env);
  logger = createLogger(config.LOG_LEVEL);
  process.once('SIGINT', () => { void shutdown(0); });
  process.once('SIGTERM', () => { void shutdown(0); });
  await connectDb(config.MONGODB_URI);
  if (shuttingDown) return;
  server = createApp(config).listen(config.PORT);
  server.once('listening', () => logger.info({ port: config.PORT }, 'API listening'));
  server.once('error', (error) => {
    logger.error({ err: error }, 'HTTP server failed');
    void shutdown(1);
  });
}

main().catch(async (error: unknown) => {
  logger.error({ err: error }, 'Startup failed; check environment and database availability');
  await shutdown(1);
});
