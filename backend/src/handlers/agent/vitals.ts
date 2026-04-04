import { z } from 'zod';
import type { AppContext } from '../../types';
import { getCattleByIdAndUser } from '../../db';
import { getDb } from '../../utils/db';
import { success, error } from '../../utils/responses';

const VitalsChatSchema = z.object({
  cattleId: z.string().min(1),
  message: z.string().min(1).max(500),
  history: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() }))
    .max(20)
    .optional(),
  environmental: z.object({
    ambientTemperature: z.number(),
    humidity: z.number(),
    location: z.string().optional(),
  }),
});

const SYSTEM_PROMPT = `You are a cattle vitals recording assistant for the CattleCare app.

Ambient temperature and humidity have already been auto-fetched from the farmer's location via weather API. You need to collect:

1. Body temperature of the cattle (°C) — REQUIRED. Normal range: 38.0–39.5°C
2. Respiratory rate (breaths per minute) — REQUIRED. Normal range: 15–30
3. Heart rate (beats per minute) — OPTIONAL. Ask after getting the first two, but accept if farmer says they don't have it or skips it.

Rules:
- Ask for one value at a time, starting with body temperature
- Validate required fields: body temp 30–45°C, respiratory rate 5–60
- If heart rate is skipped or unavailable, use null
- Be brief and farmer-friendly
- Once required fields are collected (heart rate confirmed or skipped), respond ONLY with this JSON on the last line:
  VITALS_COMPLETE:{"bodyTemperature":0,"respiratoryRate":0,"heartRate":null}
- Keep responses under 60 words`;

export async function agentVitalsHandler(c: AppContext) {
  const user = c.get('user');
  const db = getDb(c);

  const body = await c.req.json().catch(() => null);
  const parsed = VitalsChatSchema.safeParse(body);
  if (!parsed.success) {
    return error(c, parsed.error.errors[0]?.message ?? 'Invalid input', 400);
  }

  const { cattleId, message, history = [], environmental } = parsed.data;

  const cattle = await getCattleByIdAndUser(db, cattleId, user.id);
  if (!cattle) return error(c, 'Cattle not found', 404);

  const systemPrompt =
    SYSTEM_PROMPT +
    `\n\nContext:\n- Cattle: ${cattle.name} (${cattle.ear_tag})\n` +
    `- Auto-fetched ambient temperature: ${environmental.ambientTemperature}°C\n` +
    `- Auto-fetched humidity: ${environmental.humidity}%` +
    (environmental.location ? `\n- Location: ${environmental.location}` : '');

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
      max_tokens: 256,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) return error(c, 'AI service unavailable', 500);

  const data = await response.json<{ content: Array<{ type: string; text: string }> }>();
  const reply = data.content.find((b) => b.type === 'text')?.text ?? '';

  const match = reply.match(/VITALS_COMPLETE:(\{.*\})/);
  if (match?.[1]) {
    try {
      const collected = JSON.parse(match[1]) as {
        bodyTemperature: number;
        respiratoryRate: number;
        heartRate: number | null;
      };
      const displayReply = reply.replace(/VITALS_COMPLETE:\{.*\}/, '').trim();
      return success(c, {
        reply: displayReply || 'Got it! Saving vitals now...',
        isComplete: true,
        vitalsData: {
          bodyTemperature: collected.bodyTemperature,
          respiratoryRate: collected.respiratoryRate,
          heartRate: collected.heartRate,
          ambientTemperature: environmental.ambientTemperature,
          humidity: environmental.humidity,
        },
      });
    } catch {
      // fall through
    }
  }

  return success(c, { reply, isComplete: false, vitalsData: null });
}
