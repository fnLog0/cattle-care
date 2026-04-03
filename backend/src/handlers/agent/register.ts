import { z } from 'zod';
import type { AppContext } from '../../types';
import { success, error } from '../../utils/responses';

const RegisterChatSchema = z.object({
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
  collected: z
    .object({
      name: z.string().optional(),
      breed: z.string().optional(),
      age: z.number().optional(),
      weight: z.number().optional(),
      earTag: z.string().optional(),
    })
    .optional(),
});

const SYSTEM_PROMPT = `You are a cattle registration assistant for the CattleCare app.

Your job is to conversationally collect the following details to register a new cattle:
1. Name (any string)
2. Breed (must be one of: zebu, crossBreed, murrah)
3. Age in years (number, 0–30)
4. Weight in kg (number, 50–1000)
5. Ear tag (alphanumeric string, e.g. ET-011)

Rules:
- Ask for one field at a time
- Validate each answer before moving on
- Be friendly and concise
- When all fields are collected, summarize and ask for confirmation
- Once the user confirms, respond ONLY with this exact JSON on the last line:
  REGISTRATION_COMPLETE:{"name":"...","breed":"...","age":0,"weight":0,"earTag":"..."}
- Keep responses under 100 words`;

export async function agentRegisterHandler(c: AppContext) {
  const body = await c.req.json().catch(() => null);
  const parsed = RegisterChatSchema.safeParse(body);
  if (!parsed.success) {
    return error(c, parsed.error.errors[0]?.message ?? 'Invalid input', 400);
  }

  const { message, history = [] } = parsed.data;

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
      system: SYSTEM_PROMPT,
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

  // Check if registration is complete
  const match = reply.match(/REGISTRATION_COMPLETE:(\{.*\})/);
  if (match?.[1]) {
    try {
      const cattleData = JSON.parse(match[1]);
      const displayReply = reply.replace(/REGISTRATION_COMPLETE:\{.*\}/, '').trim();
      return success(c, { reply: displayReply || 'Registration confirmed!', isComplete: true, cattleData });
    } catch {
      // fall through
    }
  }

  return success(c, { reply, isComplete: false, cattleData: null });
}
