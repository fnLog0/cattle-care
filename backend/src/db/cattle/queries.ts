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

export type CattleWithVitalsRow = CattleRow & {
  latest_strain_index: number | null;
  latest_rectal_temperature: number | null;
  latest_respiration_rate: number | null;
  latest_recorded_at: string | null;
};

const LATEST_VITALS_JOIN = `LEFT JOIN vitals v ON v.id = (
    SELECT id FROM vitals WHERE cattle_id = c.id ORDER BY recorded_at DESC LIMIT 1
  )`;

const LATEST_VITALS_COLUMNS = `
    v.strain_index       AS latest_strain_index,
    v.rectal_temperature AS latest_rectal_temperature,
    v.respiration_rate   AS latest_respiration_rate,
    v.recorded_at        AS latest_recorded_at`;

export async function getCattleByIdAndUserWithVitals(
  db: D1Database,
  id: string,
  userId: string,
): Promise<CattleWithVitalsRow | null> {
  return db
    .prepare(
      `SELECT c.*, ${LATEST_VITALS_COLUMNS}
         FROM cattle c
         ${LATEST_VITALS_JOIN}
        WHERE c.id = ? AND c.user_id = ?`,
    )
    .bind(id, userId)
    .first<CattleWithVitalsRow>();
}

export async function getAllCattleByUserWithVitals(
  db: D1Database,
  userId: string,
): Promise<CattleWithVitalsRow[]> {
  const result = await db
    .prepare(
      `SELECT c.*, ${LATEST_VITALS_COLUMNS}
         FROM cattle c
         ${LATEST_VITALS_JOIN}
        WHERE c.user_id = ?
        ORDER BY c.created_at DESC`,
    )
    .bind(userId)
    .all<CattleWithVitalsRow>();
  return result.results;
}

export async function searchCattleByUserWithVitals(
  db: D1Database,
  userId: string,
  query: string,
): Promise<CattleWithVitalsRow[]> {
  const like = `%${query}%`;
  const result = await db
    .prepare(
      `SELECT c.*, ${LATEST_VITALS_COLUMNS}
         FROM cattle c
         ${LATEST_VITALS_JOIN}
        WHERE c.user_id = ?
          AND (c.name LIKE ? OR c.ear_tag LIKE ?)
        ORDER BY c.created_at DESC`,
    )
    .bind(userId, like, like)
    .all<CattleWithVitalsRow>();
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
): Promise<CattleWithVitalsRow[]> {
  const placeholders = AT_RISK_LEVELS.map(() => '?').join(',');
  const result = await db
    .prepare(
      `SELECT c.*, ${LATEST_VITALS_COLUMNS}
         FROM cattle c
         ${LATEST_VITALS_JOIN}
        WHERE c.user_id = ?
          AND c.stress_level IN (${placeholders})
        ORDER BY CASE c.stress_level
                   WHEN 'danger' THEN 0
                   WHEN 'severe' THEN 1
                   WHEN 'moderate' THEN 2
                   ELSE 3
                 END, c.updated_at DESC`,
    )
    .bind(userId, ...AT_RISK_LEVELS)
    .all<CattleWithVitalsRow>();
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
