import type { AppContext } from '../../types';
import { deleteCattle } from '../../db';
import { getDb } from '../../utils/db';
import { success, error } from '../../utils/responses';

export async function deleteCattleHandler(c: AppContext) {
  const user = c.get('user');
  const db = getDb(c);
  const id = c.req.param('id') ?? '';

  const deleted = await deleteCattle(db, id, user.id);
  if (!deleted) return error(c, 'Cattle not found', 404);

  return success(c, { id });
}
