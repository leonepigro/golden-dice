const CACHE = 'golden-dice-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/sw.js',
  '/icon-192.png',
  '/icon-512.png',
  '/js/app.js',
  '/js/sessions.js',
  '/js/dice-logic.js',
  '/js/dice-scene.js',
  '/js/dice-geometry.js',
  '/js/dice-materials.js',
  '/js/dice-animation.js',
  'https://cdn.jsdelivr.net/npm/three@0.167.0/build/three.module.js',
];

self.addEventListener('install', e => {
  // Fix 1: skipWaiting inside waitUntil so activation waits for cache fill
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(async cached => {
      if (cached) return cached;
      try {
        const response = await fetch(e.request);
        if (
          response &&
          response.status === 200 &&
          response.type !== 'error' &&
          response.type !== 'opaque'
        ) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone)).catch(() => {});
        }
        return response;
      } catch (_) {
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      }
    })
  );
});
