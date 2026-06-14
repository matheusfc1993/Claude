import indexeddb from './indexeddb';

export interface SyncQueueItem {
  id: string;
  clinicId: string;
  entityType: 'REVENUE' | 'APPOINTMENT' | 'PATIENT' | 'METADATA';
  entityId?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  data: any;
  status: 'PENDING' | 'SYNCED' | 'FAILED';
  createdAt: Date;
  retries: number;
  error?: string;
}

export interface SyncManagerConfig {
  apiBaseUrl: string;
  maxRetries?: number;
  retryDelay?: number;
}

class SyncManager {
  private isOnline = navigator.onLine;
  private syncInProgress = false;
  private config: SyncManagerConfig;
  private listeners: Set<(count: number) => void> = new Set();

  constructor(config: SyncManagerConfig) {
    this.config = { maxRetries: 5, retryDelay: 1000, ...config };
    this.setupEventListeners();
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      console.log('[SyncManager] Online detected');
      this.isOnline = true;
      this.syncPending();
    });

    window.addEventListener('offline', () => {
      console.log('[SyncManager] Offline detected');
      this.isOnline = false;
    });
  }

  // Queue a mutation for later sync
  async queueMutation(
    clinicId: string,
    entityType: SyncQueueItem['entityType'],
    action: SyncQueueItem['action'],
    data: any,
    entityId?: string
  ): Promise<string> {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const item: SyncQueueItem = {
      id,
      clinicId,
      entityType,
      entityId,
      action,
      data,
      status: 'PENDING',
      createdAt: new Date(),
      retries: 0,
    };

    await indexeddb.put('syncQueue', item);
    console.log('[SyncManager] Queued:', entityType, action, id);

    this.notifyListeners();

    // Try to sync if online
    if (this.isOnline && !this.syncInProgress) {
      this.syncPending();
    }

    return id;
  }

  // Get pending sync count
  async getPendingCount(): Promise<number> {
    const allItems = await indexeddb.getAll<SyncQueueItem>('syncQueue');
    return allItems.filter((item) => item.status === 'PENDING').length;
  }

  // Get all pending items
  async getPendingItems(): Promise<SyncQueueItem[]> {
    const allItems = await indexeddb.getAll<SyncQueueItem>('syncQueue');
    return allItems.filter((item) => item.status === 'PENDING');
  }

  // Sync all pending changes with server
  async syncPending(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) {
      console.log('[SyncManager] Sync skipped - in progress:', this.syncInProgress, 'online:', this.isOnline);
      return;
    }

    this.syncInProgress = true;

    try {
      const items = await this.getPendingItems();

      if (items.length === 0) {
        console.log('[SyncManager] No items to sync');
        return;
      }

      console.log('[SyncManager] Starting sync of', items.length, 'items');

      for (const item of items) {
        await this.syncItem(item);
      }

      this.notifyListeners();
    } catch (error) {
      console.error('[SyncManager] Sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  // Sync a single item
  private async syncItem(item: SyncQueueItem): Promise<void> {
    try {
      const method = item.action === 'DELETE' ? 'DELETE' : item.action === 'CREATE' ? 'POST' : 'PATCH';
      const endpoint = this.buildEndpoint(item);

      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      };

      if (method !== 'DELETE') {
        options.body = JSON.stringify(item.data);
      }

      const response = await fetch(`${this.config.apiBaseUrl}${endpoint}`, options);

      if (response.ok) {
        await this.markAsSynced(item.id);
        console.log('[SyncManager] Synced:', item.id);
      } else {
        await this.markAsFailed(item.id, `HTTP ${response.status}`);
        console.warn('[SyncManager] Sync failed for', item.id, response.status);
      }
    } catch (error) {
      await this.handleSyncError(item, error);
    }
  }

  // Build API endpoint based on entity type
  private buildEndpoint(item: SyncQueueItem): string {
    const clinicId = item.clinicId;

    switch (item.entityType) {
      case 'PATIENT':
        return item.entityId
          ? `/api/financial/${clinicId}/patients/${item.entityId}`
          : `/api/financial/${clinicId}/patients`;

      case 'APPOINTMENT':
        return item.entityId
          ? `/api/schedule/${clinicId}/appointments/${item.entityId}`
          : `/api/schedule/${clinicId}/appointments`;

      case 'REVENUE':
        return item.entityId
          ? `/api/financial/${clinicId}/revenues/${item.entityId}`
          : `/api/financial/${clinicId}/revenues`;

      case 'METADATA':
        return `/api/sync/${clinicId}`;

      default:
        throw new Error(`Unknown entity type: ${item.entityType}`);
    }
  }

  private async markAsSynced(id: string): Promise<void> {
    const item = await indexeddb.get<SyncQueueItem>('syncQueue', id);
    if (item) {
      item.status = 'SYNCED';
      await indexeddb.put('syncQueue', item);
    }
  }

  private async markAsFailed(id: string, error: string): Promise<void> {
    const item = await indexeddb.get<SyncQueueItem>('syncQueue', id);
    if (item) {
      item.retries++;
      if (item.retries >= (this.config.maxRetries || 5)) {
        item.status = 'FAILED';
      }
      item.error = error;
      await indexeddb.put('syncQueue', item);
    }
  }

  private async handleSyncError(item: SyncQueueItem, error: any): Promise<void> {
    console.error('[SyncManager] Error syncing', item.id, error);
    const message = error instanceof Error ? error.message : String(error);
    await this.markAsFailed(item.id, message);
  }

  // Subscribe to sync count changes
  subscribe(listener: (count: number) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private async notifyListeners(): Promise<void> {
    const count = await this.getPendingCount();
    this.listeners.forEach((listener) => listener(count));
  }

  // Get auth token from localStorage
  private getAuthToken(): string {
    const token = localStorage.getItem('token');
    return token || '';
  }

  // Get online status
  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  // Retry failed items
  async retryFailed(): Promise<void> {
    const allItems = await indexeddb.getAll<SyncQueueItem>('syncQueue');
    const failedItems = allItems.filter((item) => item.status === 'FAILED');

    for (const item of failedItems) {
      item.status = 'PENDING';
      item.retries = 0;
      await indexeddb.put('syncQueue', item);
    }

    console.log('[SyncManager] Retrying', failedItems.length, 'failed items');
    this.notifyListeners();

    if (this.isOnline) {
      this.syncPending();
    }
  }
}

export default SyncManager;
