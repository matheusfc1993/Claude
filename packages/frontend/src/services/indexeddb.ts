export interface DBConfig {
  name: string;
  version: number;
  stores: Array<{
    name: string;
    keyPath: string;
    indexes?: Array<{ name: string; keyPath: string; unique?: boolean }>;
  }>;
}

const DB_CONFIG: DBConfig = {
  name: 'ClinicAppDB',
  version: 1,
  stores: [
    {
      name: 'patients',
      keyPath: 'id',
      indexes: [{ name: 'clinicId', keyPath: 'clinicId' }],
    },
    {
      name: 'appointments',
      keyPath: 'id',
      indexes: [
        { name: 'clinicId', keyPath: 'clinicId' },
        { name: 'patientId', keyPath: 'patientId' },
        { name: 'date', keyPath: 'date' },
      ],
    },
    {
      name: 'revenues',
      keyPath: 'id',
      indexes: [
        { name: 'clinicId', keyPath: 'clinicId' },
        { name: 'patientId', keyPath: 'patientId' },
        { name: 'date', keyPath: 'date' },
      ],
    },
    {
      name: 'timeBlocks',
      keyPath: 'id',
      indexes: [
        { name: 'clinicId', keyPath: 'clinicId' },
        { name: 'professionalId', keyPath: 'professionalId' },
        { name: 'date', keyPath: 'date' },
      ],
    },
    {
      name: 'syncQueue',
      keyPath: 'id',
      indexes: [
        { name: 'status', keyPath: 'status' },
        { name: 'entityType', keyPath: 'entityType' },
        { name: 'createdAt', keyPath: 'createdAt' },
      ],
    },
    {
      name: 'cachedMetrics',
      keyPath: 'key',
    },
  ],
};

class IndexedDBService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        console.log('[IndexedDB] Database initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        DB_CONFIG.stores.forEach((storeConfig) => {
          if (!db.objectStoreNames.contains(storeConfig.name)) {
            const store = db.createObjectStore(storeConfig.name, { keyPath: storeConfig.keyPath });

            if (storeConfig.indexes) {
              storeConfig.indexes.forEach((index) => {
                store.createIndex(index.name, index.keyPath, { unique: index.unique });
              });
            }
          }
        });
      };
    });
  }

  async get<T>(storeName: string, key: string): Promise<T | undefined> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result as T);
    });
  }

  async put<T>(storeName: string, data: T): Promise<string> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result as string);
    });
  }

  async add<T>(storeName: string, data: T): Promise<string> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result as string);
    });
  }

  async delete(storeName: string, key: string): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result as T[]);
    });
  }

  async getAllByIndex<T>(storeName: string, indexName: string, value: any): Promise<T[]> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result as T[]);
    });
  }

  async query<T>(
    storeName: string,
    indexName: string,
    value: any
  ): Promise<T | undefined> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.get(value);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result as T);
    });
  }

  async clear(storeName: string): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async bulkPut<T>(storeName: string, items: T[]): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);

      items.forEach((item) => {
        store.put(item);
      });

      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => resolve();
    });
  }

  private async getDb(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error('Failed to initialize IndexedDB');
    }
    return this.db;
  }
}

export default new IndexedDBService();
