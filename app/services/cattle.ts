import { Cattle, Breed } from '@/types';
import { apiRequest, getStoredToken } from './api-client';

async function tok(): Promise<string | undefined> {
  return (await getStoredToken()) ?? undefined;
}

// userId is accepted for hook compatibility, but the backend derives the
// user from the JWT — no need to pass it in the request.

export async function getAllCattle(_userId: string): Promise<Cattle[]> {
  return apiRequest<Cattle[]>('/api/cattle', { token: await tok() });
}

export async function getCattle(id: string): Promise<Cattle | null> {
  return apiRequest<Cattle>(`/api/cattle/${id}`, { token: await tok() });
}

export async function addCattle(data: {
  name: string;
  breed: Breed;
  age: number;
  weight: number;
  earTag: string;
  imageUrl?: string;
  userId: string;
}): Promise<Cattle> {
  return apiRequest<Cattle>('/api/cattle', {
    method: 'POST',
    token: await tok(),
    body: JSON.stringify({
      name: data.name,
      breed: data.breed,
      age: data.age,
      weight: data.weight,
      earTag: data.earTag,
      ...(data.imageUrl ? { imageUrl: data.imageUrl } : {}),
    }),
  });
}

export async function updateCattle(
  id: string,
  data: Partial<{ name: string; breed: Breed; age: number; weight: number; earTag: string }>,
): Promise<Cattle> {
  return apiRequest<Cattle>(`/api/cattle/${id}`, {
    method: 'PUT',
    token: await tok(),
    body: JSON.stringify(data),
  });
}

export async function deleteCattle(id: string): Promise<void> {
  await apiRequest<{ id: string }>(`/api/cattle/${id}`, {
    method: 'DELETE',
    token: await tok(),
  });
}

export async function searchCattle(_userId: string, query: string): Promise<Cattle[]> {
  return apiRequest<Cattle[]>(`/api/cattle?q=${encodeURIComponent(query)}`, {
    token: await tok(),
  });
}
