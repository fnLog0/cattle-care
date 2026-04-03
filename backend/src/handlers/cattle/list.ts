import type { AppContext } from '../../types';
import { getAllCattleByUser, searchCattleByUser } from '../../db';
import { getLatestVitalsByCattle } from '../../db/vitals';
import { getDb } from '../../utils/db';
import { success } from '../../utils/responses';
import { formatVitals } from './utils';

export async function listCattle(c: AppContext) {
  const user = c.get('user');
  const db = getDb(c);
  const q = c.req.query('q');

  const rows = q
    ? await searchCattleByUser(db, user.id, q)
    : await getAllCattleByUser(db, user.id);

  const cattle = await Promise.all(
    rows.map(async (row) => {
      const latestVitals = await getLatestVitalsByCattle(db, row.id);
      return {
        id: row.id,
        name: row.name,
        breed: row.breed,
        age: row.age,
        weight: row.weight,
        earTag: row.ear_tag,
        stressLevel: row.stress_level,
        userId: row.user_id,
        createdAt: row.created_at,
        latestVitals: latestVitals ? formatVitals(latestVitals) : undefined,
      };
    }),
  );

  return success(c, cattle);
}
