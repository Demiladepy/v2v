const CACHE_NAME = "v2v-shell-v2";
const SHELL_ASSETS = ["/", "/manifest.json", "/icon.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  // Network-first for API routes; offline returns a JSON error
  if (new URL(e.request.url).pathname.startsWith("/api/")) {
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response(JSON.stringify({ error: "offline" }), {
          headers: { "Content-Type": "application/json" },
        })
      )
    );
    return;
  }

  const isDocument =
    e.request.mode === "navigate" ||
    (e.request.headers.get("accept") || "").includes("text/html");

  // Network-first for pages so deploys and API-backed views stay fresh.
  if (isDocument) {
    e.respondWith(
      fetch(e.request).catch(() =>
        caches.match(e.request).then((cached) => cached ?? caches.match("/"))
      )
    );
    return;
  }

  // Cache-first for static assets
  e.respondWith(
    caches
      .match(e.request)
      .then((cached) => cached ?? fetch(e.request).catch(() => cached))
  );
});
