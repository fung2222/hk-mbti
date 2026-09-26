const CACHE = "hk-mbti-v2.0.0";
const ASSETS = [
  "/hk-mbti/",
  "/hk-mbti/index.html",
  "/hk-mbti/data.js",
  "/hk-mbti/social.js",
  "/hk-mbti/voice-data.js",
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

  // 朗讀音檔 (mp3)：唔攔截，交返畀瀏覽器原生處理（Range request + HTTP cache）。
  // 用 Cache API 存 media 唔穩（seek／range），545 個檔亦會撐大 cache。
  if(url.pathname.endsWith(".mp3")) return;

  // HTML documents + 朗讀對照表: network-first (永遠取 fresh 解決 stale cache)
  // voice-data.js 指住音檔路徑；佢一 stale 就會 404 → 跌返機械聲，所以一定要 network-first
  const isHTML = e.request.mode === "navigate" ||
                 (e.request.headers.get("accept") || "").includes("text/html") ||
                 url.pathname.endsWith(".html") ||
                 url.pathname.endsWith("voice-data.js");

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