import type { CattleRow } from '../../db/cattle';
import type { MessageRow } from '../../db/messages';
import type { VitalsRow } from '../../db/vitals';
import type { THIResult } from '../thi';
import type { AgentProvider } from './tools';

export const HISTORY_LIMIT = 20;
export const VITALS_TREND_LIMIT = 10;

export type AgentInput = {
  db: D1Database;
  provider: AgentProvider;
  apiKey: string;
  model?: string;
  userId: string;
  cattleId: string;
  userMessage: string;
  latitude?: number;
  longitude?: number;
};

export type AgentResult = {
  reply: string;
  conversationId: string;
  cattleStress: {
    level: CattleRow['stress_level'];
    updatedAt: string;
  };
  environmentalStress?: THIResult;
};

export type AgentState = {
  // Input (carried through)
  db: D1Database;
  provider: AgentProvider;
  apiKey: string;
  model?: string;
  userId: string;
  cattleId: string;
  userMessage: string;
  latitude?: number;
  longitude?: number;

  // Resolved by loadContext
  conversationId: string;
  cattle: CattleRow;
  recentMessages: MessageRow[];
  vitalsHistory: VitalsRow[];
  environmentalStress?: THIResult;

  // Resolved by buildPrompt
  systemPrompt: string;

  // Resolved by respond
  reply: string;
};

export class CattleNotFoundError extends Error {
  constructor() {
    super('Cattle not found');
    this.name = 'CattleNotFoundError';
  }
}
