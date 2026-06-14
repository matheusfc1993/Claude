import { useState, useEffect, useCallback } from 'react';
import SyncManager from '@/services/sync-manager';

let syncManager: SyncManager | null = null;

function getSyncManager(): SyncManager {
  if (!syncManager) {
    syncManager = new SyncManager({ apiBaseUrl: '' });
  }
  return syncManager;
}

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const manager = getSyncManager();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      manager.syncPending();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Subscribe to pending count changes
    const unsubscribe = manager.subscribe((count) => {
      setPendingCount(count);
    });

    // Get initial pending count
    const initPendingCount = async () => {
      const count = await manager.getPendingCount();
      setPendingCount(count);
    };
    initPendingCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, [manager]);

  const syncNow = useCallback(async () => {
    await manager.syncPending();
  }, [manager]);

  const retryFailed = useCallback(async () => {
    await manager.retryFailed();
  }, [manager]);

  return {
    isOnline,
    pendingCount,
    syncNow,
    retryFailed,
    syncManager: manager,
  };
}

export function usePendingSync(clinicId: string) {
  const manager = getSyncManager();
  const [pendingItems, setPendingItems] = useState<any[]>([]);

  useEffect(() => {
    const loadPending = async () => {
      const items = await manager.getPendingItems();
      setPendingItems(items.filter((item) => item.clinicId === clinicId));
    };

    loadPending();

    // Update on subscription
    const unsubscribe = manager.subscribe(async () => {
      const items = await manager.getPendingItems();
      setPendingItems(items.filter((item) => item.clinicId === clinicId));
    });

    return unsubscribe;
  }, [manager, clinicId]);

  return { pendingItems };
}
