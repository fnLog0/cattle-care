import type { VitalsRow } from './schema';

export async function createVitals(
  db: D1Database,
  id: string,
  cattleId: string,
  data: {
    temperature: number;
    respiratoryRate: number;
    humidity: number;
    heartRate: number;
    stressIndex: number;
    stressLevel: VitalsRow['stress_level'];
  },
): Promise<VitalsRow | null> {
  await db
    .prepare(
      'INSERT INTO vitals (id, cattle_id, temperature, respiratory_rate, humidity, heart_rate, stress_index, stress_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    )
    .bind(
      id,
      cattleId,
      data.temperature,
      data.respiratoryRate,
      data.humidity,
      data.heartRate,
      data.stressIndex,
      data.stressLevel,
    )
    .run();
  return db.prepare('SELECT * FROM vitals WHERE id = ?').bind(id).first<VitalsRow>();
}
