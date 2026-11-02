// =====================================================================
// Service Worker de KebabScore Málaga (public/sw.js)
// ---------------------------------------------------------------------
// Permite que Chrome/Android/Edge reconozcan KebabScore como una
// aplicación instalable (PWA) y mantiene una caché rápida de navegación.
// =====================================================================

const CACHE_NAME = 'kebabscore-pwa-v1';
const URLS_BASE = ['/', '/ranking', '/misiones', '/icon.svg'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(URLS_BASE))
      .catch(() => {}),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_NAME)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request)),
  );
});
