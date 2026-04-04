import type { AppContext } from '../../types';
import { getCattleByIdAndUser } from '../../db';
import { getVitalsByCattle } from '../../db/vitals';
import { getDb } from '../../utils/db';
import { success, error } from '../../utils/responses';
import { formatVitals } from '../cattle/utils';

export async function listVitalsHandler(c: AppContext) {
  const user = c.get('user');
  const db = getDb(c);
  const cattleId = c.req.param('id') ?? '';

  const cattle = await getCattleByIdAndUser(db, cattleId, user.id);
  if (!cattle) return error(c, 'Cattle not found', 404);

  const rows = await getVitalsByCattle(db, cattleId, 10);
  return success(c, rows.map(formatVitals));
}
