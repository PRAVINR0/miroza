/* Service Worker: Stale-While-Revalidate caching strategy
   - Caches core pages and assets on install
   - On fetch, tries network first and falls back to cache (stale-while-revalidate behavior)
   - Keeps cache versioned and removes old caches on activate
*/

const CACHE_NAME = 'miroza-v2';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/articles.html',
  '/blog.html',
  '/news.html',
  '/stories.html',
  '/info.html',
  '/detail.html',
  '/offline.html',
  '/assets/css/style.css',
  '/assets/js/main.js',
  '/assets/js/search.js',
  '/search.html',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => { if (k !== CACHE_NAME) return caches.delete(k); })
    ))
  );
  self.clients.claim();
});

// Stale-while-revalidate: respond with cache if available, fetch and update cache in background
self.addEventListener('fetch', event => {
  const req = event.request;
  // Only handle GET requests
  if (req.method !== 'GET') return;
  event.respondWith(
    caches.match(req).then(cached => {
      const networkFetch = fetch(req).then(response => {
        // update cache asynchronously
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        }
        return response;
      }).catch(()=>{
        // network failed
        return cached || caches.match('/offline.html');
      });
      // prefer cached response but update in background
      return cached || networkFetch;
    })
  );
});
