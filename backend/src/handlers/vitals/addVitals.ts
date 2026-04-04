import { z } from 'zod';
import type { AppContext } from '../../types';
import { getCattleByIdAndUser } from '../../db';
import { createVitals } from '../../db/vitals';
import { updateCattleStressLevel } from '../../db/cattle';
import { getDb } from '../../utils/db';
import { success, error } from '../../utils/responses';

const AddVitalsSchema = z.object({
  bodyTemperature: z.number().min(30).max(45),
  respiratoryRate: z.number().min(5).max(60),
  heartRate: z.number().min(20).max(150).optional().nullable(),
  ambientTemperature: z.number().min(-10).max(60),
  humidity: z.number().min(0).max(100),
});

// THI-based stress index (0–100 scale)
// THI formula: 0.8 * ambientTemp + (humidity/100) * (ambientTemp - 14.4) + 46.4
// Cattle THI stress thresholds: <72 none, 72–79 mild, 80–88 moderate, 89–98 severe, >98 danger
// We also factor in body temperature and respiratory rate as individual indicators
function calcStressIndex(
  bodyTemp: number,
  respRate: number,
  ambientTemp: number,
  humidity: number,
  heartRate?: number | null,
): number {
  const thi = 0.8 * ambientTemp + (humidity / 100) * (ambientTemp - 14.4) + 46.4;
  // Normalise THI to 0–100 (danger at THI ≥ 98, none at THI ≤ 72)
  const thiScore = Math.min(100, Math.max(0, ((thi - 72) / (98 - 72)) * 100));

  // Body indicators score
  const bodyTempScore = Math.min(100, Math.max(0, (bodyTemp - 38.5) * 20));
  const respScore = Math.min(100, Math.max(0, (respRate - 20) * 3));
  const heartScore = heartRate != null ? Math.min(100, Math.max(0, (heartRate - 65) * 2)) : 0;
  const heartWeight = heartRate != null ? 0.15 : 0;

  // Weighted combination: THI 40%, body temp 25%, resp rate 20%, heart rate 15% (if provided)
  const score =
    thiScore * 0.4 +
    bodyTempScore * 0.25 +
    respScore * (heartRate != null ? 0.2 : 0.35) +
    heartScore * heartWeight;

  return Math.min(100, Math.max(0, score));
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

  const { bodyTemperature, respiratoryRate, heartRate, ambientTemperature, humidity } = parsed.data;
  const stressIndex = calcStressIndex(bodyTemperature, respiratoryRate, ambientTemperature, humidity, heartRate);
  const stressLevel = getStressLevel(stressIndex);

  const id = crypto.randomUUID().replace(/-/g, '');
  const row = await createVitals(db, id, cattleId, {
    bodyTemperature,
    respiratoryRate,
    heartRate: heartRate ?? null,
    ambientTemperature,
    humidity,
    stressIndex,
    stressLevel,
  });

  if (!row) return error(c, 'Failed to record vitals', 500);

  await updateCattleStressLevel(db, cattleId, stressLevel);

  return success(
    c,
    {
      id: row.id,
      cattleId: row.cattle_id,
      bodyTemperature: row.body_temperature,
      respiratoryRate: row.respiratory_rate,
      heartRate: row.heart_rate,
      ambientTemperature: row.ambient_temperature,
      humidity: row.humidity,
      stressIndex: row.stress_index,
      stressLevel: row.stress_level,
      recordedAt: row.recorded_at,
    },
    201,
  );
}
