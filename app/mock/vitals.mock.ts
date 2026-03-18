import { Vitals } from '@/types';
import { getStressLevel } from '@/constants/stress';
import { MOCK_VITALS_HISTORY } from './data';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory vitals history
const vitalsStore: Record<string, Vitals[]> = { ...MOCK_VITALS_HISTORY };

function calcStressIndex(temp: number, respRate: number, heartRate: number): number {
  const raw = (temp - 38.5) * 10 + (respRate - 20) * 2 + (heartRate - 65) * 1.5;
  return Math.min(100, Math.max(0, raw));
}

export async function addVitals(
  cattleId: string,
  data: {
    temperature: number;
    respiratoryRate: number;
    humidity: number;
    heartRate: number;
  }
): Promise<Vitals> {
  await delay(500);

  const stressIndex = calcStressIndex(data.temperature, data.respiratoryRate, data.heartRate);
  const vitals: Vitals = {
    id: `v-${Date.now()}`,
    cattleId,
    temperature: data.temperature,
    respiratoryRate: data.respiratoryRate,
    humidity: data.humidity,
    heartRate: data.heartRate,
    stressIndex,
    stressLevel: getStressLevel(stressIndex),
    recordedAt: new Date().toISOString(),
  };

  if (!vitalsStore[cattleId]) {
    vitalsStore[cattleId] = [];
  }
  // Keep last 10 readings
  vitalsStore[cattleId] = [vitals, ...vitalsStore[cattleId]].slice(0, 10);

  return vitals;
}

export async function getVitalsHistory(cattleId: string): Promise<Vitals[]> {
  await delay(400);
  return vitalsStore[cattleId] ?? [];
}
