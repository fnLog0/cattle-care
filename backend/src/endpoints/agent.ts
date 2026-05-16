import { Hono } from 'hono';
import type { AppEnv } from '../types';
import { auth } from '../middleware/auth';
import { healthAgentHandler } from '../handlers/agent';

export const agentRouter = new Hono<AppEnv>();

agentRouter.use('*', auth);

// POST /api/agent/health — chat with the per-cattle Health Agent
agentRouter.post('/health', healthAgentHandler);
