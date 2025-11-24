/* MIROZA Service Worker: Cache core assets & provide offline fallback */
const CACHE_NAME = 'miroza-v1';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/styles/styles.css',
  '/scripts/app.js',
  '/manifest.json',
  '/assets/icons/logo.svg',
  '/assets/images/placeholder.svg',
  '/data/posts.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if(req.method !== 'GET') return; // skip non-GET
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req);
    if(cached) return cached;
    try {
      const fresh = await fetch(req);
      if(fresh.ok && fresh.type === 'basic') { cache.put(req, fresh.clone()); }
      return fresh;
    } catch (e) {
      // Fallback to index for navigation requests
      if(req.mode==='navigate') { return cache.match('/index.html'); }
      return new Response('Offline', { status: 503, statusText: 'Offline' });
    }
  })());
});