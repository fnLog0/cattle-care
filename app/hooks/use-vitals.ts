import { useState, useEffect, useCallback } from 'react';
import { Vitals } from '@/types';
import * as vitalsService from '@/services/vitals';

export function useVitals(cattleId: string) {
  const [vitals, setVitals] = useState<Vitals[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVitals = useCallback(async () => {
    if (!cattleId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await vitalsService.getVitalsHistory(cattleId);
      setVitals(data);
    } catch {
      setError('Failed to load vitals.');
    } finally {
      setIsLoading(false);
    }
  }, [cattleId]);

  useEffect(() => {
    fetchVitals();
  }, [fetchVitals]);

  const addVitals = useCallback(
    async (data: {
      temperature: number;
      respiratoryRate: number;
      humidity: number;
      heartRate: number;
    }) => {
      const newVitals = await vitalsService.addVitals(cattleId, data);
      setVitals((prev) => [newVitals, ...prev].slice(0, 10));
      return newVitals;
    },
    [cattleId]
  );

  return { vitals, isLoading, error, refresh: fetchVitals, addVitals };
}
