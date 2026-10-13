const CACHE = "hk-mbti-v2.0.0";
const ASSETS = [
  "/hk-mbti/",
  "/hk-mbti/index.html",
  "/hk-mbti/data.js",
  "/hk-mbti/social.js",
  "/hk-mbti/pair-data.js",
  "/hk-mbti/tailwind.css",
  "/hk-mbti/voice-data.js",
  "/hk-mbti/premium-data.js",
  "/hk-mbti/type-icons.js",
  "/hk-mbti/manifest.json",
  "/hk-mbti/icon-192.png",
  "/hk-mbti/icon-512.png",
  "/hk-mbti/record.html",
  "/hk-mbti/stats.html",
  "/hk-mbti/privacy.html",
  "/hk-mbti/tee.html",
  "/hk-mbti/offline.html"
];

self.addEventListener("install", e => {
  // 注意：addAll 係「全部成功才算成功」——買一個檔 404 就會連累成個 precache。
  // 改為逐個 add ＋ allSettled：任何一個失敗都唔會拖死其他（2026-10-04）。
  //
  // 2026-10-13（Grok 4.7 審計）：改用 fetch({cache:"reload"}) ＋ put，唔再用 c.add()。
  // 原因：GitHub Pages 送 cache-control: max-age=600，c.add() 會食 HTTP cache →
  // 就算 SW 更新咗，cache 入面嘅 index.html 都可能係舊版 → 離線時 serve 舊 HTML
  // （真機驗收症狀：空白彈窗、掣撳唔到）。cache:"reload" 強制由網絡攞最新。
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(ASSETS.map(u =>
        fetch(u, { cache: "reload" }).then(r => (r && r.status === 200) ? c.put(u, r) : null)
      )))
      .catch(() => {})
  );
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

  // 網頁字型（Google Fonts）：2026-10-13 加。血例 —— 真機驗收（飛行模式）發現
  // 「入到 app 後字體變咗另一個」：Noto Sans HK 係 Android 嘅 fallback 字型，
  // 之前靠網絡即時下載，離線就一定失敗 → 掉去系統字 → 字體走樣。
  // 字型檔係 immutable（同一個 URL 永遠同一份），最適合 cache-first。
  if(url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com"){
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request).then(net => {
        // 跨域字型可能係 opaque response（status 0），兩種都要收
        if(net && (net.status === 200 || net.type === "opaque")){
          const clone = net.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone)).catch(() => {});
        }
        return net;
      }).catch(() => cached))
    );
    return;
  }

  // HTML documents + 朗讀對照表: network-first (永遠取 fresh 解決 stale cache)
  // voice-data.js 指住音檔路徑；佢一 stale 就會 404 → 跌返機械聲，所以一定要 network-first
  const isHTML = e.request.mode === "navigate" ||
                 (e.request.headers.get("accept") || "").includes("text/html") ||
                 url.pathname.endsWith(".html") ||
                 url.pathname.endsWith("voice-data.js") ||
                 url.pathname.endsWith("premium-data.js") ||
                 url.pathname.endsWith("type-icons.js");

  if(isHTML){
    e.respondWith(
      // cache:"reload"：避免 GitHub Pages 嘅 max-age=600 將舊 HTML 由 HTTP cache 餵返嚟
      fetch(e.request, { cache: "reload" }).then(net => {
        if(net && net.status === 200){
          const clone = net.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return net;
      }).catch(() =>
        caches.match(e.request, {ignoreSearch:true})
          // 2026-10-13：/hk-mbti/ 同 /hk-mbti/index.html 係兩條 key，ignoreSearch 唔會當佢哋同一份
          // → 一定要兩條都試，否則一條舊咗就會 serve 舊 HTML（真機驗收症狀來源）
          .then(c => c || caches.match("/hk-mbti/index.html", {ignoreSearch:true}))
          .then(c => c || caches.match("/hk-mbti/", {ignoreSearch:true}))
          .then(c => c || caches.match("/hk-mbti/offline.html"))
          .then(c => c || new Response("暫時連唔到網絡，請檢查連線後再試。", {status:503, headers:{"Content-Type":"text/html;charset=utf-8"}}))
      )
    );
    return;
  }

  // 其他 assets (JS/CSS/圖): cache-first
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request, { cache: "reload" }).then(net => {
        if(net && net.status === 200 && e.request.url.startsWith(self.location.origin)){
          const clone = net.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return net;
      }).catch(() => cached);
      // 2026-10-13（DeepSeek v4 Pro 審計）：原本 return cached || fetchPromise —
      // 離線 + cache miss 時 fetchPromise 會 resolve 成 undefined → respondWith(undefined) 會 throw，
      // 連兜底都冇。加 Response.error() 封死呢個洞。
      return cached || fetchPromise.then(function(r){ return r || Response.error(); });
    })
  );
});