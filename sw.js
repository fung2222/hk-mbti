// 2026-10-18：收銀機診斷版；sw.js 有改動 → activate 會清 cache 重抓（CACHE 名必須等於 VERSION）
// 2026-10-18b：開 app 後補問價錢（重新整理唔會冇價錢）
// 2026-10-18c：移除臨時診斷行
// 2026-10-18d：完整版分頁改成三格賣點
// 2026-10-18e：三格入同一張卡；移走按鈕上句；下句置中
// 2026-10-18f：完整頁大圖示＋立即解鎖＋細掣
// 2026-10-18g：頂欄改深入內容一句；大字下副標題取消
// 2026-10-18h：掣下句改「解鎖全部內容，換機都可以還原。」
// 2026-10-19：首頁港式日常情景同香港分佈中間加分隔線
// 2026-10-19b：結果頁改文件夾，完整內容要解鎖先入
// 2026-10-19c：看完整分析置中放大；個人報告加大；配對改下拉
// 2026-10-19d：結果文件夾下拉重整要填返內容
// 2026-10-19e：05 加星，完整內容頁跟其他頁同一款
// 2026-10-19f：個人報告字級統一；配對工具包成卡
// 2026-10-19g：五條軸各自一卡；計分方法改掣；配對寫你是／他她是
// 2026-10-19h：朋友配對取消假百分比，改 16 格
// 2026-10-19i：朋友配對 16 格改記錄頁色框，加 icon
// 2026-10-19j：傾向程度五條軸收成一張卡，中間分隔線
// 2026-10-19k：性格分析加卡；01-05 標題副標題統一
// 2026-10-19l：03 同 04 對調；01-03 免費，04-05 星加解鎖
// 2026-10-19m：01-05 面板字級統一，冇細過 13px
// 2026-10-19n：01 副標題搬去頁頂
// 2026-10-19o：01 標題顯示型號 icon；看完整分析搬上刻度上面
// 2026-10-19p：01 型號放大；掣改「睇完整分析」加箭嘴並縮細
// 2026-10-19q：01 標題去 icon、型號跟標題字級；掣去外框左對齊
// 2026-10-19r：01 直接跳人格頁，清走重複排版
// 2026-10-19s：刪人格頁假配對 %（typeCompatPct）
// 2026-10-19t：03 港人情境一張大卡包晒，副標題加「下面」
// 2026-10-19u：02 刪「最似你嘅 3 個型」
// 2026-10-19v：02 傾向標題入卡；盲點標題轉金色
// 2026-10-19w：02 傾向標題同盲點標題一樣大
// 2026-10-19x：02-05 標題加彩色 icon；02/03 標題拆獨立卡
// 2026-10-19y：02-05 標題卡上下留白相等、副標題縮排、icon 26px
// 2026-10-19z：icon 卡內垂直置中 34px；03 拆外卡；05 三書籤＋深入分析金掣
// 2026-10-20a：05 改名深入分析、直接跳人格頁 deep；刪走三個場面對白（推測內容）
// 2026-10-20b：05 改去深入分析 16 型選擇頁（同主頁頂完整版同一入口）
// 2026-10-20c：計分方法頁加「內容來源」；preflight 加第 13 節守門
// 2026-10-20d：關於頁測試入口移最底；首頁頭三名＋紀錄頁 16 格加型色 icon 同放大字
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
  "/hk-mbti/favicon.png",
  "/hk-mbti/apple-touch-icon.png",
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
  // 2026-10-13（Grok 4.7 ＋ DeepSeek v4 Pro 審計 ＋ 業界標準做法）：
  // 原本只刪「唔同 cache 名」嘅 cache → 同名 cache 入面嘅舊 HTML／缺失資產永遠唔會被清，
  // 用戶就會「收到咗修復但仍然壞」（線上經典 bug：I Shipped a Fix. My Service Worker Kept Serving the Bug.）。
  // 而家每次 activate（＝每次 sw.js 有改動）都做一次全量重置：
  //   ① 刪走所有 cache（唔理 cache 名，保持版本字串一致）
  //   ② 由網絡重新抓齊所有 ASSETS（cache:"reload" 繞過 HTTP cache）
  // 咁樣就算之前 cache 缺檔／有舊 HTML，一更新 SW 就自動回復乾淨狀態。
  e.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
      const c = await caches.open(CACHE);
      await Promise.allSettled(ASSETS.map(u =>
        fetch(u, { cache: "reload" }).then(r => (r && r.status === 200) ? c.put(u, r) : null)
      ));
    } catch (err) {}
  })());
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