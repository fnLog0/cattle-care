import { useCallback, useEffect, useState } from 'react';
import {
  getEnvironmentalStress,
  type EnvironmentalStress,
} from '@/services/environmental';
import type { Coords } from './use-location';

export function useEnvironmentalStress(coords: Coords | null) {
  const [data, setData] = useState<EnvironmentalStress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!coords) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await getEnvironmentalStress(coords.latitude, coords.longitude);
      setData(res);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [coords]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, isLoading, error, refresh };
}
