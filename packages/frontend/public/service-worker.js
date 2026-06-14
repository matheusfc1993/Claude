const CACHE_VERSION = 'v1';
const CACHE_NAME = `cfo-virtual-${CACHE_VERSION}`;
const API_CACHE = `cfo-virtual-api-${CACHE_VERSION}`;

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching precache assets');
      return cache.addAll(PRECACHE_ASSETS).catch(err => {
        console.log('[ServiceWorker] Error caching precache assets:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME && name !== API_CACHE) {
            console.log('[ServiceWorker] Deleting old cache:', name);
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Network-First for API, Cache-First for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // API calls - Network-First with offline fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response.ok) return response;

          // Cache successful API responses
          const clonedResponse = response.clone();
          caches.open(API_CACHE).then((cache) => {
            cache.put(request, clonedResponse);
          });

          return response;
        })
        .catch(() => {
          // Return cached response on network failure
          return caches.match(request).then((cachedResponse) => {
            return (
              cachedResponse ||
              new Response('Offline - Data not cached', {
                status: 503,
                statusText: 'Service Unavailable',
              })
            );
          });
        })
    );
    return;
  }

  // Static assets - Cache-First
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(request).then((response) => {
          if (!response.ok) return response;

          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clonedResponse);
          });

          return response;
        })
      );
    })
  );
});

// Background sync for offline mutations
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-changes') {
    event.waitUntil(syncPendingChanges());
  }
});

async function syncPendingChanges() {
  try {
    const db = await openIndexedDB();
    const syncQueue = await getAllFromStore(db, 'syncQueue', 'status', 'PENDING');

    if (syncQueue.length === 0) {
      console.log('[ServiceWorker] No pending changes to sync');
      return;
    }

    console.log('[ServiceWorker] Syncing', syncQueue.length, 'pending changes');

    for (const item of syncQueue) {
      try {
        const response = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });

        if (response.ok) {
          await deleteFromStore(db, 'syncQueue', item.id);
          console.log('[ServiceWorker] Synced:', item.id);
        }
      } catch (error) {
        console.error('[ServiceWorker] Sync error:', error);
      }
    }

    // Notify clients that sync completed
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ type: 'SYNC_COMPLETED' });
      });
    });
  } catch (error) {
    console.error('[ServiceWorker] Sync failed:', error);
  }
}

// IndexedDB helpers
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ClinicAppDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      const stores = [
        'patients',
        'appointments',
        'revenues',
        'timeBlocks',
        'syncQueue',
        'cachedMetrics',
      ];

      stores.forEach((store) => {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'id' });
        }
      });
    };
  });
}

function getAllFromStore(db, storeName, indexName, value) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function deleteFromStore(db, storeName, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
