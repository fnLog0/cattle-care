import { Cattle, Breed, StressLevel } from '@/types';
import { MOCK_CATTLE } from './data';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory array — starts with mock data
let cattleStore: Cattle[] = [...MOCK_CATTLE];

export async function getAllCattle(userId: string): Promise<Cattle[]> {
  await delay(500);
  return cattleStore.filter((c) => c.userId === userId);
}

export async function getCattle(id: string): Promise<Cattle | null> {
  await delay(400);
  return cattleStore.find((c) => c.id === id) ?? null;
}

export async function addCattle(data: {
  name: string;
  breed: Breed;
  age: number;
  weight: number;
  earTag: string;
  userId: string;
}): Promise<Cattle> {
  await delay(600);
  const newCattle: Cattle = {
    id: `c-${Date.now()}`,
    name: data.name,
    breed: data.breed,
    age: data.age,
    weight: data.weight,
    earTag: data.earTag,
    stressLevel: 'none' as StressLevel,
    userId: data.userId,
    createdAt: new Date().toISOString(),
  };
  cattleStore.push(newCattle);
  return newCattle;
}

export async function updateCattle(
  id: string,
  data: Partial<Omit<Cattle, 'id' | 'userId' | 'createdAt'>>
): Promise<Cattle> {
  await delay(400);
  const idx = cattleStore.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error('Cattle not found');
  cattleStore[idx] = { ...cattleStore[idx], ...data };
  return cattleStore[idx];
}

export async function deleteCattle(id: string): Promise<void> {
  await delay(400);
  cattleStore = cattleStore.filter((c) => c.id !== id);
}

export async function searchCattle(userId: string, query: string): Promise<Cattle[]> {
  await delay(300);
  const q = query.toLowerCase();
  return cattleStore.filter(
    (c) =>
      c.userId === userId &&
      (c.name.toLowerCase().includes(q) || c.earTag.toLowerCase().includes(q))
  );
}
