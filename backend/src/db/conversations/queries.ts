import type { ConversationRow } from './schema';

export async function getHealthConversation(
  db: D1Database,
  userId: string,
  cattleId: string,
): Promise<ConversationRow | null> {
  return db
    .prepare(
      `SELECT * FROM conversations
       WHERE user_id = ? AND cattle_id = ? AND agent_type = 'health'`,
    )
    .bind(userId, cattleId)
    .first<ConversationRow>();
}
