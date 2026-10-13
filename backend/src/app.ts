import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import type { Env } from './config/env.js';
import { createLogger } from './config/logger.js';
import { apiRoutes } from './routes/index.js';

export function createApp(config: Env) {
  const app = express();
  app.disable('x-powered-by');
  app.use(pinoHttp({
    logger: createLogger(config.LOG_LEVEL),
    serializers: {
      req: (req: { id: unknown; method: string; url: string }) => ({
        id: req.id, method: req.method, path: req.url.split('?')[0],
      }),
    },
  }));
  app.use(helmet());
  app.use(cors({ origin: config.CORS_ORIGINS }));
  app.use(express.json({ limit: '100kb' }));
  app.use('/api', apiRoutes);
  return app;
}
