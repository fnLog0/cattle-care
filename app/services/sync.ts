import AsyncStorage from '@react-native-async-storage/async-storage';
import * as vitalsService from './vitals';

const QUEUE_KEY = '@cc_sync_queue';

export type PendingMutation = {
  id: string;
  type: 'ADD_VITALS';
  cattleId: string;
  data: {
    bodyTemperature: number;
    respiratoryRate: number;
    heartRate?: number | null;
    ambientTemperature: number;
    humidity: number;
  };
};

export async function getQueue(): Promise<PendingMutation[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as PendingMutation[]) : [];
  } catch {
    return [];
  }
}

export async function enqueue(mutation: PendingMutation): Promise<void> {
  const queue = await getQueue();
  queue.push(mutation);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

async function dequeue(id: string): Promise<void> {
  const queue = await getQueue();
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue.filter((m) => m.id !== id)));
}

// Returns number of successfully synced mutations
export async function processQueue(): Promise<number> {
  const queue = await getQueue();
  let synced = 0;
  for (const mutation of queue) {
    try {
      if (mutation.type === 'ADD_VITALS') {
        await vitalsService.addVitals(mutation.cattleId, mutation.data);
      }
      await dequeue(mutation.id);
      synced++;
    } catch {
      // Keep in queue — retry on next reconnect
    }
  }
  return synced;
}
