import { Hono } from 'hono';
import type { AppEnv } from '../types';
import { auth } from '../middleware/auth';
import { agentHealthHandler, agentRegisterHandler, agentVitalsHandler } from '../handlers/agent';

export const agentRouter = new Hono<AppEnv>();

agentRouter.use('*', auth);

agentRouter.post('/health', agentHealthHandler);
agentRouter.post('/register', agentRegisterHandler);
agentRouter.post('/vitals', agentVitalsHandler);
