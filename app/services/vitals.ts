import { apiRequest, getStoredToken } from './api-client';

export type VitalsRange = '7d' | '30d' | '90d';
export type StressLevel = 'none' | 'mild' | 'moderate' | 'severe' | 'danger';

export type VitalsReading = {
  id: string;
  rectalTemperature: number;
  respirationRate: number;
  strainIndex: number;
  stressLevel: StressLevel;
  recordedAt: string;
};

export type VitalsHistory = {
  cattleId: string;
  range: VitalsRange;
  count: number;
  readings: VitalsReading[];
};

export async function getVitalsHistory(
  cattleId: string,
  range: VitalsRange = '30d',
): Promise<VitalsHistory> {
  const token = (await getStoredToken()) ?? undefined;
  return apiRequest<VitalsHistory>(
    `/api/stress/cattle/${cattleId}/history?range=${range}`,
    { token },
  );
}

export async function recordStress(
  cattleId: string,
  data: { rectalTemperature: number; respirationRate: number },
): Promise<{
  cattleId: string;
  cattleName: string;
  breed: string;
  strainIndex: number;
  stressLevel: StressLevel;
  temperatureComponent: number;
  respirationComponent: number;
  timestamp: string;
}> {
  const token = (await getStoredToken()) ?? undefined;
  return apiRequest(`/api/stress/cattle/${cattleId}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(data),
  });
}
