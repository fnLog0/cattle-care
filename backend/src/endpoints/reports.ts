import { Hono } from 'hono';
import type { AppEnv } from '../types';
import { auth } from '../middleware/auth';
import { summaryHandler, atRiskHandler } from '../handlers/reports';

export const reportsRouter = new Hono<AppEnv>();

reportsRouter.use('*', auth);

reportsRouter.get('/summary', summaryHandler);
reportsRouter.get('/at-risk', atRiskHandler);
