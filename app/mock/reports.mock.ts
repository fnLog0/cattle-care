import { Cattle, HerdSummary, StressLevel } from '@/types';
import { getAllCattle } from './cattle.mock';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getHerdSummary(userId: string): Promise<HerdSummary> {
  await delay(500);
  const cattle = await getAllCattle(userId);

  const stressDistribution: Record<StressLevel, number> = {
    none: 0,
    mild: 0,
    moderate: 0,
    severe: 0,
    danger: 0,
  };

  for (const c of cattle) {
    stressDistribution[c.stressLevel]++;
  }

  return {
    totalCattle: cattle.length,
    stressDistribution,
  };
}

export async function getAtRiskCattle(userId: string): Promise<Cattle[]> {
  await delay(400);
  const cattle = await getAllCattle(userId);
  const atRisk = cattle.filter((c) =>
    ['moderate', 'severe', 'danger'].includes(c.stressLevel)
  );

  // Sort by severity: danger first, then severe, then moderate
  const order: Record<string, number> = { danger: 0, severe: 1, moderate: 2 };
  return atRisk.sort((a, b) => (order[a.stressLevel] ?? 3) - (order[b.stressLevel] ?? 3));
}
