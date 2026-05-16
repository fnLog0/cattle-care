import type { CattleRow } from './schema';

export async function getCattleById(db: D1Database, id: string): Promise<CattleRow | null> {
  return db.prepare('SELECT * FROM cattle WHERE id = ?').bind(id).first<CattleRow>();
}

export async function getCattleByIdAndUser(
  db: D1Database,
  id: string,
  userId: string,
): Promise<CattleRow | null> {
  return db
    .prepare('SELECT * FROM cattle WHERE id = ? AND user_id = ?')
    .bind(id, userId)
    .first<CattleRow>();
}

export async function getCattleByEarTag(
  db: D1Database,
  earTag: string,
): Promise<CattleRow | null> {
  return db.prepare('SELECT * FROM cattle WHERE ear_tag = ?').bind(earTag).first<CattleRow>();
}

export async function getAllCattleByUser(db: D1Database, userId: string): Promise<CattleRow[]> {
  const result = await db
    .prepare('SELECT * FROM cattle WHERE user_id = ? ORDER BY created_at DESC')
    .bind(userId)
    .all<CattleRow>();
  return result.results;
}

const AT_RISK_LEVELS = ['moderate', 'severe', 'danger'] as const;

export type StressDistribution = Record<CattleRow['stress_level'], number>;

export async function getStressDistribution(
  db: D1Database,
  userId: string,
): Promise<StressDistribution> {
  const result = await db
    .prepare(
      `SELECT stress_level, COUNT(*) AS count
         FROM cattle
        WHERE user_id = ?
        GROUP BY stress_level`,
    )
    .bind(userId)
    .all<{ stress_level: CattleRow['stress_level']; count: number }>();

  const dist: StressDistribution = {
    none: 0,
    mild: 0,
    moderate: 0,
    severe: 0,
    danger: 0,
  };
  for (const row of result.results) dist[row.stress_level] = row.count;
  return dist;
}

export async function getAtRiskCattleByUser(
  db: D1Database,
  userId: string,
): Promise<CattleRow[]> {
  const placeholders = AT_RISK_LEVELS.map(() => '?').join(',');
  const result = await db
    .prepare(
      `SELECT * FROM cattle
        WHERE user_id = ?
          AND stress_level IN (${placeholders})
        ORDER BY CASE stress_level
                   WHEN 'danger' THEN 0
                   WHEN 'severe' THEN 1
                   WHEN 'moderate' THEN 2
                   ELSE 3
                 END, updated_at DESC`,
    )
    .bind(userId, ...AT_RISK_LEVELS)
    .all<CattleRow>();
  return result.results;
}

export async function searchCattleByUser(
  db: D1Database,
  userId: string,
  query: string,
): Promise<CattleRow[]> {
  const like = `%${query}%`;
  const result = await db
    .prepare(
      'SELECT * FROM cattle WHERE user_id = ? AND (name LIKE ? OR ear_tag LIKE ?) ORDER BY created_at DESC',
    )
    .bind(userId, like, like)
    .all<CattleRow>();
  return result.results;
}
