// Service Worker — Finanzas Cami & Juan
// Permite uso offline y caching

const CACHE_NAME = 'finanzas-v1';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,600;0,700;1,400&family=DM+Sans:wght@400;500;600&display=swap'
];

// Instalar: cachear recursos
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activar: limpiar caches viejos
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
      );
    })
  );
  self.clients.claim();
});

// Fetch: primero cache, si no hay red
self.addEventListener('fetch', function(event) {
  // No cachear requests al Apps Script (siempre necesitan red)
  if (event.request.url.includes('script.google.com')) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      return cached || fetch(event.request).then(function(response) {
        // Cachear respuestas nuevas
        if (response && response.status === 200) {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, copy));
        }
        return response;
      });
    }).catch(function() {
      // Sin internet y sin cache: devolver index.html
      return caches.match('./index.html');
    })
  );
});
