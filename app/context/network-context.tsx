import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { enqueue, getQueue, processQueue, PendingMutation } from '@/services/sync';

type NetworkContextType = {
  isOnline: boolean;
  pendingCount: number;
  queueMutation: (mutation: PendingMutation) => Promise<void>;
  syncNow: () => Promise<void>;
};

const NetworkContext = createContext<NetworkContextType>({
  isOnline: true,
  pendingCount: 0,
  queueMutation: async () => {},
  syncNow: async () => {},
});

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const isOnlineRef = useRef(true);

  const refreshPendingCount = useCallback(async () => {
    const queue = await getQueue();
    setPendingCount(queue.length);
  }, []);

  const syncNow = useCallback(async () => {
    if (!isOnlineRef.current) return;
    await processQueue();
    await refreshPendingCount();
  }, [refreshPendingCount]);

  const queueMutation = useCallback(async (mutation: PendingMutation) => {
    await enqueue(mutation);
    setPendingCount((prev) => prev + 1);
  }, []);

  useEffect(() => {
    refreshPendingCount();

    const unsubscribe = NetInfo.addEventListener(async (state) => {
      const online = state.isConnected === true && state.isInternetReachable !== false;
      isOnlineRef.current = online;
      setIsOnline(online);

      if (online) {
        const synced = await processQueue();
        if (synced > 0) await refreshPendingCount();
      }
    });

    return unsubscribe;
  }, [refreshPendingCount]);

  return (
    <NetworkContext.Provider value={{ isOnline, pendingCount, queueMutation, syncNow }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  return useContext(NetworkContext);
}
