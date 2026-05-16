import { Hono } from 'hono';
import type { AppEnv } from '../types';
import { auth } from '../middleware/auth';
import { herdSummaryHandler, atRiskCattleHandler } from '../handlers/reports';

export const reportsRouter = new Hono<AppEnv>();

reportsRouter.use('*', auth);

// GET /api/reports/summary — herd-wide stress distribution
reportsRouter.get('/summary', herdSummaryHandler);

// GET /api/reports/at-risk — cattle currently at moderate/severe/danger
reportsRouter.get('/at-risk', atRiskCattleHandler);
