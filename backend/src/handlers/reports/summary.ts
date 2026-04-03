import type { AppContext } from '../../types';
import { getAllCattleByUser } from '../../db';
import { getDb } from '../../utils/db';
import { success } from '../../utils/responses';

export async function summaryHandler(c: AppContext) {
  const user = c.get('user');
  const db = getDb(c);

  const cattle = await getAllCattleByUser(db, user.id);

  const stressDistribution = {
    none: 0,
    mild: 0,
    moderate: 0,
    severe: 0,
    danger: 0,
  };

  for (const cow of cattle) {
    stressDistribution[cow.stress_level]++;
  }

  return success(c, {
    totalCattle: cattle.length,
    stressDistribution,
  });
}
