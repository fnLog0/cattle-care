import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8787';
const TOKEN_KEY = '@cattlecare_token';

export async function getStoredToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setStoredToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearStoredToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function apiRequest<T>(
  path: string,
  options?: RequestInit & { token?: string },
): Promise<T> {
  const { token, ...fetchOptions } = options ?? {};

  const res = await fetch(`${BASE_URL}${path}`, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(fetchOptions.headers ?? {}),
    },
  });

  const json = await res.json() as { success: boolean; data?: T; error?: string };
  if (!res.ok || !json.success) throw new Error(json.error ?? 'Request failed');
  return json.data as T;
}
