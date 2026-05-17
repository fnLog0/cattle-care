import { apiRequest, getStoredToken } from './api-client';

export type EnvironmentalStressLevel = 'none' | 'mild' | 'moderate' | 'severe' | 'danger';

export type EnvironmentalStress = {
  thi: number;
  stressLevel: EnvironmentalStressLevel;
  temperature: number;
  humidity: number;
  latitude: number;
  longitude: number;
  timestamp: string;
};

export async function getEnvironmentalStress(
  latitude: number,
  longitude: number,
): Promise<EnvironmentalStress> {
  const token = (await getStoredToken()) ?? undefined;
  const q = `latitude=${latitude}&longitude=${longitude}`;
  return apiRequest<EnvironmentalStress>(`/api/stress/environmental?${q}`, { token });
}

export type ForecastHour = {
  time: string;
  temperature: number;
  humidity: number;
  thi: number;
  stressLevel: EnvironmentalStressLevel;
};

export type EnvironmentalStressWithForecast = EnvironmentalStress & {
  hourly: ForecastHour[];
};

export async function getEnvironmentalForecast(
  latitude: number,
  longitude: number,
  hours = 24,
): Promise<EnvironmentalStressWithForecast> {
  const token = (await getStoredToken()) ?? undefined;
  const q = `latitude=${latitude}&longitude=${longitude}&hours=${hours}`;
  return apiRequest<EnvironmentalStressWithForecast>(
    `/api/stress/environmental?${q}`,
    { token },
  );
}
