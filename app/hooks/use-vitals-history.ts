import { useCallback, useEffect, useState } from 'react';
import { getVitalsHistory, type VitalsHistory, type VitalsRange } from '@/services/vitals';

export function useVitalsHistory(cattleId: string | undefined, range: VitalsRange = '30d') {
  const [history, setHistory] = useState<VitalsHistory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!cattleId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getVitalsHistory(cattleId, range);
      setHistory(data);
    } catch (e) {
      setError((e as Error).message ?? 'Failed to load vitals history');
    } finally {
      setIsLoading(false);
    }
  }, [cattleId, range]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { history, isLoading, error, refresh };
}
