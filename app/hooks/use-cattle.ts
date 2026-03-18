import { useState, useEffect, useCallback } from 'react';
import { Cattle } from '@/types';
import { StressLevel } from '@/types';
import * as cattleService from '@/services/cattle';
import { useAuth } from './use-auth';

const STRESS_ORDER: Record<StressLevel, number> = {
  danger: 0,
  severe: 1,
  moderate: 2,
  mild: 3,
  none: 4,
};

export function useCattle() {
  const { user } = useAuth();
  const [cattle, setCattle] = useState<Cattle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCattle = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await cattleService.getAllCattle(user.id);
      // Sort by stress severity: danger first
      const sorted = [...data].sort(
        (a, b) => (STRESS_ORDER[a.stressLevel] ?? 5) - (STRESS_ORDER[b.stressLevel] ?? 5)
      );
      setCattle(sorted);
    } catch (e) {
      setError('Failed to load cattle. Please try again.');
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
      if (!query.trim()) {
        fetchCattle();
        return;
      }
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
    [user, fetchCattle]
  );

  const deleteCattle = useCallback(
    async (id: string) => {
      await cattleService.deleteCattle(id);
      setCattle((prev) => prev.filter((c) => c.id !== id));
    },
    []
  );

  return { cattle, isLoading, error, refresh: fetchCattle, search, deleteCattle };
}

export function useCattleDetail(id: string) {
  const [cattle, setCattle] = useState<Cattle | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCattle = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await cattleService.getCattle(id);
      setCattle(data);
    } catch {
      setError('Failed to load cattle details.');
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
