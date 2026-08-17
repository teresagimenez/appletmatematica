const CACHE_NAME = "math-race-pwa-v1";

const ARCHIVOS = [
  "./MathRace.html",
  "./manifest.json",
  "./menu-bg.png",
  "./car-classic.png",
  "./car-sport.png",
  "./car-pickup.png",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png"
];

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ARCHIVOS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) {
          return key !== CACHE_NAME;
        }).map(function(key) {
          return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function(event) {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) return cached;

      return fetch(event.request).then(function(response) {
        if (!response || response.status !== 200 || response.type === "opaque") {
          return response;
        }

        const copia = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, copia);
        });
        return response;
      }).catch(function() {
        if (event.request.mode === "navigate") {
          return caches.match("./MathRace.html");
        }
      });
    })
  );
});
