const CACHE_NAME = 'studenthub-cache-v18';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/styles.css',
  './js/config.js',
  './js/script.js',
  './manifest.json',
  './assets/SHlogo.svg',
  './assets/SHlarge.svg',
  './assets/student.png',
  './assets/news_dia_estudiante.png',
  './assets/news_expotecnica.png',
  './assets/news_feria_cientifica.png',
  './assets/news_feria_vocacional.png',
  './assets/news_torneo_futsal.png'
];

// Evento de Instalación (Install): Almacena los archivos estáticos base en el caché
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Pre-cacheados recursos base con éxito.');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Evento de Activación (Activate): Limpia cachés antiguos de versiones anteriores
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Eliminando caché obsoleto:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Evento de Petición (Fetch): Estrategia Stale-While-Revalidate
// 1. Sirve inmediatamente desde el caché para máxima velocidad.
// 2. Ejecuta una petición de red en segundo plano para actualizar el recurso en el caché si hay conexión.
self.addEventListener('fetch', (event) => {
  // Solo manejar peticiones HTTP/HTTPS locales o de fuentes externas (como Google Fonts)
  if (event.request.url.startsWith(self.location.origin) || event.request.url.startsWith('https://fonts.')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const networkFetch = fetch(event.request).then((networkResponse) => {
          // Guardar en caché solo respuestas válidas
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        }).catch(() => {
          // Falla silenciosa si no hay conexión a internet
        });

        // Retornar la copia de caché si existe, sino esperar a la red
        return cachedResponse || networkFetch;
      })
    );
  }
});
