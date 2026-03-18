import type { SessionRow } from './schema';

export async function getSessionByToken(
  db: D1Database,
  token: string,
): Promise<SessionRow | null> {
  return db
    .prepare(
      "SELECT * FROM sessions WHERE token = ? AND expires_at > datetime('now')",
    )
    .bind(token)
    .first<SessionRow>();
}
