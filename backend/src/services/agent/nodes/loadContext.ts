import { getCattleByIdAndUser } from '../../../db/cattle';
import {
  getHealthConversation,
  createHealthConversation,
} from '../../../db/conversations';
import { getRecentMessages } from '../../../db/messages';
import { getLatestVitals } from '../../../db/vitals';
import { getEnvironmentalStress } from '../../thi';
import {
  CattleNotFoundError,
  HISTORY_LIMIT,
  VITALS_TREND_LIMIT,
  type AgentState,
} from '../state';

export async function loadContext(state: AgentState): Promise<Partial<AgentState>> {
  const cattle = await getCattleByIdAndUser(state.db, state.cattleId, state.userId);
  if (!cattle) throw new CattleNotFoundError();

  let conversation = await getHealthConversation(state.db, state.userId, state.cattleId);
  if (!conversation) {
    conversation = await createHealthConversation(state.db, state.userId, state.cattleId);
  }

  const [recentMessages, vitalsHistory, environmentalStress] = await Promise.all([
    getRecentMessages(state.db, conversation.id, HISTORY_LIMIT),
    getLatestVitals(state.db, state.cattleId, VITALS_TREND_LIMIT),
    state.latitude !== undefined && state.longitude !== undefined
      ? getEnvironmentalStress(state.latitude, state.longitude).catch(() => undefined)
      : Promise.resolve(undefined),
  ]);

  return {
    cattle,
    conversationId: conversation.id,
    recentMessages,
    vitalsHistory,
    environmentalStress,
  };
}
