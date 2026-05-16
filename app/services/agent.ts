import { Cattle } from '@/types';
import { apiRequest, getStoredToken } from './api-client';

// Registration types kept for legacy hook compatibility, but no longer used —
// cattle registration is now a plain form (see app/cattle/create.tsx).
export type RegistrationStep = 'name' | 'breed' | 'age' | 'weight' | 'earTag' | 'confirm';
export type RegistrationState = {
  step: RegistrationStep;
  collected: Partial<{ name: string; breed: string; age: number; weight: number; earTag: string }>;
};

export function getInitialRegistrationState(): RegistrationState {
  return { step: 'name', collected: {} };
}

export function getRegistrationWelcome(): string {
  return 'Registration is now a form — open the + button on the cattle list.';
}

export async function chatRegistration(
  state: RegistrationState,
  _userMessage: string,
): Promise<{ response: string; nextState: RegistrationState; isComplete: boolean }> {
  return {
    response: getRegistrationWelcome(),
    nextState: state,
    isComplete: false,
  };
}

// ─── Health Agent ─────────────────────────────────────────────────────────────

export function getHealthWelcome(cattle?: Cattle): string {
  if (!cattle) {
    return "Hi! I'm your AI health assistant. Ask me anything about this cattle's health.";
  }
  return `Hi! I'm watching over ${cattle.name}. Ask me about her stress level, recent trend, or what to do next.`;
}

type HealthResponse = {
  reply: string;
  conversationId: string;
  cattleStress?: { level: string; updatedAt: string };
  environmentalStress?: {
    thi: number;
    stressLevel: string;
    temperature: number;
    humidity: number;
  };
};

/**
 * Talk to the backend Health Agent (LangGraph workflow).
 * Returns the assistant reply as a string for now; the full payload is
 * available via the lower-level `chatHealthDetailed` if a caller needs it.
 */
export async function chatHealth(
  message: string,
  cattle?: Cattle,
  location?: { latitude: number; longitude: number },
): Promise<string> {
  const result = await chatHealthDetailed(message, cattle, location);
  return result.reply;
}

export async function chatHealthDetailed(
  message: string,
  cattle?: Cattle,
  location?: { latitude: number; longitude: number },
): Promise<HealthResponse> {
  if (!cattle) {
    throw new Error('chatHealth requires a cattle context');
  }
  const token = (await getStoredToken()) ?? undefined;
  return apiRequest<HealthResponse>('/api/agent/health', {
    method: 'POST',
    token,
    body: JSON.stringify({
      cattleId: cattle.id,
      message,
      ...(location ? { latitude: location.latitude, longitude: location.longitude } : {}),
    }),
  });
}
