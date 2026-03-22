// BUILD_TIMESTAMP: 2026-03-22T03:35:34.816Z
const CACHE_NAME = "fumuly-2026-03-22T03-35-34-816Z";

// Install: precache offline page, do NOT skipWaiting
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add("/offline.html"))
  );
});

// Activate: clean up old caches and notify clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Listen for SKIP_WAITING message from the page
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Fetch: network-first for navigations, cache-first for static assets
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip API requests
  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/")) return;

  // Navigation requests: network-first
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/offline.html")))
    );
    return;
  }

  // Static assets (_next/static/): cache-first
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }
});

// Push notification handler
self.addEventListener("push", (event) => {
  const defaultData = {
    title: "fumuly",
    body: "リマインダーがあります",
    url: "/home",
  };

  let data = defaultData;
  try {
    if (event.data) {
      data = { ...defaultData, ...event.data.json() };
    }
  } catch {
    // JSON parse failure: use defaults
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
      data: { url: data.url },
      tag: data.tag || "fumuly-reminder",
      renotify: true,
    })
  );
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/home";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      // Focus existing window if available
      for (const client of clients) {
        if (new URL(client.url).pathname === url && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      return self.clients.openWindow(url);
    })
  );
});
