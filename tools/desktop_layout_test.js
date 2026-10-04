/**
 * 桌面／平板排版層「結構 + 鐵律」測試（tools/desktop_layout_test.js）—— v3（2026-09-28 重寫）
 *
 * 呢個係靜態（jsdom）測試：守住 CSS 鐵律同 DOM 假設。
 * ⚠ 佢冇排版引擎，量唔到位置 —— 真實位置請跑 tools/desktop_render_test.py（真 Chrome）。
 *   （舊版 41 項全部用 regex 睇 CSS 文字，結果 scenes／探索更多嘅 grid 從來冇生效、
 *     #home 永遠收唔埋都照樣「全部通過」。）
 * 執行：NODE_PATH=<jsdom 位置> node tools/desktop_layout_test.js
 */
const fs = require("fs");
const path = require("path");
const { JSDOM, VirtualConsole } = require("jsdom");

const REPO = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(REPO, "index.html"), "utf8");
const layer = html.match(/<style id="desktop-layer">([\s\S]*?)<\/style>/)[1];
const gate = html.match(/<script>((?:(?!<\/script>)[\s\S])*?classList\.add\("dt"\)(?:(?!<\/script>)[\s\S])*?)<\/script>/)[1];

function inlineLocal(h) {
  return h.replace(/<script src="(https?:)?\/\/[^"]*"><\/script>/g, "")
    .replace(/<script src="([^"]+\.js)"><\/script>/g, (m, f) =>
      fs.existsSync(path.join(REPO, f)) ? "<script>\n" + fs.readFileSync(path.join(REPO, f), "utf8") + "\n</script>" : "");
}

let pass = 0, total = 0;
function check(name, cond, extra) {
  total++; if (cond) pass++;
  console.log((cond ? "✓" : "✗") + " " + name + (cond ? "" : "   ← " + (extra || "失敗")));
}

// ---------- 1. CSS 鐵律 ----------
const noComments = layer.replace(/\/\*[\s\S]*?\*\//g, "");
// 拆出 @media 塊（最多一層嵌套）
const mediaBlocks = [...noComments.matchAll(/@media([^{]*)\{((?:[^{}]|\{[^{}]*\})*)\}/g)];
const outside = noComments.replace(/@media[^{]*\{(?:[^{}]|\{[^{}]*\})*\}/g, "").trim();
check("media query 以外只有一條：4 個新增元素預設隱藏",
  outside === "#dtNav,#dtHeroCta,#dtTypeRows,#dtFoot{display:none}", JSON.stringify(outside.slice(0, 120)));
check("有 @media 塊（平板＋桌面）", mediaBlocks.length >= 3, "得 " + mediaBlocks.length + " 個");
check("每個 @media 都係 min-width 條件", mediaBlocks.every(m => /min-width\s*:/.test(m[1])));
const selectors = [];
for (const m of mediaBlocks) for (const r of m[2].matchAll(/([^{}]+)\{[^{}]*\}/g))
  r[1].split(",").map(s => s.trim()).filter(Boolean).forEach(s => selectors.push(s));
const bad = selectors.filter(s => !/^html\.dt[\s:.]/.test(s) && s !== "html.dt");
check("@media 入面每個 selector 都以 html.dt 開頭（" + selectors.length + " 個）", bad.length === 0, bad.slice(0, 3).join(" | "));
check("冇 calc(50% - 50vw) 全闊色帶／冇 vw 負 margin", !/50vw/.test(noComments));
check("冇無條件 zoom", !/zoom\s*:/.test(noComments));
const SECTIONS = ["home","profile","test","result","about","hub","letter","type","socialArticle","romanceArticle","method","privacy","upgrade","deep","deepChapter"];
const hiddenBreakers = [];
for (const m of mediaBlocks) for (const r of m[2].matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  if (!/(^|;)\s*display\s*:/.test(r[2])) continue;
  for (const s of r[1].split(",").map(x => x.trim())) {
    const last = s.split(/\s+|>/).filter(Boolean).pop() || "";
    const id = (last.match(/^#([A-Za-z]+)/) || [])[1];
    if (id && SECTIONS.includes(id) && !/:not\(\.hidden\)/.test(last)) hiddenBreakers.push(s);
  }
}
check("冇覆寫 section（#home 等）嘅 display 而唔寫 :not(.hidden)（會令 .hidden 失效）", hiddenBreakers.length === 0, hiddenBreakers.join(" | "));
check("桌面：跑馬燈後 16 張複本隱藏", /html\.dt \.home-type-reel \.hub-type-card:nth-child\(n\+17\)\{display:none\}/.test(layer));
check("桌面／平板：16 型係橫向可滑滑輪，唔係 grid",
  /html\.dt \.home-type-reel\{[^}]*display:flex[^}]*overflow-x:auto/.test(layer) &&
  !/html\.dt \.home-type-reel\{[^}]*display:grid/.test(layer));
check("滑輪左右箭嘴冇被桌面層收埋", !/html\.dt \.home-type-nav\{[^}]*display:\s*none/.test(layer));
check("桌面／平板 #app 冇 padding-bottom:72px 死白", !/padding-bottom:\s*72px/.test(layer));
check("寬度分級：平板 920 / 桌面 1120 / 1280 / 1440 各唔同",
  ["--dt-w:min(920px,calc(100% - 40px))", "--dt-w:min(1120px,calc(100% - 64px))",
   "--dt-w:min(1200px,calc(100% - 80px))", "--dt-w:min(1280px,calc(100% - 96px))"].every(s => layer.includes(s)));
check("桌面：scenes-grid 真係 display:grid（舊版漏咗）", /html\.dt \.scenes-grid\{display:grid/.test(layer));
check("桌面：探索更多 5 欄（5 格唔會剩一格）", /html\.dt \.home-acc\{[^}]*grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/.test(layer));
check("平板：探索更多 6 欄 span 2，尾兩格置中（3+2）",
  /html\.dt \.home-acc\{[^}]*grid-template-columns:repeat\(6,minmax\(0,1fr\)\)/.test(layer) &&
  /html\.dt \.home-acc-item:nth-child\(5\)\{grid-column:2 \/ span 2\}/.test(layer) &&
  /html\.dt \.home-acc-item:nth-child\(6\)\{grid-column:4 \/ span 2\}/.test(layer));
check("內容頁唔再鎖 720px 窄柱", !/section:not\(#home\)\{max-width:720px/.test(layer));
check("結果頁桌面用 grid 分欄", /html\.dt #result:not\(\.hidden\)\{[^}]*display:grid/.test(layer));
check("百科格桌面 8 欄（唔係手機 4 欄放大）", /html\.dt #hub \.hub-type-grid[^{]*\{[^}]*repeat\(8,/.test(layer));
check("深入分析目錄桌面／平板 3 欄（9 章唔會剩一格）", /html\.dt #deepList\{[^}]*repeat\(3,/.test(layer));
check("桌面：導覽高亮用 :has()（唔使 JS）", /html\.dt:has\(#hub:not\(\.hidden\)\) #dtNav \[data-nav="hub"\]/.test(layer));
check("手機摺疊 JS 仍然存在（toggleHomeAcc）", /toggleHomeAcc = function/.test(html));

// ---------- 2. DOM 結構假設 ----------
const vc = new VirtualConsole();
const errs = [];
vc.on("jsdomError", e => { const m = String(e.message || e); if (!/scrollTo|Not implemented|Could not parse CSS/.test(m)) errs.push(m.slice(0, 90)); });
const dom = new JSDOM(inlineLocal(html), {
  url: "https://fung2222.github.io/hk-mbti/", runScripts: "dangerously", pretendToBeVisual: true, virtualConsole: vc,
  beforeParse(w) { Object.defineProperty(w, "innerWidth", { value: 1440, configurable: true }); w.alert = () => {}; w.confirm = () => false; },
});
setTimeout(() => {
  const d = dom.window.document;
  const home = d.getElementById("home");
  check("#home 存在", !!home);
  const hero = home.querySelector(":scope > .home-hero");
  check(".home-hero 係 #home 直系子女（桌面 hero grid）", !!hero);
  const first = hero && hero.firstElementChild;
  check(".home-hero 第一個子女係 logo 列（桌面隱藏）", !!(first && first.querySelector("#homeLogoLink")));
  check(".home-hero 入面有 .home-hero-copy 同 #homeTypeReelWrap（左右兩欄）",
    !!(hero && hero.querySelector(":scope > .home-hero-copy") && hero.querySelector(":scope > #homeTypeReelWrap")));
  const wrap = d.getElementById("homeTypeReelWrap");
  check("#homeTypeReelWrap 入面有 #homeTypeReel 同 #dtTypeRows", !!(wrap && wrap.querySelector(":scope > #homeTypeReel") && wrap.querySelector(":scope > #dtTypeRows")));
  check("#dtTypeRows 4 個組別標籤", d.querySelectorAll("#dtTypeRows > span").length === 4);
  check("#homeBelow 係 #home 直系子女", !!home.querySelector(":scope > #homeBelow"));
  check("#resumeBanner 係 #home 直系子女", !!home.querySelector(":scope > #resumeBanner"));
  check(".scenes-bleed 係 #home 直系子女（全闊色帶）", !!home.querySelector(":scope > .scenes-bleed"));
  check("風琴 wrapper 係 #home > div.mb-4 > #homeAccordion", !!home.querySelector(":scope > div.mb-4 > #homeAccordion"));
  check(".home-more-up-wrap 係 #home 直系子女", !!home.querySelector(":scope > .home-more-up-wrap"));
  const nav = d.getElementById("dtNav");
  check("#dtNav 係 body 直系子女（sticky 全闊）", !!(nav && nav.parentElement === d.body));
  const links = nav ? nav.querySelectorAll(".dt-nav-links [data-nav]") : [];
  check("#dtNav 6 個入口都有 data-nav（加計分方法、私隱；冇光譜／相處）", links.length === 6, String(links.length));
  check("#dtNav 7 個項目（6 個入口 + 開始測試）",
    nav.querySelectorAll(".dt-nav-links [data-nav], .dt-nav-cta").length === 7);
  check("#dtNav 有計分方法同限制同私隱聲明",
    !!nav.querySelector('[data-nav="method"][onclick*="openMethod"]') &&
    !!nav.querySelector('[data-nav="privacy"][onclick*="openPrivacy"]'));
  check("#dtNav 入口函數都存在（冇 stale 光譜／相處）",
    ["openHub", "openAbout", "goPickVersion", "openPrivacy", "openMethod"].every(f => typeof dom.window[f] === "function") &&
    !!nav.querySelector('a[href="./stats.html"]') && !!nav.querySelector('a[href="./record.html"]') &&
    !nav.querySelector('[data-nav="spectrum"]') && !nav.querySelector('[data-nav="social"]'));
  check("#dtHeroCta 喺 .home-hero-copy 內（開始測試／性格百科）",
    !!d.querySelector(".home-hero-copy #dtHeroCta") &&
    !!d.querySelector('#dtHeroCta [onclick*="goPickVersion"]') && !!d.querySelector('#dtHeroCta [onclick*="openHub"]'));
  const foot = d.getElementById("dtFoot");
  check("#dtFoot 係 body 直系子女，喺 #app 後面", !!(foot && foot.parentElement === d.body && foot.previousElementSibling && foot.previousElementSibling.id === "app"));
  check("16 型色牌 32 張（前 16 唯一、後 16 重複）", d.querySelectorAll("#homeTypeReel .hub-type-card").length === 32);
  const codes = [...d.querySelectorAll("#homeTypeReel .hub-type-card .hub-type-code")].map(e => e.textContent);
  check("前 16 同後 16 完全一樣；次序 NT/NF/SJ/SP（對應 4 個組別標籤）",
    JSON.stringify(codes.slice(0, 16)) === JSON.stringify(codes.slice(16, 32)) &&
    codes.slice(0, 16).join(",") === "INTJ,INTP,ENTJ,ENTP,INFJ,INFP,ENFJ,ENFP,ISTJ,ISFJ,ESTJ,ESFJ,ISTP,ISFP,ESTP,ESFP");
  check("版本卡 4 張", d.querySelectorAll("#versionList .ver-btn").length === 4);
  check("場景卡 4 張", d.querySelectorAll(".scenes-grid .scene-cell").length === 4);
  check("探索更多已收窄（2026-10-01 方案 A 後：5 格，場景攻略已收埋入百科）", d.querySelectorAll("#homeAccordion .home-acc-item").length === 5, d.querySelectorAll("#homeAccordion .home-acc-item").length);
  check("桌面維持 4×2：deep 格喺桌面層隱藏", /html\.dt \.home-acc-item\[data-acc="deep"\]\{display:none\}/.test(layer));
  check("鍵盤左右可以切滑輪（只喺 html.dt）", /ArrowLeft/.test(html) && /classList\.contains\("dt"\)/.test(html));
  for (const f of ["record.html", "stats.html", "privacy.html"]) {
    const sat = fs.readFileSync(path.join(REPO, f), "utf8");
    const satLayer = (sat.match(/<style id="desktop-layer">([\s\S]*?)<\/style>/) || [])[1] || "";
    check(f + " 有桌面層，而且寬度跟主站分級（920 / 1120）",
      satLayer.includes("--dt-w:min(920px,calc(100% - 40px))") &&
      satLayer.includes("--dt-w:min(1120px,calc(100% - 64px))"));
  }
  check("紀錄頁桌面歷史卡兩欄（平板仍然一欄）",
    /html\.dt #historyList\{grid-template-columns:1fr 1fr\}/.test(fs.readFileSync(path.join(REPO, "record.html"), "utf8")));

  // ---------- 3. 開關 ----------
  const root = d.documentElement;
  root.classList.remove("dt"); dom.window.eval(gate);
  check("1440px 電腦 → 開 .dt", root.classList.contains("dt"));
  Object.defineProperty(dom.window, "innerWidth", { value: 412, configurable: true });
  Object.defineProperty(dom.window, "screen", { value: { width: 412, height: 915 }, configurable: true });
  dom.window.eval(gate);
  check("412px 手機 → 唔開 .dt", !root.classList.contains("dt"));

  check("頁面零 JS error", errs.length === 0, errs[0]);
  console.log("\n" + (pass === total ? "✓ 全部通過（" + pass + " 項）" : "✗ " + (total - pass) + " 項失敗"));
  process.exit(pass === total ? 0 : 1);
}, 1500);
