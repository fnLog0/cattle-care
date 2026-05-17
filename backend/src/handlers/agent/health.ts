import { z } from 'zod';
import type { AppContext } from '../../types';
import { success, error } from '../../utils/responses';
import { runHealthAgent, CattleNotFoundError } from '../../services/agent/graph';
import type { AgentProvider } from '../../services/agent/tools';

const schema = z.object({
  cattleId: z.string().min(1),
  message: z.string().min(1).max(2000),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  language: z.enum(['en', 'hi']).optional(),
});

function resolveProvider(env: AppContext['env']): {
  provider: AgentProvider;
  apiKey: string | undefined;
  model: string | undefined;
} {
  const provider: AgentProvider = env.AGENT_PROVIDER === 'openai' ? 'openai' : 'anthropic';
  if (provider === 'openai') {
    return { provider, apiKey: env.OPENAI_API_KEY, model: env.OPENAI_MODEL };
  }
  return { provider, apiKey: env.ANTHROPIC_API_KEY, model: env.ANTHROPIC_MODEL };
}

export async function healthAgentHandler(c: AppContext) {
  const user = c.get('user');

  const body = await c.req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return error(c, parsed.error.errors[0]?.message ?? 'Invalid input', 400);
  }

  const { provider, apiKey, model } = resolveProvider(c.env);
  if (!apiKey) {
    return error(c, `Agent is not configured for provider "${provider}"`, 500);
  }

  const { cattleId, message, latitude, longitude, language } = parsed.data;

  try {
    const result = await runHealthAgent({
      db: c.env.DB,
      provider,
      apiKey,
      model,
      userId: user.id,
      cattleId,
      userMessage: message,
      latitude,
      longitude,
      language,
    });
    return success(c, result);
  } catch (err) {
    if (err instanceof CattleNotFoundError) {
      return error(c, 'Cattle not found', 404);
    }
    console.error('healthAgent: workflow failed', {
      provider,
      userId: user.id,
      cattleId,
      message: err instanceof Error ? err.message : String(err),
    });
    return error(c, 'Agent failed to respond', 500);
  }
}
