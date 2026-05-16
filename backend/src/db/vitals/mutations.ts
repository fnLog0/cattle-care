import type { StressLevel } from './schema';

export async function insertVitals(
  db: D1Database,
  cattleId: string,
  data: {
    rectalTemperature: number;
    respirationRate: number;
    strainIndex: number;
    stressLevel: StressLevel;
  },
): Promise<void> {
  const id = crypto.randomUUID().replace(/-/g, '');
  await db
    .prepare(
      `INSERT INTO vitals
         (id, cattle_id, rectal_temperature, respiration_rate, strain_index, stress_level)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      cattleId,
      data.rectalTemperature,
      data.respirationRate,
      data.strainIndex,
      data.stressLevel,
    )
    .run();
}
