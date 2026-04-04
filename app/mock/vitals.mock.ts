import { Vitals } from '@/types';
import { getStressLevel } from '@/constants/stress';
import { MOCK_VITALS_HISTORY } from './data';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const vitalsStore: Record<string, Vitals[]> = { ...MOCK_VITALS_HISTORY };

function calcStressIndex(bodyTemp: number, respRate: number, heartRate: number): number {
  const raw = (bodyTemp - 38.5) * 10 + (respRate - 20) * 2 + (heartRate - 65) * 1.5;
  return Math.min(100, Math.max(0, raw));
}

export async function addVitals(
  cattleId: string,
  data: {
    bodyTemperature: number;
    respiratoryRate: number;
    heartRate?: number | null;
    ambientTemperature: number;
    humidity: number;
  }
): Promise<Vitals> {
  await delay(500);

  const hr = data.heartRate ?? 65;
  const stressIndex = calcStressIndex(data.bodyTemperature, data.respiratoryRate, hr);
  const vitals: Vitals = {
    id: `v-${Date.now()}`,
    cattleId,
    bodyTemperature: data.bodyTemperature,
    respiratoryRate: data.respiratoryRate,
    heartRate: data.heartRate ?? null,
    ambientTemperature: data.ambientTemperature,
    humidity: data.humidity,
    stressIndex,
    stressLevel: getStressLevel(stressIndex),
    recordedAt: new Date().toISOString(),
  };

  if (!vitalsStore[cattleId]) vitalsStore[cattleId] = [];
  vitalsStore[cattleId] = [vitals, ...vitalsStore[cattleId]].slice(0, 10);
  return vitals;
}

export async function getVitalsHistory(cattleId: string): Promise<Vitals[]> {
  await delay(400);
  return vitalsStore[cattleId] ?? [];
}
