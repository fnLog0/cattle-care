import type { AppContext } from '../../types';
import { getAllCattleByUser } from '../../db';
import { getLatestVitalsByCattle } from '../../db/vitals';
import { getDb } from '../../utils/db';
import { success } from '../../utils/responses';
import { formatVitals } from '../cattle/utils';

const STRESS_ORDER: Record<string, number> = { danger: 0, severe: 1, moderate: 2 };

export async function atRiskHandler(c: AppContext) {
  const user = c.get('user');
  const db = getDb(c);

  const allCattle = await getAllCattleByUser(db, user.id);
  const atRisk = allCattle.filter((cow) =>
    ['moderate', 'severe', 'danger'].includes(cow.stress_level),
  );

  atRisk.sort(
    (a, b) => (STRESS_ORDER[a.stress_level] ?? 3) - (STRESS_ORDER[b.stress_level] ?? 3),
  );

  // Fetch latest vitals for each at-risk cattle
  const results = await Promise.all(
    atRisk.map(async (cow) => {
      const latestVitals = await getLatestVitalsByCattle(db, cow.id);
      return {
        id: cow.id,
        name: cow.name,
        breed: cow.breed,
        age: cow.age,
        weight: cow.weight,
        earTag: cow.ear_tag,
        stressLevel: cow.stress_level,
        userId: cow.user_id,
        createdAt: cow.created_at,
        latestVitals: latestVitals ? formatVitals(latestVitals) : undefined,
      };
    }),
  );

  return success(c, results);
}
