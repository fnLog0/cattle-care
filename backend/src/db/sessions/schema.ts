import { z } from 'zod';

export const SessionRowSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  token: z.string(),
  created_at: z.string(),
  expires_at: z.string(),
});

export type SessionRow = z.infer<typeof SessionRowSchema>;
