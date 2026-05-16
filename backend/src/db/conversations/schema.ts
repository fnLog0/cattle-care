import { z } from 'zod';

export const ConversationRowSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  cattle_id: z.string(),
  agent_type: z.literal('health'),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ConversationRow = z.infer<typeof ConversationRowSchema>;
