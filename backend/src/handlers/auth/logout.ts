import type { AppContext } from '../../types';
import { deleteSession, deleteAllUserSessions } from '../../db';
import { success } from '../../utils/responses';

export async function logoutHandler(c: AppContext) {
  const session = c.get('session');
  await deleteSession(c.env.DB, session.token);
  return success(c, { message: 'Logged out' });
}

export async function logoutAllHandler(c: AppContext) {
  const user = c.get('user');
  await deleteAllUserSessions(c.env.DB, user.id);
  return success(c, { message: 'All sessions revoked' });
}
