import { useState, useEffect, useCallback } from 'react';
import { Cattle, HerdSummary } from '@/types';
import * as reportsService from '@/services/reports';
import { useAuth } from './use-auth';

export function useReports() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<HerdSummary | null>(null);
  const [atRisk, setAtRisk] = useState<Cattle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const [summaryData, atRiskData] = await Promise.all([
        reportsService.getHerdSummary(user.id),
        reportsService.getAtRiskCattle(user.id),
      ]);
      setSummary(summaryData);
      setAtRisk(atRiskData);
    } catch {
      setError('Failed to load reports.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return { summary, atRisk, isLoading, error, refresh: fetchReports };
}
