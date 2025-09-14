const CACHE_NAME = 'ridedriver-v1.0.0';
const STATIC_CACHE_URLS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png'
];

const RUNTIME_CACHE = 'ridedriver-runtime';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('Service Worker installed successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker installation failed:', error);
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const { url, method } = request;

  // Skip non-GET requests
  if (method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (!url.startsWith(self.location.origin)) {
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match('/') || caches.match('/index.html');
        })
    );
    return;
  }

  // Handle API requests with network-first strategy
  if (url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Handle static assets with cache-first strategy
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });

            return response;
          });
      })
  );
});

// Background sync for offline ride data
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'ride-data-sync') {
    event.waitUntil(
      syncRideData()
    );
  }
});

async function syncRideData() {
  try {
    // Get stored ride data from IndexedDB or localStorage
    const rideData = await getStoredRideData();
    
    if (rideData && rideData.length > 0) {
      const response = await fetch('/api/rides/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rides: rideData })
      });

      if (response.ok) {
        await clearStoredRideData();
        console.log('Ride data synced successfully');
      }
    }
  } catch (error) {
    console.error('Failed to sync ride data:', error);
  }
}

async function getStoredRideData() {
  // Implementation would depend on your storage strategy
  // This is a placeholder for actual data retrieval
  return [];
}

async function clearStoredRideData() {
  // Implementation would depend on your storage strategy
  // This is a placeholder for actual data clearing
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  const options = {
    body: 'You have a new ride request!',
    icon: '/logo192.png',
    badge: '/badge-72.png',
    vibrate: [200, 100, 200],
    tag: 'ride-request',
    requireInteraction: true,
    actions: [
      {
        action: 'accept',
        title: 'Accept',
        icon: '/icons/accept.png'
      },
      {
        action: 'decline',
        title: 'Decline',
        icon: '/icons/decline.png'
      }
    ],
    data: {
      rideId: 'ride-123',
      passenger: 'John Doe',
      pickup: '123 Main St'
    }
  };

  if (event.data) {
    const pushData = event.data.json();
    options.body = pushData.message || options.body;
    options.data = { ...options.data, ...pushData };
  }

  event.waitUntil(
    self.registration.showNotification('RideDriver', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  if (action === 'accept') {
    event.waitUntil(
      clients.openWindow(`/?action=accept-ride&rideId=${data.rideId}`)
    );
  } else if (action === 'decline') {
    event.waitUntil(
      fetch(`/api/rides/${data.rideId}/decline`, { method: 'POST' })
    );
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('Service Worker loaded');