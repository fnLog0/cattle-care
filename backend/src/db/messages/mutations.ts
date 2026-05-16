import type { MessageRole } from './schema';

export async function appendMessage(
  db: D1Database,
  conversationId: string,
  role: MessageRole,
  content: string,
): Promise<void> {
  const id = crypto.randomUUID().replace(/-/g, '');
  await db
    .prepare(
      `INSERT INTO messages (id, conversation_id, role, content)
       VALUES (?, ?, ?, ?)`,
    )
    .bind(id, conversationId, role, content)
    .run();
}
