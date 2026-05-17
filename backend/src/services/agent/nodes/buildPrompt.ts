import { buildSystemPrompt } from '../prompt';
import type { AgentState } from '../state';

export function buildPrompt(state: AgentState): Partial<AgentState> {
  return {
    systemPrompt: buildSystemPrompt(
      state.cattle,
      state.environmentalStress,
      state.vitalsHistory,
      state.language,
    ),
  };
}
