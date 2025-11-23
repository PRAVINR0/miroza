/* Service Worker: Stale-While-Revalidate caching strategy
   - Caches core pages and assets on install
   - On fetch, tries network first and falls back to cache (stale-while-revalidate behavior)
   - Keeps cache versioned and removes old caches on activate
*/

const CACHE_VERSION = 'v3';
const PRECACHE = `miroza-precache-${CACHE_VERSION}`;
const RUNTIME = `miroza-runtime-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/assets/css/styles.css',
  '/assets/css/ui.css',
  '/assets/js/main.js',
  '/assets/js/search.js',
  '/assets/js/ui.js'
];

// Install: cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PRECACHE).then(cache => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener('activate', event => {
  const keep = [PRECACHE, RUNTIME];
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => { if (!keep.includes(k)) return caches.delete(k); })
    ))
  );
  self.clients.claim();
});

// Utility: respond with cache-first for images, stale-while-revalidate for assets, network-first for navigation
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Navigation requests: network-first with offline fallback
  if (req.mode === 'navigate'){
    event.respondWith(
      fetch(req).then(resp => { caches.open(RUNTIME).then(c=>c.put(req, resp.clone())); return resp; })
      .catch(()=> caches.match('/offline.html'))
    );
    return;
  }

  // Images: cache-first
  if (req.destination === 'image'){
    event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(resp=>{ if(resp && resp.status===200){ caches.open(RUNTIME).then(c=>c.put(req, resp.clone())); } return resp; }).catch(()=>cached)));
    return;
  }

  // Static assets: stale-while-revalidate
  if (req.destination === 'script' || req.destination === 'style' || url.pathname.startsWith('/assets/')){
    event.respondWith(
      caches.match(req).then(cached => {
        const network = fetch(req).then(resp => { if(resp && resp.status===200){ caches.open(RUNTIME).then(c=>c.put(req, resp.clone())); } return resp; }).catch(()=>null);
        return cached || network || caches.match('/offline.html');
      })
    );
    return;
  }

  // Default: try network, fallback to cache
  event.respondWith(
    fetch(req).then(resp=>{ if(resp && resp.status===200){ caches.open(RUNTIME).then(c=>c.put(req, resp.clone())); } return resp; }).catch(()=> caches.match(req))
  );
});
