import { touchConversation } from '../../../db/conversations';
import { appendMessage } from '../../../db/messages';
import type { AgentState } from '../state';

export async function persist(state: AgentState): Promise<Partial<AgentState>> {
  await appendMessage(state.db, state.conversationId, 'user', state.userMessage);
  await appendMessage(state.db, state.conversationId, 'assistant', state.reply);
  await touchConversation(state.db, state.conversationId);
  return {};
}
