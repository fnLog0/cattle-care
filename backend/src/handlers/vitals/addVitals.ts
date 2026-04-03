import { z } from 'zod';
import type { AppContext } from '../../types';
import { getCattleByIdAndUser } from '../../db';
import { createVitals } from '../../db/vitals';
import { updateCattleStressLevel } from '../../db/cattle';
import { getDb } from '../../utils/db';
import { success, error } from '../../utils/responses';

const AddVitalsSchema = z.object({
  temperature: z.number().min(30).max(45),
  respiratoryRate: z.number().min(5).max(60),
  humidity: z.number().min(0).max(100),
  heartRate: z.number().min(20).max(150),
});

function calcStressIndex(temp: number, respRate: number, heartRate: number): number {
  const raw = (temp - 38.5) * 10 + (respRate - 20) * 2 + (heartRate - 65) * 1.5;
  return Math.min(100, Math.max(0, raw));
}

function getStressLevel(index: number): 'none' | 'mild' | 'moderate' | 'severe' | 'danger' {
  if (index >= 80) return 'danger';
  if (index >= 60) return 'severe';
  if (index >= 40) return 'moderate';
  if (index >= 20) return 'mild';
  return 'none';
}

export async function addVitalsHandler(c: AppContext) {
  const user = c.get('user');
  const db = getDb(c);
  const cattleId = c.req.param('id') ?? '';

  const cattle = await getCattleByIdAndUser(db, cattleId, user.id);
  if (!cattle) return error(c, 'Cattle not found', 404);

  const body = await c.req.json().catch(() => null);
  const parsed = AddVitalsSchema.safeParse(body);
  if (!parsed.success) {
    return error(c, parsed.error.errors[0]?.message ?? 'Invalid input', 400);
  }

  const { temperature, respiratoryRate, humidity, heartRate } = parsed.data;
  const stressIndex = calcStressIndex(temperature, respiratoryRate, heartRate);
  const stressLevel = getStressLevel(stressIndex);

  const id = crypto.randomUUID().replace(/-/g, '');
  const row = await createVitals(db, id, cattleId, {
    temperature,
    respiratoryRate,
    humidity,
    heartRate,
    stressIndex,
    stressLevel,
  });

  if (!row) return error(c, 'Failed to record vitals', 500);

  // Update cattle stress level to reflect latest reading
  await updateCattleStressLevel(db, cattleId, stressLevel);

  return success(
    c,
    {
      id: row.id,
      cattleId: row.cattle_id,
      temperature: row.temperature,
      respiratoryRate: row.respiratory_rate,
      humidity: row.humidity,
      heartRate: row.heart_rate,
      stressIndex: row.stress_index,
      stressLevel: row.stress_level,
      recordedAt: row.recorded_at,
    },
    201,
  );
}
