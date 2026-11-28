const CACHE_NAME = 'calc-plus-v1';
const CORE_ASSETS = ['./', './manifest.json', './icon-192.png', './icon-512.png', './favicon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// Network-first for navigation & same-origin requests, falling back to cache
// when offline. Opportunistically caches successful GET responses so the app
// shell and its assets keep working without a connection.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Never cache the currency exchange-rate API — always try the network;
  // the app itself caches successful rates in localStorage for offline use.
  if (url.hostname.includes('exchangerate-api.com') || url.hostname.includes('er-api.com')) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200 && url.origin === self.location.origin) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return res;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match('./')))
  );
});
