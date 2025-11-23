// Service worker for MIROZA with precache + runtime caching and update handling
const CACHE_VERSION = 'v1';
const CORE_CACHE = `miroza-core-${CACHE_VERSION}`;
const RUNTIME_CACHE = `miroza-runtime-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';
const CORE_ASSETS = [
  '/', '/index.html', '/styles/styles.css', '/scripts/app.js', '/manifest.json', '/offline.html', '/assets/hero-1.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CORE_CACHE).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter(k => k !== CORE_CACHE && k !== RUNTIME_CACHE).map(k => caches.delete(k))
    ))
    .then(()=>clients.claim())
  );
});

// Helper: network-first for navigation, cache-first for images and static assets
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Serve navigation requests (HTML) network-first with offline fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then((res) => {
        // Update core cache
        const copy = res.clone();
        caches.open(CORE_CACHE).then(cache => cache.put(event.request, copy));
        return res;
      }).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Images: cache-first then network
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request).then((resp) => {
        const copy = resp.clone();
        caches.open(RUNTIME_CACHE).then(cache => cache.put(event.request, copy));
        return resp;
      }).catch(()=>caches.match(OFFLINE_URL)))
    );
    return;
  }

  // Stale-while-revalidate for CSS/JS to serve fast but update in background
  if (event.request.destination === 'style' || event.request.destination === 'script') {
    event.respondWith(
      caches.match(event.request).then(cached => {
        const network = fetch(event.request).then(resp=>{
          const copy = resp.clone(); caches.open(RUNTIME_CACHE).then(c=>c.put(event.request, copy)); return resp;
        }).catch(()=>null);
        return cached || network;
      })
    );
    return;
  }

  // Fonts and other static assets: cache-first
  if (event.request.destination === 'font' || event.request.destination === 'image') {
    event.respondWith(caches.match(event.request).then(cached=> cached || fetch(event.request).then(resp=>{caches.open(RUNTIME_CACHE).then(c=>c.put(event.request, resp.clone())); return resp;})));
    return;
  }

  // Default: try cache then network, with offline fallback
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).catch(()=>caches.match(OFFLINE_URL)))
  );
});

// Listen for messages from the client (e.g., skipWaiting)
self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Notify clients when a new service worker takes control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    clients.matchAll({type: 'window'}).then(windowClients => {
      for (const client of windowClients) {
        client.postMessage({type: 'SW_ACTIVATED', version: CACHE_VERSION});
      }
    })
  );
});

/*
  Notes:
  - This SW is still simple but includes cache-versioning and runtime caching for images.
  - For production consider using Workbox for complex strategies, stale-while-revalidate, and better analytics.
*/
