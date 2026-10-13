import { Router } from 'express';
import { healthRoutes } from './health.routes.js';
import { leadRoutes } from './lead.routes.js';

export const apiRoutes = Router();
apiRoutes.use('/health', healthRoutes);
apiRoutes.use('/leads', leadRoutes);
