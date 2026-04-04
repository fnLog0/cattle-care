import { useState, useEffect, useCallback } from 'react';
import { Cattle } from '@/types';
import { StressLevel } from '@/types';
import * as cattleService from '@/services/cattle';
import { cacheGet, cacheSet } from '@/services/cache';
import { useAuth } from './use-auth';

const STRESS_ORDER: Record<StressLevel, number> = {
  danger: 0,
  severe: 1,
  moderate: 2,
  mild: 3,
  none: 4,
};

function sortByStress(data: Cattle[]): Cattle[] {
  return [...data].sort(
    (a, b) => (STRESS_ORDER[a.stressLevel] ?? 5) - (STRESS_ORDER[b.stressLevel] ?? 5),
  );
}

export function useCattle() {
  const { user } = useAuth();
  const [cattle, setCattle] = useState<Cattle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCattle = useCallback(async () => {
    if (!user) return;
    setError(null);

    // Show cached data immediately — no loading flicker
    const cached = await cacheGet<Cattle[]>('cattle_list');
    if (cached) {
      setCattle(sortByStress(cached));
      setIsLoading(false);
    }

    try {
      const data = await cattleService.getAllCattle(user.id);
      setCattle(sortByStress(data));
      await cacheSet('cattle_list', data);
    } catch {
      if (!cached) setError('Failed to load cattle. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCattle();
  }, [fetchCattle]);

  const search = useCallback(
    async (query: string) => {
      if (!user) return;
      if (!query.trim()) { fetchCattle(); return; }
      setIsLoading(true);
      try {
        const data = await cattleService.searchCattle(user.id, query);
        setCattle(data);
      } catch {
        setError('Search failed.');
      } finally {
        setIsLoading(false);
      }
    },
    [user, fetchCattle],
  );

  const deleteCattle = useCallback(async (id: string) => {
    await cattleService.deleteCattle(id);
    setCattle((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      cacheSet('cattle_list', updated);
      return updated;
    });
  }, []);

  return { cattle, isLoading, error, refresh: fetchCattle, search, deleteCattle };
}

export function useCattleDetail(id: string) {
  const [cattle, setCattle] = useState<Cattle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCattle = useCallback(async () => {
    setError(null);

    const cached = await cacheGet<Cattle>(`cattle_${id}`);
    if (cached) {
      setCattle(cached);
      setIsLoading(false);
    }

    try {
      const data = await cattleService.getCattle(id);
      setCattle(data);
      if (data) await cacheSet(`cattle_${id}`, data);
    } catch {
      if (!cached) setError('Failed to load cattle details.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCattle();
  }, [fetchCattle]);

  const deleteCattle = useCallback(async () => {
    await cattleService.deleteCattle(id);
  }, [id]);

  return { cattle, isLoading, error, refresh: fetchCattle, deleteCattle };
}
