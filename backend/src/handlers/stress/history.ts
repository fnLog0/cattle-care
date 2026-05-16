import { z } from 'zod';
import type { AppContext } from '../../types';
import { getCattleByIdAndUser, getVitalsHistory } from '../../db';
import { getDb } from '../../utils/db';
import { success, error } from '../../utils/responses';

const querySchema = z.object({
  range: z.enum(['7d', '30d', '90d']).default('30d'),
});

export async function cattleStressHistoryHandler(c: AppContext) {
  const user = c.get('user');
  const db = getDb(c);
  const id = c.req.param('id') ?? '';

  const cattle = await getCattleByIdAndUser(db, id, user.id);
  if (!cattle) return error(c, 'Cattle not found', 404);

  const parsed = querySchema.safeParse({ range: c.req.query('range') ?? undefined });
  if (!parsed.success) {
    return error(c, parsed.error.errors[0]?.message ?? 'Invalid range', 400);
  }

  const rows = await getVitalsHistory(db, id, parsed.data.range);

  return success(c, {
    cattleId: id,
    range: parsed.data.range,
    count: rows.length,
    readings: rows.map((r) => ({
      id: r.id,
      rectalTemperature: r.rectal_temperature,
      respirationRate: r.respiration_rate,
      strainIndex: r.strain_index,
      stressLevel: r.stress_level,
      recordedAt: r.recorded_at,
    })),
  });
}
