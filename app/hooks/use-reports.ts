import { useState, useEffect, useCallback } from 'react';
import { Cattle, HerdSummary } from '@/types';
import * as reportsService from '@/services/reports';
import { cacheGet, cacheSet } from '@/services/cache';
import { useAuth } from './use-auth';

export function useReports() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<HerdSummary | null>(null);
  const [atRisk, setAtRisk] = useState<Cattle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    if (!user) return;
    setError(null);

    const [cachedSummary, cachedAtRisk] = await Promise.all([
      cacheGet<HerdSummary>('reports_summary'),
      cacheGet<Cattle[]>('reports_atrisk'),
    ]);
    if (cachedSummary) setSummary(cachedSummary);
    if (cachedAtRisk) setAtRisk(cachedAtRisk);
    if (cachedSummary || cachedAtRisk) setIsLoading(false);

    try {
      const [summaryData, atRiskData] = await Promise.all([
        reportsService.getHerdSummary(user.id),
        reportsService.getAtRiskCattle(user.id),
      ]);
      setSummary(summaryData);
      setAtRisk(atRiskData);
      await Promise.all([
        cacheSet('reports_summary', summaryData),
        cacheSet('reports_atrisk', atRiskData),
      ]);
    } catch {
      if (!cachedSummary && !cachedAtRisk) setError('Failed to load reports.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return { summary, atRisk, isLoading, error, refresh: fetchReports };
}
