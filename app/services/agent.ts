import { apiRequest, getStoredToken } from './api-client';

async function tok(): Promise<string | undefined> {
  return (await getStoredToken()) ?? undefined;
}

export type RegistrationStep = 'name' | 'breed' | 'age' | 'weight' | 'earTag' | 'confirm';

export type RegistrationState = {
  step: RegistrationStep;
  collected: {
    name?: string;
    breed?: string;
    age?: number;
    weight?: number;
    earTag?: string;
  };
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
};

type AgentHealthResponse = { reply: string };
type AgentRegisterResponse = {
  reply: string;
  isComplete: boolean;
  cattleData: { name: string; breed: string; age: number; weight: number; earTag: string } | null;
};

export function getInitialRegistrationState(): RegistrationState {
  return { step: 'name', collected: {}, history: [] };
}

export function getRegistrationWelcome(): string {
  return "Hello! I'm your cattle registration assistant. Let's register your new cattle.\n\nWhat is the name of your cattle?";
}

export function getHealthWelcome(cattle?: { name: string; earTag: string; latestVitals?: { stressLevel: string; stressIndex: number; recordedAt: string } }): string {
  if (!cattle) return "Hello! I'm the CattleCare AI Health Assistant. How can I help you today?";
  const v = cattle.latestVitals;
  return `Hello! I'm monitoring ${cattle.name} (${cattle.earTag}).\n\nCurrent Status:\n• Stress Level: ${v?.stressLevel ?? 'Unknown'}\n• Stress Index: ${v ? v.stressIndex.toFixed(1) : 'N/A'}/100\n\nHow can I help you?`;
}

export async function chatHealth(
  message: string,
  cattle?: { id: string },
  history: Array<{ role: 'user' | 'assistant'; content: string }> = [],
): Promise<string> {
  if (!cattle?.id) return "I need cattle context to help. Please open a cattle's detail page.";
  const res = await apiRequest<AgentHealthResponse>('/api/agent/health', {
    method: 'POST',
    token: await tok(),
    body: JSON.stringify({ cattleId: cattle.id, message, history }),
  });
  return res.reply;
}

export async function chatRegistration(
  state: RegistrationState,
  userMessage: string,
): Promise<{ response: string; nextState: RegistrationState; isComplete: boolean; cattleData?: AgentRegisterResponse['cattleData'] }> {
  const res = await apiRequest<AgentRegisterResponse>('/api/agent/register', {
    method: 'POST',
    token: await tok(),
    body: JSON.stringify({
      message: userMessage,
      history: state.history,
      collected: state.collected,
    }),
  });

  const newHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [
    ...state.history,
    { role: 'user', content: userMessage },
    { role: 'assistant', content: res.reply },
  ];

  const nextState: RegistrationState = {
    ...state,
    history: newHistory,
  };

  return {
    response: res.reply,
    nextState,
    isComplete: res.isComplete,
    cattleData: res.cattleData,
  };
}
