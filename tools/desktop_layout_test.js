/**
 * 桌面／平板排版層結構測試（tools/desktop_layout_test.js）
 *
 * 排版層係靠「現有 DOM 結構」用 CSS grid 砌出嚟（唔改 HTML），
 * 所以一旦有人改咗主頁結構，就會靜靜地砌唔成 → 呢個測試守住嗰啲假設。
 * 執行：NODE_PATH=<jsdom 位置> node tools/desktop_layout_test.js
 */
const fs = require("fs");
const path = require("path");
const { JSDOM, VirtualConsole } = require("jsdom");

const REPO = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(REPO, "index.html"), "utf8");
const layer = html.match(/<style id="desktop-layer">([\s\S]*?)<\/style>/)[1];
const gate = html.match(/<script>([\s\S]*?classList\.add\("dt"\)[\s\S]*?)<\/script>/)[1];

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

// ---------- 1. CSS 層嘅硬性條件 ----------
check("排版層每條規則都有 html.dt 前綴（.dt 唔開就完全唔生效）",
  layer.split("\n").filter(l => /^\s*#app/.test(l)).length === 0,
  "有冇前綴嘅 #app 規則");
check("平板外框 720px", /html\.dt #app\{max-width:720px/.test(layer));
check("桌面外框 1440px", /html\.dt #app\{max-width:1440px/.test(layer));
check("桌面 hero 用 display:contents 拆散", /html\.dt \.home-hero\{display:contents\}/.test(layer));
check("桌面 #home 用 grid 兩欄", /html\.dt #home\{[\s\S]{0,300}grid-template-columns:minmax\(0,1fr\) minmax\(0,1\.0\d?fr\)/.test(layer));
check("桌面有全闊色帶（50vw 技術）", /margin-left:calc\(50% - 50vw\)/.test(layer));
check("桌面場景卡 4 欄", /html\.dt \.scenes-grid\{grid-template-columns:repeat\(4,1fr\)/.test(layer));
check("桌面「探索更多」2 欄、冇髮線（app 風，唔似表格）",
  /html\.dt \.home-acc\{grid-template-columns:repeat\(2,1fr\)/.test(layer) &&
  /html\.dt \.home-acc-item\{border:0;padding:0\}/.test(layer) &&
  !/min-width:1400px/.test(layer));
check("非主頁各版保持 640px 窄欄", /html\.dt #app > section:not\(#home\)\{max-width:640px/.test(layer));
check("桌面「探索更多」唔摺疊（max-height:none，避免展開時其他欄跳位）",
  /html\.dt \.home-acc-body,\s*\n\s*html\.dt \.home-acc-item\.open \.home-acc-body\{max-height:none/.test(layer));
check("桌面隱藏風琴 ▼ 箭嘴", /html\.dt \.home-acc-chev\{display:none\}/.test(layer));
check("桌面風琴標題唔可以撳（pointer-events:none，保留手機摺疊）", /html\.dt \.home-acc-head\{pointer-events:none/.test(layer));
check("16 型矩陣跨兩行並垂直居中", /html\.dt \.home-type-reel-wrap\{grid-column:2;grid-row:2 \/ span 2;align-self:center/.test(layer));
check("手機摺疊 JS 仍然存在（toggleHomeAcc）", /toggleHomeAcc = function/.test(html));
const outside = (() => {
  let nc = layer.replace(/\/\*[\s\S]*?\*\//g, "");
  return nc.replace(/@media[^{]*\{(?:[^{}]|\{[^{}]*\})*\}/g, "").trim();
})();
check("media query 以外零殘留規則（手機 <768px 唔受影響）", outside === "", JSON.stringify(outside.slice(0, 80)));

// ---------- 2. DOM 結構假設 ----------
const vc = new VirtualConsole();
const errs = [];
vc.on("jsdomError", e => { const m = String(e.message || e); if (!/scrollTo|Not implemented/.test(m)) errs.push(m.slice(0, 90)); });
const dom = new JSDOM(inlineLocal(html), {
  url: "https://fung2222.github.io/hk-mbti/", runScripts: "dangerously", pretendToBeVisual: true, virtualConsole: vc,
  beforeParse(w) { Object.defineProperty(w, "innerWidth", { value: 1440, configurable: true }); w.alert = () => {}; w.confirm = () => false; },
});
setTimeout(() => {
  const d = dom.window.document;
  const home = d.getElementById("home");
  check("#home 存在", !!home);
  const hero = home.querySelector(":scope > .home-hero");
  check(".home-hero 係 #home 直系子女（display:contents 要靠呢點）", !!hero);
  const first = hero && hero.firstElementChild;
  check(".home-hero 第一個子女係 logo 列（要跨兩欄）", !!(first && first.querySelector("#homeLogoLink")));
  check("#homeTypeReelWrap 喺 .home-hero 內（要放右欄）", !!(hero && hero.querySelector("#homeTypeReelWrap")));
  check("#homeBelow 係 #home 直系子女（版本卡要放左欄）", !!(home.querySelector(":scope > #homeBelow")));
  check(".scenes-bleed 係 #home 直系子女（全闊場景帶）", !!(home.querySelector(":scope > .scenes-bleed")));
  check("風琴 wrapper 係 #home > div.mb-4（要跨兩欄）", !!(home.querySelector(":scope > div.mb-4 > #homeAccordion")));
  check(".home-more-up-wrap 係 #home 直系子女", !!(home.querySelector(":scope > .home-more-up-wrap")));
  check("16 型色牌 32 張（前 16 唯一、後 16 重複）", d.querySelectorAll("#homeTypeReel .hub-type-card").length === 32);
  const codes = [...d.querySelectorAll("#homeTypeReel .hub-type-card .hub-type-code")].map(e => e.textContent);
  check("前 16 同後 16 完全一樣（隱藏 n+17 之後剩 16 張）", JSON.stringify(codes.slice(0, 16)) === JSON.stringify(codes.slice(16, 32)));
  check("版本卡 4 張", d.querySelectorAll("#versionList .ver-btn").length === 4);
  check("場景卡 4 張", d.querySelectorAll(".scenes-grid .scene-cell").length === 4);

  // ---------- 3. 開關：桌面開、手機關 ----------
  const root = d.documentElement;
  root.classList.remove("dt"); dom.window.eval(gate);
  check("1440px 電腦 → 開 .dt（桌面排版生效）", root.classList.contains("dt"));
  Object.defineProperty(dom.window, "innerWidth", { value: 412, configurable: true });
  Object.defineProperty(dom.window, "screen", { value: { width: 412, height: 915 }, configurable: true });
  dom.window.eval(gate);
  check("412px 手機 → 唔開 .dt（手機排版）", !root.classList.contains("dt"));

  check("頁面零 JS error", errs.length === 0, errs[0]);
  console.log("\n" + (pass === total ? "✓ 全部通過（" + pass + " 項）" : "✗ " + (total - pass) + " 項失敗"));
  process.exit(pass === total ? 0 : 1);
}, 1500);
