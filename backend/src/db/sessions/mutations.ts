import { SESSION_EXPIRES_DAYS } from '../../config';

export async function createSession(
  db: D1Database,
  userId: string,
  token: string,
): Promise<void> {
  const id = crypto.randomUUID().replace(/-/g, '');
  await db
    .prepare(
      `INSERT INTO sessions (id, user_id, token, expires_at)
       VALUES (?, ?, ?, datetime('now', '+${SESSION_EXPIRES_DAYS} days'))`,
    )
    .bind(id, userId, token)
    .run();
}

export async function deleteSession(db: D1Database, token: string): Promise<void> {
  await db.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
}

export async function deleteAllUserSessions(db: D1Database, userId: string): Promise<void> {
  await db.prepare('DELETE FROM sessions WHERE user_id = ?').bind(userId).run();
}
