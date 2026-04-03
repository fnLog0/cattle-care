import { Hono } from 'hono';
import type { AppEnv } from '../types';
import { auth } from '../middleware/auth';
import { addVitalsHandler, listVitalsHandler } from '../handlers/vitals';

export const vitalsRouter = new Hono<AppEnv>();

vitalsRouter.use('*', auth);

vitalsRouter.get('/:id/vitals', listVitalsHandler);
vitalsRouter.post('/:id/vitals', addVitalsHandler);
