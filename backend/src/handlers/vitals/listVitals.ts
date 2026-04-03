import type { AppContext } from '../../types';
import { getCattleByIdAndUser } from '../../db';
import { getVitalsByCattle } from '../../db/vitals';
import { getDb } from '../../utils/db';
import { success, error } from '../../utils/responses';

export async function listVitalsHandler(c: AppContext) {
  const user = c.get('user');
  const db = getDb(c);
  const cattleId = c.req.param('id') ?? '';

  const cattle = await getCattleByIdAndUser(db, cattleId, user.id);
  if (!cattle) return error(c, 'Cattle not found', 404);

  const rows = await getVitalsByCattle(db, cattleId, 10);

  const vitals = rows.map((row) => ({
    id: row.id,
    cattleId: row.cattle_id,
    temperature: row.temperature,
    respiratoryRate: row.respiratory_rate,
    humidity: row.humidity,
    heartRate: row.heart_rate,
    stressIndex: row.stress_index,
    stressLevel: row.stress_level,
    recordedAt: row.recorded_at,
  }));

  return success(c, vitals);
}
