import type { AppContext } from '../../types';
import { getCattleByIdAndUserWithVitals } from '../../db/cattle/queries';
import { getDb } from '../../utils/db';
import { success, error } from '../../utils/responses';
import { serializeCattleWithVitals } from './serialize';

export async function getCattle(c: AppContext) {
  const user = c.get('user');
  const db = getDb(c);
  const id = c.req.param('id') ?? '';

  const row = await getCattleByIdAndUserWithVitals(db, id, user.id);
  if (!row) return error(c, 'Cattle not found', 404);

  return success(c, serializeCattleWithVitals(row));
}
