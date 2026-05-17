import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

export type Coords = { latitude: number; longitude: number };

const CACHE_KEY = '@cattlecare_location';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 min — weather doesn't change that fast

type Cached = { coords: Coords; at: number };

let inFlight: Promise<Coords | null> | null = null;

async function loadCached(): Promise<Coords | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Cached;
    if (Date.now() - parsed.at > CACHE_TTL_MS) return null;
    return parsed.coords;
  } catch {
    return null;
  }
}

async function saveCached(coords: Coords) {
  await AsyncStorage.setItem(
    CACHE_KEY,
    JSON.stringify({ coords, at: Date.now() } satisfies Cached),
  );
}

async function fetchFresh(): Promise<Coords | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return null;
  const loc = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  const coords: Coords = {
    latitude: loc.coords.latitude,
    longitude: loc.coords.longitude,
  };
  await saveCached(coords);
  return coords;
}

/**
 * Returns the user's GPS coords. Permission is prompted on first call
 * after install (or after the 30-min cache expires). Coords are cached
 * in AsyncStorage so the prompt isn't repeated each app launch.
 *
 * `coords` is null while loading or if permission was denied — callers
 * should treat it as "no location available" and degrade gracefully
 * (e.g. skip environmental stress).
 */
export function useLocation() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const cached = await loadCached();
      if (cached) {
        setCoords(cached);
        setIsLoading(false);
        return;
      }
      inFlight ??= fetchFresh().finally(() => {
        inFlight = null;
      });
      const fresh = await inFlight;
      setCoords(fresh);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { coords, isLoading, error, refresh };
}
