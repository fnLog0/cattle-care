/**
 * Environmental Stress Service
 * Based on Temperature-Humidity Index (THI) — NRC 1971
 *
 * Formula: THI = (1.8 * T + 32) - (0.55 - 0.0055 * RH) * (1.8 * T - 26)
 *
 * Where:
 *   T  = Dry bulb temperature in °C
 *   RH = Relative humidity in %
 *
 * Stress classification:
 *   THI < 72       → none
 *   72 <= THI < 79 → mild
 *   79 <= THI < 89 → moderate
 *   89 <= THI < 99 → severe
 *   THI >= 99      → danger
 */

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';
const WEATHER_CACHE_TTL_SECONDS = 600; // 10 min
const COORD_PRECISION = 2; // ~1.1 km — granular enough for THI, raises cache hit rate

export type StressLevel = 'none' | 'mild' | 'moderate' | 'severe' | 'danger';

export type THIResult = {
  thi: number;
  stressLevel: StressLevel;
  temperature: number;
  humidity: number;
  latitude: number;
  longitude: number;
  timestamp: string;
};

export function calculateTHI(temperature: number, humidity: number): number {
  return (1.8 * temperature + 32) - (0.55 - 0.0055 * humidity) * (1.8 * temperature - 26);
}

export function classifyStress(thi: number): StressLevel {
  if (thi < 72) return 'none';
  if (thi < 79) return 'mild';
  if (thi < 89) return 'moderate';
  if (thi < 99) return 'severe';
  return 'danger';
}

function roundCoord(value: number): number {
  const factor = 10 ** COORD_PRECISION;
  return Math.round(value * factor) / factor;
}

export async function fetchWeather(
  latitude: number,
  longitude: number,
): Promise<{ temperature: number; humidity: number }> {
  const lat = roundCoord(latitude);
  const lon = roundCoord(longitude);
  const url = `${OPEN_METEO_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m`;
  const cacheKey = new Request(url);
  const cache = caches.default;

  let res = await cache.match(cacheKey);
  if (!res) {
    const upstream = await fetch(url);
    if (!upstream.ok) {
      throw new Error(`Weather API failed: ${upstream.status} ${upstream.statusText}`);
    }
    res = new Response(upstream.body, upstream);
    res.headers.set('Cache-Control', `public, s-maxage=${WEATHER_CACHE_TTL_SECONDS}`);
    await cache.put(cacheKey, res.clone());
  }

  const data = await res.json<{
    current: {
      temperature_2m: number;
      relative_humidity_2m: number;
    };
  }>();

  return {
    temperature: data.current.temperature_2m,
    humidity: data.current.relative_humidity_2m,
  };
}

export async function getEnvironmentalStress(
  latitude: number,
  longitude: number,
): Promise<THIResult> {
  const { temperature, humidity } = await fetchWeather(latitude, longitude);
  const thi = calculateTHI(temperature, humidity);
  const stressLevel = classifyStress(thi);

  return {
    thi: Math.round(thi * 100) / 100,
    stressLevel,
    temperature,
    humidity,
    latitude,
    longitude,
    timestamp: new Date().toISOString(),
  };
}

export type ForecastHour = {
  time: string;
  temperature: number;
  humidity: number;
  thi: number;
  stressLevel: StressLevel;
};

const MAX_FORECAST_HOURS = 48;

/**
 * Fetch hourly forecast (up to MAX_FORECAST_HOURS) and compute THI per hour.
 * Cached separately from the "current" call so the smaller payload above
 * stays cheap.
 */
export async function getEnvironmentalForecast(
  latitude: number,
  longitude: number,
  hours: number,
): Promise<ForecastHour[]> {
  const clamped = Math.max(1, Math.min(MAX_FORECAST_HOURS, hours));
  const lat = roundCoord(latitude);
  const lon = roundCoord(longitude);
  const url = `${OPEN_METEO_URL}?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m&forecast_hours=${clamped}`;
  const cacheKey = new Request(url);
  const cache = caches.default;

  let res = await cache.match(cacheKey);
  if (!res) {
    const upstream = await fetch(url);
    if (!upstream.ok) {
      throw new Error(`Weather API failed: ${upstream.status} ${upstream.statusText}`);
    }
    res = new Response(upstream.body, upstream);
    res.headers.set('Cache-Control', `public, s-maxage=${WEATHER_CACHE_TTL_SECONDS}`);
    await cache.put(cacheKey, res.clone());
  }

  const data = await res.json<{
    hourly: {
      time: string[];
      temperature_2m: number[];
      relative_humidity_2m: number[];
    };
  }>();

  const { time, temperature_2m, relative_humidity_2m } = data.hourly;
  const out: ForecastHour[] = [];
  for (let i = 0; i < time.length && i < clamped; i++) {
    const t = temperature_2m[i]!;
    const h = relative_humidity_2m[i]!;
    const thi = calculateTHI(t, h);
    out.push({
      time: time[i]!,
      temperature: t,
      humidity: h,
      thi: Math.round(thi * 100) / 100,
      stressLevel: classifyStress(thi),
    });
  }
  return out;
}
