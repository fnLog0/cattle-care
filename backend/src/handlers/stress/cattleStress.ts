import { z } from 'zod';
import type { AppContext } from '../../types';
import { getCattleByIdAndUser, updateCattleStressLevel, insertVitals } from '../../db';
import { getDb } from '../../utils/db';
import { success, error } from '../../utils/responses';
import { calculateCattleStress } from '../../services/cattle-stress';

const schema = z.object({
  rectalTemperature: z.number().min(30).max(45),
  respirationRate: z.number().min(1).max(200),
});

export async function cattleStressHandler(c: AppContext) {
  const user = c.get('user');
  const db = getDb(c);
  const id = c.req.param('id') ?? '';

  const cattle = await getCattleByIdAndUser(db, id, user.id);
  if (!cattle) return error(c, 'Cattle not found', 404);

  const body = await c.req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return error(c, parsed.error.errors[0]?.message ?? 'Invalid input', 400);
  }

  const { rectalTemperature, respirationRate } = parsed.data;

  const result = calculateCattleStress({
    breed: cattle.breed,
    rectalTemperature,
    respirationRate,
  });

  await Promise.all([
    updateCattleStressLevel(db, id, user.id, result.stressLevel),
    insertVitals(db, id, {
      rectalTemperature,
      respirationRate,
      strainIndex: result.strainIndex,
      stressLevel: result.stressLevel,
    }),
  ]);

  return success(c, {
    cattleId: cattle.id,
    cattleName: cattle.name,
    breed: cattle.breed,
    ...result,
  });
}
