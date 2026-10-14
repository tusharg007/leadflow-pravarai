import { spawn, execFile, type ChildProcess } from 'node:child_process';
import { once } from 'node:events';
import { cp, appendFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { setTimeout as delay } from 'node:timers/promises';
import { MongoMemoryServer } from '../../backend/node_modules/mongodb-memory-server/index.js';
import { createLogger } from '../../backend/src/config/logger';
import { captureScreenshots } from './screenshots';

const run = promisify(execFile);
const logger = createLogger('info');
const front = fileURLToPath(new URL('../', import.meta.url));
const back = fileURLToPath(new URL('../../backend/', import.meta.url));
const logFile = fileURLToPath(
  new URL('../../docs/codex/AUTONOMOUS_RUN_LOG.md', import.meta.url),
);
const owned: Array<{ child: ChildProcess; exited: Promise<unknown> }> = [];
async function freePort(preferred: number): Promise<number> {
  const listen = async (port: number) => {
    const server = createServer();
    server.listen(port);
    await once(server, 'listening');
    const address = server.address();
    if (!address || typeof address === 'string')
      throw new Error('Missing port');
    await new Promise<void>((resolve) => server.close(() => resolve()));
    return address.port;
  };
  try {
    return await listen(preferred);
  } catch {
    const port = await listen(0);
    await appendFile(
      logFile,
      `\n- ${new Date().toISOString()} — Port ${preferred} was busy; I used ${port} for my isolated browser run.\n`,
    );
    return port;
  }
}
function start(args: string[], cwd: string, env: NodeJS.ProcessEnv) {
  const child = spawn(process.execPath, args, {
    cwd,
    env,
    windowsHide: true,
    stdio: 'pipe',
  });
  const exited = once(child, 'exit');
  owned.push({ child, exited });
  child.stdout?.resume();
  child.stderr?.on('data', (value: Buffer) =>
    logger.warn({ output: value.toString() }, 'Test server diagnostics'),
  );
  return child;
}
async function waitFor(url: string) {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      /* My owned server is still starting. */
    }
    await delay(250);
  }
  throw new Error(`Server did not become ready: ${url}`);
}
async function main() {
  const mongo = await MongoMemoryServer.create({
    binary: { version: '7.0.24' },
  });
  try {
    const apiPort = await freePort(4000);
    const frontPort = await freePort(3000);
    const api = `http://localhost:${apiPort}/api`;
    const url = `http://localhost:${frontPort}`;
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      MONGODB_URI: mongo.getUri(),
      CORS_ORIGINS: url,
      NEXT_PUBLIC_API_URL: api,
      NODE_ENV: 'production',
      LOG_LEVEL: 'warn',
      TZ: 'Asia/Kolkata',
    };
    await run(
      process.execPath,
      ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.build.json'],
      { cwd: back, env },
    );
    await run(process.execPath, ['dist/scripts/seed.js'], { cwd: back, env });
    await run(process.execPath, ['node_modules/next/dist/bin/next', 'build'], {
      cwd: front,
      env,
      maxBuffer: 5000000,
    });
    await cp(
      `${front}/.next/static`,
      `${front}/.next/standalone/.next/static`,
      { recursive: true },
    );
    start(['dist/server.js'], back, { ...env, PORT: String(apiPort) });
    start(['.next/standalone/server.js'], front, {
      ...env,
      PORT: String(frontPort),
      HOSTNAME: '127.0.0.1',
    });
    await Promise.all([waitFor(`${api}/health`), waitFor(url)]);
    if (process.argv.includes('--screenshots')) await captureScreenshots(url);
    else {
      const result = await run(
        process.execPath,
        ['node_modules/playwright/cli.js', 'test'],
        {
          cwd: front,
          env: { ...env, FRONTEND_URL: url, E2E_API_URL: api },
          maxBuffer: 5000000,
        },
      );
      logger.info({ output: result.stdout }, 'Browser smoke complete');
    }
    logger.info('Owned browser run complete');
  } finally {
    for (const { child } of owned) if (child.exitCode === null) child.kill();
    await Promise.all(owned.map(({ exited }) => exited));
    await mongo.stop();
  }
}
main().catch((error: unknown) => {
  logger.error({ err: error }, 'Browser run failed');
  if (error instanceof Error && 'stdout' in error)
    logger.error({ output: error.stdout }, 'Browser output');
  process.exitCode = 1;
});
