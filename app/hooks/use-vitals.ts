import { useState, useEffect, useCallback } from 'react';
import { Vitals } from '@/types';
import * as vitalsService from '@/services/vitals';
import { cacheGet, cacheSet } from '@/services/cache';
import { useNetwork } from '@/context/network-context';

export function useVitals(cattleId: string) {
  const { isOnline, queueMutation } = useNetwork();
  const [vitals, setVitals] = useState<Vitals[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVitals = useCallback(async () => {
    if (!cattleId) return;
    setError(null);

    const cached = await cacheGet<Vitals[]>(`vitals_${cattleId}`);
    if (cached) {
      setVitals(cached);
      setIsLoading(false);
    }

    try {
      const data = await vitalsService.getVitalsHistory(cattleId);
      setVitals(data);
      await cacheSet(`vitals_${cattleId}`, data);
    } catch {
      if (!cached) setError('Failed to load vitals.');
    } finally {
      setIsLoading(false);
    }
  }, [cattleId]);

  useEffect(() => {
    fetchVitals();
  }, [fetchVitals]);

  const addVitals = useCallback(
    async (data: {
      bodyTemperature: number;
      respiratoryRate: number;
      heartRate?: number | null;
      ambientTemperature: number;
      humidity: number;
    }) => {
      if (!isOnline) {
        await queueMutation({
          id: Date.now().toString(),
          type: 'ADD_VITALS',
          cattleId,
          data,
        });
        // Return a placeholder so the caller doesn't crash
        return {
          id: `pending_${Date.now()}`,
          cattleId,
          bodyTemperature: data.bodyTemperature,
          respiratoryRate: data.respiratoryRate,
          heartRate: data.heartRate ?? null,
          ambientTemperature: data.ambientTemperature,
          humidity: data.humidity,
          stressIndex: 0,
          stressLevel: 'none' as const,
          recordedAt: new Date().toISOString(),
        };
      }

      const newVitals = await vitalsService.addVitals(cattleId, data);
      setVitals((prev) => {
        const updated = [newVitals, ...prev].slice(0, 10);
        cacheSet(`vitals_${cattleId}`, updated);
        return updated;
      });
      return newVitals;
    },
    [cattleId, isOnline, queueMutation],
  );

  return { vitals, isLoading, error, refresh: fetchVitals, addVitals };
}
