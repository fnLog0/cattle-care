import { z } from 'zod';

export const CattleRowSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string(),
  breed: z.enum(['zebu', 'crossBreed', 'murrah']),
  age: z.number(),
  weight: z.number(),
  ear_tag: z.string(),
  image_url: z.string().nullable(),
  stress_level: z.enum(['none', 'mild', 'moderate', 'severe', 'danger']),
  created_at: z.string(),
  updated_at: z.string(),
});

export type CattleRow = z.infer<typeof CattleRowSchema>;
