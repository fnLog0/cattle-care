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
