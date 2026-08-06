const CACHE = "hk-mbti-v1.7.11";
const ASSETS = [
  "/hk-mbti/",
  "/hk-mbti/index.html",
  "/hk-mbti/data.js",
  "/hk-mbti/social.js",
  "/hk-mbti/manifest.json",
  "/hk-mbti/icon-192.png",
  "/hk-mbti/icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  if(e.request.method !== "GET") return;
  const url = new URL(e.request.url);

  // HTML documents: network-first (永遠取 fresh 解決 stale cache)
  const isHTML = e.request.mode === "navigate" ||
                 (e.request.headers.get("accept") || "").includes("text/html") ||
                 url.pathname.endsWith(".html");

  if(isHTML){
    e.respondWith(
      fetch(e.request).then(net => {
        if(net && net.status === 200){
          const clone = net.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return net;
      }).catch(() => caches.match(e.request).then(c => c || new Response("", {status:503})))
    );
    return;
  }

  // 其他 assets (JS/CSS/圖): cache-first
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request).then(net => {
        if(net && net.status === 200 && e.request.url.startsWith(self.location.origin)){
          const clone = net.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return net;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});