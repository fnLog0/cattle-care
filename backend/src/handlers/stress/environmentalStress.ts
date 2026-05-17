import { z } from 'zod';
import type { AppContext } from '../../types';
import { success, error } from '../../utils/responses';
import { getEnvironmentalStress, getEnvironmentalForecast } from '../../services/thi';

const schema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  hours: z.number().int().min(1).max(48).optional(),
});

export async function environmentalStressHandler(c: AppContext) {
  const query = c.req.query();
  const parsed = schema.safeParse({
    latitude: Number(query.latitude),
    longitude: Number(query.longitude),
    hours: query.hours !== undefined ? Number(query.hours) : undefined,
  });

  if (!parsed.success) {
    return error(c, parsed.error.errors[0]?.message ?? 'Provide valid latitude and longitude', 400);
  }

  const { latitude, longitude, hours } = parsed.data;

  try {
    if (hours !== undefined) {
      const [current, forecast] = await Promise.all([
        getEnvironmentalStress(latitude, longitude),
        getEnvironmentalForecast(latitude, longitude, hours),
      ]);
      return success(c, { ...current, hourly: forecast });
    }

    const result = await getEnvironmentalStress(latitude, longitude);
    return success(c, result);
  } catch (err) {
    console.error('environmentalStress: weather fetch failed', {
      latitude,
      longitude,
      hours,
      message: err instanceof Error ? err.message : String(err),
    });
    return error(c, 'Failed to fetch weather data', 502);
  }
}
