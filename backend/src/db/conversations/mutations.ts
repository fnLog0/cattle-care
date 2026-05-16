import type { ConversationRow } from './schema';

export async function createHealthConversation(
  db: D1Database,
  userId: string,
  cattleId: string,
): Promise<ConversationRow> {
  const id = crypto.randomUUID().replace(/-/g, '');
  await db
    .prepare(
      `INSERT INTO conversations (id, user_id, cattle_id, agent_type)
       VALUES (?, ?, ?, 'health')`,
    )
    .bind(id, userId, cattleId)
    .run();
  const row = await db
    .prepare('SELECT * FROM conversations WHERE id = ?')
    .bind(id)
    .first<ConversationRow>();
  if (!row) throw new Error('Failed to create conversation');
  return row;
}

export async function touchConversation(db: D1Database, id: string): Promise<void> {
  await db
    .prepare("UPDATE conversations SET updated_at = datetime('now') WHERE id = ?")
    .bind(id)
    .run();
}
