import type { AppContext } from '../../types';
import { getAtRiskCattleByUser } from '../../db';
import { getDb } from '../../utils/db';
import { success } from '../../utils/responses';
import { serializeCattleWithVitals } from '../cattle/serialize';

export async function atRiskCattleHandler(c: AppContext) {
  const user = c.get('user');
  const db = getDb(c);

  const rows = await getAtRiskCattleByUser(db, user.id);

  return success(c, rows.map(serializeCattleWithVitals));
}
