import type { MessageRow } from './schema';

export async function getRecentMessages(
  db: D1Database,
  conversationId: string,
  limit = 20,
): Promise<MessageRow[]> {
  const result = await db
    .prepare(
      `SELECT * FROM messages
       WHERE conversation_id = ?
       ORDER BY created_at DESC
       LIMIT ?`,
    )
    .bind(conversationId, limit)
    .all<MessageRow>();
  return result.results.reverse();
}
