// Minimal, safe service worker stub added on 2025-11-23
// Purpose: prevent accidental aggressive caching while the site is being refactored.
// This worker does not cache resources and cleans up any existing caches on activation.

self.addEventListener('install', event => {
  // Activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    } catch (e) {
      // ignore
    }
  })());
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Intentionally do not intercept or cache network requests.
  // This keeps runtime behaviour equivalent to no-service-worker while
  // avoiding 404s when pages call `navigator.serviceWorker.register('/service-worker.js')`.
});
