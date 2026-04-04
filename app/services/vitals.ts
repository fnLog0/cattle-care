import { Vitals } from '@/types';
import { apiRequest, getStoredToken } from './api-client';

async function tok(): Promise<string | undefined> {
  return (await getStoredToken()) ?? undefined;
}

export async function getVitalsHistory(cattleId: string): Promise<Vitals[]> {
  return apiRequest<Vitals[]>(`/api/cattle/${cattleId}/vitals`, { token: await tok() });
}

export async function addVitals(
  cattleId: string,
  data: {
    bodyTemperature: number;
    respiratoryRate: number;
    heartRate?: number | null;
    ambientTemperature: number;
    humidity: number;
  },
): Promise<Vitals> {
  return apiRequest<Vitals>(`/api/cattle/${cattleId}/vitals`, {
    method: 'POST',
    token: await tok(),
    body: JSON.stringify(data),
  });
}
