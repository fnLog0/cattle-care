import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  type BaseMessage,
} from '@langchain/core/messages';
import { createLLM } from '../tools';
import type { AgentState } from '../state';

export async function respond(state: AgentState): Promise<Partial<AgentState>> {
  const llm = createLLM(state.provider, state.apiKey, state.model);

  const history: BaseMessage[] = state.recentMessages.map((m) =>
    m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content),
  );

  const messages: BaseMessage[] = [
    new SystemMessage(state.systemPrompt),
    ...history,
    new HumanMessage(state.userMessage),
  ];

  const result = await llm.invoke(messages);
  const reply =
    typeof result.content === 'string'
      ? result.content
      : result.content
          .map((part) => (typeof part === 'string' ? part : 'text' in part ? part.text : ''))
          .join('');

  return { reply };
}
