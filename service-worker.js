const CACHE_NAME = 'miroza-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/assets/css/main.css',
  '/assets/css/newspaper.css',
  '/assets/css/theme.css',
  '/assets/js/main.js',
  '/assets/js/datastore.js',
  '/assets/js/ui.js',
  '/offline.html',
  '/assets/images/logo.svg'
];

self.addEventListener('install', (e)=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(ASSETS)));
});

self.addEventListener('activate', (e)=>{
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e)=>{
  const req = e.request;
  if(req.method !== 'GET') return;
  e.respondWith(caches.match(req).then(cached=>{
    if(cached) return cached;
    return fetch(req).then(resp=>{
      if(!resp || resp.status !== 200 || resp.type !== 'basic') return resp;
      const copy = resp.clone();
      caches.open(CACHE_NAME).then(cache=>cache.put(req, copy));
      return resp;
    }).catch(()=>{
      // If navigation to a page failed (user offline), serve the offline fallback if cached
      if(req.mode === 'navigate'){
        return caches.match('/offline.html');
      }
      return caches.match('/index.html');
    });
  }));
});
