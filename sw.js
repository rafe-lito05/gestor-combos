const CACHE_NAME = "gestor-combos-ios-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/js/app.js",
  "/manifest.json",
  "/css/main.css",
  "/css/icons/bootstrap-icons.min.css",
  "/css/icons/iconoir.css",
  "/assets/icons/icon-180px.png",
  "/assets/icons/icon-512px.png",
  "/assets/fonts/Ultra-Regular.ttf",
];

// Instalación - Cachear TODO
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("🍎 Cacheando recursos para iOS offline");
      return cache.addAll(urlsToCache);
    }),
  );
  self.skipWaiting();
});

// Estrategia: Cache First (Primero caché, luego red)
self.addEventListener("fetch", (event) => {
  // Ignorar solicitudes a APIs externas o analytics
  if (
    event.request.url.includes("google") ||
    event.request.url.includes("analytics") ||
    event.request.url.includes("chrome")
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // DEVOLVER SIEMPRE DESDE CACHÉ SI EXISTE
      if (cachedResponse) {
        return cachedResponse;
      }

      // Si no está en caché, intentar red
      return fetch(event.request)
        .then((response) => {
          // Guardar en caché para futuro
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Si falla todo, devolver index.html (para SPA)
          if (event.request.mode === "navigate") {
            return caches.match("/index.html");
          }
          return new Response("", { status: 200 }); // Evitar errores
        });
    }),
  );
});

// Activar y limpiar cachés antiguas
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("🗑️ Eliminando caché antigua:", cacheName);
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
  self.clients.claim();
});

// Mensaje para saber si está offline
self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") {
    self.skipWaiting();
  }
});
