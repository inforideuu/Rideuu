const CACHE_NAME = "Rideuu-cache-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/manifest.json",
  "/icons/icon.svg",
  "/login_bg.png"
];

// Installation: Cache essential shell files immediately
self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Pre-caching static assets shell...");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activation: Clean up stale legacy caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[Service Worker] Removing old cache:", key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Interception: Cache-First for static assets, Network-First for core routes
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Bypass API queries or dev websocket hot reloads
  if (url.pathname.startsWith("/api") || url.pathname.includes("hot-update") || e.request.method !== "GET") {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch static assets from cache first
        // Fetch fresh copy in the background to update cache (Stale-While-Revalidate)
        if (
          url.pathname.match(/\.(js|css|svg|png|jpg|jpeg|webp|woff|woff2|ttf|eot)$/) ||
          url.pathname === "/icons/icon.svg" ||
          url.pathname === "/login_bg.png"
        ) {
          fetch(e.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(e.request, networkResponse));
            }
          }).catch(() => { });
          return cachedResponse;
        }
      }

      // Default Network-First strategy
      return fetch(e.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
            return networkResponse;
          }

          // Cache successfully fetched GET page resources dynamically
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // Offline fallback
          return cachedResponse || caches.match("/");
        });
    })
  );
});
