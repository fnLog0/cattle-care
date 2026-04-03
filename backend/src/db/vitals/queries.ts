import type { VitalsRow } from './schema';

export async function getVitalsByCattle(
  db: D1Database,
  cattleId: string,
  limit = 10,
): Promise<VitalsRow[]> {
  const result = await db
    .prepare(
      'SELECT * FROM vitals WHERE cattle_id = ? ORDER BY recorded_at DESC LIMIT ?',
    )
    .bind(cattleId, limit)
    .all<VitalsRow>();
  return result.results;
}

export async function getLatestVitalsByCattle(
  db: D1Database,
  cattleId: string,
): Promise<VitalsRow | null> {
  return db
    .prepare('SELECT * FROM vitals WHERE cattle_id = ? ORDER BY recorded_at DESC LIMIT 1')
    .bind(cattleId)
    .first<VitalsRow>();
}
