import type { AppContext } from '../../types';
import { getStressDistribution } from '../../db';
import { getDb } from '../../utils/db';
import { success } from '../../utils/responses';

export async function herdSummaryHandler(c: AppContext) {
  const user = c.get('user');
  const db = getDb(c);

  const distribution = await getStressDistribution(db, user.id);
  const totalCattle = Object.values(distribution).reduce((a, b) => a + b, 0);

  return success(c, { totalCattle, stressDistribution: distribution });
}
