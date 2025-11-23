// Simple service worker for MIROZA (caches core assets)
const CACHE_NAME = 'miroza-core-v1';
const OFFLINE_URL = '/offline.html';
const ASSETS = [
  '/', '/index.html', '/styles.min.css', '/app.min.js', '/manifest.json',
  '/assets/hero-1.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS.concat(OFFLINE_URL)))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((resp) => {
      return resp || fetch(event.request).then((response) => {
        // Optionally cache new resources here
        return response;
      }).catch(()=>caches.match(OFFLINE_URL));
    })
  );
});

/*
  Service worker notes:
  - This is a minimal example. For production, configure proper cache versioning and runtime caching.
  - Update CACHE_NAME when you change assets to force refresh.
*/
