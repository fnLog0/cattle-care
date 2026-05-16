import { z } from 'zod';

export const MessageRowSchema = z.object({
  id: z.string(),
  conversation_id: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  created_at: z.string(),
});

export type MessageRow = z.infer<typeof MessageRowSchema>;
export type MessageRole = MessageRow['role'];
