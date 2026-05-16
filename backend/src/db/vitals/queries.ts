import type { VitalsRow } from './schema';

export type VitalsRange = '7d' | '30d' | '90d';

export async function getLatestVitals(
  db: D1Database,
  cattleId: string,
  limit = 10,
): Promise<VitalsRow[]> {
  const result = await db
    .prepare(
      `SELECT * FROM vitals
       WHERE cattle_id = ?
       ORDER BY recorded_at DESC
       LIMIT ?`,
    )
    .bind(cattleId, limit)
    .all<VitalsRow>();
  return result.results.reverse();
}

const RANGE_DAYS: Record<VitalsRange, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

export async function getVitalsHistory(
  db: D1Database,
  cattleId: string,
  range: VitalsRange = '30d',
): Promise<VitalsRow[]> {
  const days = RANGE_DAYS[range];
  const result = await db
    .prepare(
      `SELECT * FROM vitals
       WHERE cattle_id = ?
         AND recorded_at >= datetime('now', '-' || ? || ' days')
       ORDER BY recorded_at ASC`,
    )
    .bind(cattleId, days)
    .all<VitalsRow>();
  return result.results;
}
