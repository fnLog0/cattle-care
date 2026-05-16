import { ChatAnthropic } from '@langchain/anthropic';
import { ChatOpenAI } from '@langchain/openai';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';

export type AgentProvider = 'anthropic' | 'openai';

export const MAX_TOKENS = 1024;

export const DEFAULT_MODELS: Record<AgentProvider, string> = {
  anthropic: 'claude-sonnet-4-20250514',
  openai: 'gpt-4.1',
};

export function createLLM(
  provider: AgentProvider,
  apiKey: string,
  model?: string,
): BaseChatModel {
  const resolved = model ?? DEFAULT_MODELS[provider];

  switch (provider) {
    case 'anthropic':
      return new ChatAnthropic({
        apiKey,
        model: resolved,
        maxTokens: MAX_TOKENS,
      });
    case 'openai':
      return new ChatOpenAI({
        apiKey,
        model: resolved,
        maxTokens: MAX_TOKENS,
      });
  }
}

// Provider-agnostic tool definitions (none for this iteration).
// When vitals-via-chat is added, define tool schemas here and bind them
// via `createLLM(...).bindTools([...])` inside the respond node.
// LangChain abstracts tool calling so the same definitions work for both
// Anthropic and OpenAI.
export const tools: never[] = [];
