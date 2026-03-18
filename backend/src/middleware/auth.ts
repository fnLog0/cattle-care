import { createMiddleware } from 'hono/factory';
import type { AppEnv } from '../types';
import { getSessionByToken } from '../db/sessions';
import { getUserById } from '../db/users';

export const auth = createMiddleware<AppEnv>(async (c, next) => {
  const authorization = c.req.header('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }

  const token = authorization.slice(7);
  const session = await getSessionByToken(c.env.DB, token);

  if (!session) {
    return c.json({ success: false, error: 'Invalid or expired session' }, 401);
  }

  const user = await getUserById(c.env.DB, session.user_id);

  if (!user || user.status === 'banned') {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }

  c.set('session', session);
  c.set('user', user);

  await next();
});
