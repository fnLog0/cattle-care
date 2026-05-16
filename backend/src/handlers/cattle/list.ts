import type { AppContext } from '../../types';
import {
  getAllCattleByUserWithVitals,
  searchCattleByUserWithVitals,
} from '../../db/cattle/queries';
import { getDb } from '../../utils/db';
import { success } from '../../utils/responses';
import { serializeCattleWithVitals } from './serialize';

export async function listCattle(c: AppContext) {
  const user = c.get('user');
  const db = getDb(c);
  const q = c.req.query('q');

  const rows = q
    ? await searchCattleByUserWithVitals(db, user.id, q)
    : await getAllCattleByUserWithVitals(db, user.id);

  return success(c, rows.map(serializeCattleWithVitals));
}
