import { z } from 'zod';

export const VitalsRowSchema = z.object({
  id: z.string(),
  cattle_id: z.string(),
  temperature: z.number(),
  respiratory_rate: z.number(),
  humidity: z.number(),
  heart_rate: z.number(),
  stress_index: z.number(),
  stress_level: z.enum(['none', 'mild', 'moderate', 'severe', 'danger']),
  recorded_at: z.string(),
});

export type VitalsRow = z.infer<typeof VitalsRowSchema>;
