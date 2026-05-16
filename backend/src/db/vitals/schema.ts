import { z } from 'zod';

export const VitalsRowSchema = z.object({
  id: z.string(),
  cattle_id: z.string(),
  rectal_temperature: z.number(),
  respiration_rate: z.number(),
  strain_index: z.number(),
  stress_level: z.enum(['none', 'mild', 'moderate', 'severe', 'danger']),
  recorded_at: z.string(),
});

export type VitalsRow = z.infer<typeof VitalsRowSchema>;
export type StressLevel = VitalsRow['stress_level'];
