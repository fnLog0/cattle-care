import type { AppContext } from '../../types';
import { getAtRiskCattleByUser } from '../../db';
import { getDb } from '../../utils/db';
import { success } from '../../utils/responses';

export async function atRiskCattleHandler(c: AppContext) {
  const user = c.get('user');
  const db = getDb(c);

  const rows = await getAtRiskCattleByUser(db, user.id);

  return success(
    c,
    rows.map((row) => ({
      id: row.id,
      name: row.name,
      breed: row.breed,
      age: row.age,
      weight: row.weight,
      earTag: row.ear_tag,
      stressLevel: row.stress_level,
      updatedAt: row.updated_at,
    })),
  );
}
