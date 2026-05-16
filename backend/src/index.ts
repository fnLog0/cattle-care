import { Hono } from 'hono';
import type { AppEnv } from './types';
import { corsMiddleware } from './middleware/cors';
import { authRouter, cattleRouter, stressRouter, agentRouter } from './endpoints';

const app = new Hono<AppEnv>();

app.use('*', corsMiddleware);

app.route('/api/auth', authRouter);
app.route('/api/cattle', cattleRouter);
app.route('/api/stress', stressRouter);
app.route('/api/agent', agentRouter);

app.get('/', (c) => c.json({ name: 'cattle-care-api', status: 'ok' }));

export default app;
