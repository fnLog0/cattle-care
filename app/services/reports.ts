import { Cattle, HerdSummary } from '@/types';
import { apiRequest, getStoredToken } from './api-client';

async function tok(): Promise<string | undefined> {
  return (await getStoredToken()) ?? undefined;
}

// userId is accepted for hook compatibility, but the backend derives the
// user from the JWT — no need to pass it in the request.

export async function getHerdSummary(_userId: string): Promise<HerdSummary> {
  return apiRequest<HerdSummary>('/api/reports/summary', { token: await tok() });
}

export async function getAtRiskCattle(_userId: string): Promise<Cattle[]> {
  return apiRequest<Cattle[]>('/api/reports/at-risk', { token: await tok() });
}
