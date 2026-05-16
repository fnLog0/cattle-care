import { Hono } from 'hono';
import type { AppEnv } from '../types';
import { auth } from '../middleware/auth';
import {
  cattleStressHandler,
  cattleStressHistoryHandler,
  environmentalStressHandler,
} from '../handlers/stress';

export const stressRouter = new Hono<AppEnv>();

stressRouter.use('*', auth);

// PATCH /api/stress/cattle/:id — Calculate & update individual cattle stress (strain index)
stressRouter.patch('/cattle/:id', cattleStressHandler);

// GET /api/stress/cattle/:id/history?range=7d|30d|90d — Vitals history
stressRouter.get('/cattle/:id/history', cattleStressHistoryHandler);

// GET /api/stress/environmental?latitude=&longitude= — Get environmental stress (THI)
stressRouter.get('/environmental', environmentalStressHandler);
