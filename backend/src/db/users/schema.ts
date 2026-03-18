import { z } from 'zod';

export const UserRowSchema = z.object({
  id: z.string(),
  phone: z.string().nullable(),
  google_id: z.string().nullable(),
  email: z.string().nullable(),
  full_name: z.string().nullable(),
  profile_image: z.string().nullable(),
  status: z.enum(['active', 'notActive', 'banned']),
  phone_verified: z.number().int(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type UserRow = z.infer<typeof UserRowSchema>;
