import { z } from 'zod';
import type { AppContext } from '../../types';
import { getCattleByIdAndUser } from '../../db';
import { getLatestVitalsByCattle } from '../../db/vitals';
import { getDb } from '../../utils/db';
import { success, error } from '../../utils/responses';

const HealthChatSchema = z.object({
  cattleId: z.string().min(1),
  message: z.string().min(1).max(1000),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      }),
    )
    .max(20)
    .optional(),
});

export async function agentHealthHandler(c: AppContext) {
  const user = c.get('user');
  const db = getDb(c);

  const body = await c.req.json().catch(() => null);
  const parsed = HealthChatSchema.safeParse(body);
  if (!parsed.success) {
    return error(c, parsed.error.errors[0]?.message ?? 'Invalid input', 400);
  }

  const { cattleId, message, history = [] } = parsed.data;

  const cattle = await getCattleByIdAndUser(db, cattleId, user.id);
  if (!cattle) return error(c, 'Cattle not found', 404);

  const latestVitals = await getLatestVitalsByCattle(db, cattleId);

  const systemPrompt = `You are CattleCare AI, a veterinary health assistant specializing in cattle monitoring.

Cattle you are monitoring:
- Name: ${cattle.name}
- Breed: ${cattle.breed}
- Age: ${cattle.age} years
- Weight: ${cattle.weight} kg
- Ear Tag: ${cattle.ear_tag}
- Current Stress Level: ${cattle.stress_level}

${
  latestVitals
    ? `Latest Vitals (recorded ${latestVitals.recorded_at}):
- Body Temperature: ${latestVitals.body_temperature}°C (normal: 38.0–39.5°C)
- Respiratory Rate: ${latestVitals.respiratory_rate}/min (normal: 15–30/min)
${latestVitals.heart_rate != null ? `- Heart Rate: ${latestVitals.heart_rate} bpm (normal: 40–80 bpm)\n` : ''}- Ambient Temperature: ${latestVitals.ambient_temperature}°C
- Humidity: ${latestVitals.humidity}%
- Stress Index: ${latestVitals.stress_index.toFixed(1)}/100`
    : 'No vitals recorded yet for this cattle.'
}

Provide concise, practical advice. Always recommend consulting a licensed veterinarian for medical treatment decisions. Keep responses under 200 words unless detail is critical.`;

  const messages = [
    ...history.map((h) => ({ role: h.role, content: h.content })),
    { role: 'user' as const, content: message },
  ];

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': c.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    return error(c, 'AI service unavailable', 500);
  }

  const data = await response.json<{
    content: Array<{ type: string; text: string }>;
  }>();

  const reply = data.content.find((b) => b.type === 'text')?.text ?? '';
  return success(c, { reply });
}
