import { z } from 'zod';
import type { AppContext } from '../../types';
import { success, error } from '../../utils/responses';
import { getEnvironmentalStress } from '../../services/thi';

const schema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export async function environmentalStressHandler(c: AppContext) {
  const query = c.req.query();
  const parsed = schema.safeParse({
    latitude: Number(query.latitude),
    longitude: Number(query.longitude),
  });

  if (!parsed.success) {
    return error(c, parsed.error.errors[0]?.message ?? 'Provide valid latitude and longitude', 400);
  }

  try {
    const result = await getEnvironmentalStress(parsed.data.latitude, parsed.data.longitude);
    return success(c, result);
  } catch (err) {
    console.error('environmentalStress: weather fetch failed', {
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      message: err instanceof Error ? err.message : String(err),
    });
    return error(c, 'Failed to fetch weather data', 502);
  }
}
