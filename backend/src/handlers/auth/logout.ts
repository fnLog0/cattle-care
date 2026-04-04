import type { AppContext } from '../../types';
import { deleteSession } from '../../db/sessions';
import { success } from '../../utils/responses';

export async function logoutHandler(c: AppContext) {
  const session = c.get('session');
  await deleteSession(c.env.DB, session.token);
  return success(c, { message: 'Logged out' });
}
