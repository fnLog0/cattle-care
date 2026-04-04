import type { VitalsRow } from './schema';

export async function createVitals(
  db: D1Database,
  id: string,
  cattleId: string,
  data: {
    bodyTemperature: number;
    respiratoryRate: number;
    heartRate?: number | null;
    ambientTemperature: number;
    humidity: number;
    stressIndex: number;
    stressLevel: VitalsRow['stress_level'];
  },
): Promise<VitalsRow | null> {
  await db
    .prepare(
      'INSERT INTO vitals (id, cattle_id, body_temperature, respiratory_rate, heart_rate, ambient_temperature, humidity, stress_index, stress_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )
    .bind(
      id,
      cattleId,
      data.bodyTemperature,
      data.respiratoryRate,
      data.heartRate ?? null,
      data.ambientTemperature,
      data.humidity,
      data.stressIndex,
      data.stressLevel,
    )
    .run();
  return db.prepare('SELECT * FROM vitals WHERE id = ?').bind(id).first<VitalsRow>();
}
