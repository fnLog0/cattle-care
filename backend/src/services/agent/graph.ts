import { END, START, StateGraph } from '@langchain/langgraph';

import { loadContext, buildPrompt, respond, persist } from './nodes';
import {
  CattleNotFoundError,
  type AgentInput,
  type AgentResult,
  type AgentState,
} from './state';

export { CattleNotFoundError };
export type { AgentInput, AgentResult };

function buildGraph() {
  const graph = new StateGraph<AgentState>({
    channels: {
      db: null,
      provider: null,
      apiKey: null,
      model: null,
      userId: null,
      cattleId: null,
      userMessage: null,
      latitude: null,
      longitude: null,
      conversationId: null,
      cattle: null,
      recentMessages: null,
      vitalsHistory: null,
      environmentalStress: null,
      systemPrompt: null,
      reply: null,
    },
  });

  graph
    .addNode('loadContext', loadContext)
    .addNode('buildPrompt', buildPrompt)
    .addNode('respond', respond)
    .addNode('persist', persist)
    .addEdge(START, 'loadContext')
    .addEdge('loadContext', 'buildPrompt')
    .addEdge('buildPrompt', 'respond')
    .addEdge('respond', 'persist')
    .addEdge('persist', END);

  return graph.compile();
}

const compiledGraph = buildGraph();

export async function runHealthAgent(input: AgentInput): Promise<AgentResult> {
  const initial: Partial<AgentState> = {
    db: input.db,
    provider: input.provider,
    apiKey: input.apiKey,
    model: input.model,
    userId: input.userId,
    cattleId: input.cattleId,
    userMessage: input.userMessage,
    latitude: input.latitude,
    longitude: input.longitude,
  };

  const final = (await compiledGraph.invoke(initial as AgentState)) as AgentState;

  return {
    reply: final.reply,
    conversationId: final.conversationId,
    cattleStress: {
      level: final.cattle.stress_level,
      updatedAt: final.cattle.updated_at,
    },
    environmentalStress: final.environmentalStress,
  };
}
