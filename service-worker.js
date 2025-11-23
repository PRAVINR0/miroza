const CACHE_NAME = 'miroza-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/assets/css/main.css',
  '/assets/css/theme.css',
  '/assets/js/main.js',
  '/assets/js/datastore.js',
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
      return caches.match('/index.html');
    });
  }));
});
