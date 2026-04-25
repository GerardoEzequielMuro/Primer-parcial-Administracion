// Service Worker - Administración I Parcial 1
// Permite usar toda la pagina sin internet despues de la primera visita.

const CACHE = 'admin-i-v2';

const ASSETS = [
  './',
  './index.html',
  './parciales.html',
  './mapa-mental.html',
  './formulas.html',
  './parcial-real.html',

  './img/u1/evolucion-escuelas.png',
  './img/u2/sistema-abierto.png',
  './img/u2/variables-entorno.png',
  './img/u2/entorno-organizacion.jpeg',
  './img/u3/organigrama-lineal.png',
  './img/u3/organigrama-funcional.png',
  './img/u3/organigrama-staff.png',

  './manifest.webmanifest',
  './icon.svg',
];

const CDN_ASSETS = [
  'https://cdn.jsdelivr.net/npm/markmap-autoloader@0.18',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(ASSETS).then(() => {
        return Promise.allSettled(
          CDN_ASSETS.map((url) => cache.add(url).catch(() => null))
        );
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((resp) => {
        if (!resp || resp.status !== 200) return resp;
        const clone = resp.clone();
        caches.open(CACHE).then((cache) => {
          cache.put(req, clone).catch(() => null);
        });
        return resp;
      }).catch(() => {
        if (req.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return new Response('', { status: 504, statusText: 'Offline' });
      });
    })
  );
});
