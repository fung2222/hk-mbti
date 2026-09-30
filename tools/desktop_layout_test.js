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
const SECTIONS = ["home","profile","test","result","about","spectrum","hub","letter","type","social","socialArticle","romance","romanceArticle","method","privacy","upgrade","deep","deepChapter"];
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
check("桌面：16 型 4 欄 grid", /html\.dt \.home-type-reel\{[^}]*display:grid;grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/.test(layer));
check("桌面：scenes-grid 真係 display:grid（舊版漏咗）", /html\.dt \.scenes-grid\{display:grid/.test(layer));
check("桌面：探索更多真係 display:grid 4 欄", /html\.dt \.home-acc\{display:grid;grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/.test(layer));
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
  check("#dtNav 5 個入口都有 data-nav", links.length === 5);
  check("#dtNav 入口函數都存在",
    ["openHub", "openSpectrum", "openSocial", "goPickVersion", "openPrivacy"].every(f => typeof dom.window[f] === "function") &&
    !!nav.querySelector('a[href="./stats.html"]') && !!nav.querySelector('a[href="./record.html"]'));
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
  check("探索更多 8 格", d.querySelectorAll("#homeAccordion .home-acc-item").length === 8);

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
