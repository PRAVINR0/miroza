// Basic service worker for offline support
const CACHE_NAME = "miroza-cache-v1";

const urlsToCache = [
    "/index.html",
    "/offline.html",
    "/assets/css/style.css",
    "/assets/js/main.js",
    "/favicon.ico"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        fetch(event.request).catch(() => caches.match("/offline.html"))
    );
});
