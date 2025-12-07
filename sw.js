/* MIROZA Service Worker v8: TOI Redesign */
const STATIC_CACHE = 'miroza-static-v8';
const RUNTIME_CACHE = 'miroza-runtime-v8';
const CORE_ASSETS = [
  './',
  './index.html',
  './offline.html',
  './styles/main.css',
  './scripts/app.js',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).
      then(cache => cache.addAll(CORE_ASSETS)).
      then(()=> self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => ![STATIC_CACHE, RUNTIME_CACHE].includes(k)).map(k => caches.delete(k))
    )).then(()=> self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);

  if(req.mode === 'navigate'){
    event.respondWith(networkFirst(req));
    return;
  }

  if(url.origin !== self.location.origin){
    event.respondWith(fetch(req).catch(()=> caches.match('/offline.html')));
    return;
  }

  if(isCoreAsset(url.pathname)){
    event.respondWith(cacheFirst(req));
    return;
  }

  event.respondWith(staleWhileRevalidate(req));
});

function isCoreAsset(path){
  return CORE_ASSETS.includes(path);
}

async function cacheFirst(request){
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if(cached) return cached;
  const response = await fetch(request);
  if(response.ok){ cache.put(request, response.clone()); }
  return response;
}

async function networkFirst(request){
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    if(response && response.ok){ cache.put(request, response.clone()); }
    return response;
  } catch (error){
    const cached = await cache.match(request);
    if(cached) return cached;
    const offline = await caches.match('/offline.html');
    if(offline) return offline;
    return caches.match('/index.html');
  }
}

async function staleWhileRevalidate(request){
  const cache = await caches.open(RUNTIME_CACHE);
  const cachedPromise = cache.match(request);
  const networkPromise = fetch(request).then(response => {
    if(response && response.ok){ cache.put(request, response.clone()); }
    return response;
  }).catch(()=> null);
  const cached = await cachedPromise;
  return cached || await networkPromise || caches.match('/offline.html');
}
