/**
 * 桌面／平板層開關測試（tools/desktop_gate_test.js）
 *
 * 兩個 class：
 *   .dt → 開桌面／平板排版（viewport ≥768px 而且實體螢幕唔細）
 *   .dm → 手機被逼用寬虛擬視窗（Chrome「桌面版網站」）時，用裝置真實寬度還原
 *
 * 鐵律（中過兩次）：
 *   1. 任何會改手機排版嘅補償，觸發條件一定要窄到「正常手機永遠唔中」。
 *      條件必須包含「實體螢幕細（screen.width <680 或 screen.height <600）」；
 *      亦要有 fallback：頁面被縮到細螢幕闊度（vw × sc < 700）都算。
 *      曾經冇呢個條件 → 只寫 `vw > sw*1.25` → 手機正常模式都中招（zoom + hero 被壓）。
 *   2. .dm 只准還原 app 原本 3 條 viewport 單位規則，唔准改任何其他版面。
 *
 * 執行：NODE_PATH=<jsdom 位置> node tools/desktop_gate_test.js
 */
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const REPO = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(REPO, "index.html"), "utf8");
const gate = html.match(/<script>([\s\S]*?classList\.add\("dt"\)[\s\S]*?)<\/script>/)[1];
const dmCss = html.match(/<style id="desktop-mode-fix">([\s\S]*?)<\/style>/)[1];

let pass = 0, total = 0;
const chk = (ok, label) => { total++; if (ok) pass++; console.log((ok ? "✓ " : "✗ ") + label); return ok; };

console.log("=== 靜態不變式（5 版都要）===");
// 每個 page：① 同一段 gate script（改一次要 5 版一致）② app 自己每條 viewport 單位規則
// 都要喺 .dm 塊有對應還原（否則桌面版網站模式下會爆）
const PAGES = ["index.html", "record.html", "stats.html", "tee.html", "privacy.html"];
const gateOf = (h) => (h.match(/<script>([\s\S]*?classList\.add\("dt"\)[\s\S]*?)<\/script>/) || [])[1] || "";
chk(PAGES.every((f) => gateOf(fs.readFileSync(path.join(REPO, f), "utf8")) === gate),
    "5 版 gate script 完全一致");
for (const f of PAGES) {
  const h = fs.readFileSync(path.join(REPO, f), "utf8");
  const own = h.replace(/<style id="desktop-layer">[\s\S]*?<\/style>/, "")
               .replace(/<style id="desktop-mode-fix">[\s\S]*?<\/style>/, "");
  const dm = (h.match(/<style id="desktop-mode-fix">([\s\S]*?)<\/style>/) || [])[1] || "";
  const rules = [];
  for (const st of own.match(/<style[^>]*>[\s\S]*?<\/style>/g) || []) {
    for (const m of st.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const sel = m[1].trim().split("\n").pop().trim();
      if (/(?<![\d.])\d+(?:\.\d+)?(?:vw|vh|dvh|svh|lvh)\b/.test(m[2])) rules.push(sel);
    }
  }
  const missing = rules.filter((sel) => !new RegExp("html\\.dm " + sel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\{").test(dm));
  chk(dm !== "" && missing.length === 0,
      f + "：viewport 單位規則 " + rules.length + " 條，全部有 .dm 還原" + (missing.length ? "（缺 " + missing.join(",") + "）" : ""));
}
chk(/min-height:100dvh/.test(html), "app 原本 hero 100dvh 仍在（手機基準冇改）");

console.log("\n=== 開關情境 ===");
// iw/ih = innerWidth/innerHeight, sw/sh = screen, sc = visualViewport.scale
const SCEN = [
  { n: "手機（正常模式）",             iw: 412,  ih: 915,  sw: 412,  sh: 915,  sc: 1,    dt: false, dm: false },
  { n: "手機（screen.width 報細）",    iw: 412,  ih: 915,  sw: 320,  sh: 800,  sc: 1,    dt: false, dm: false },
  { n: "手機（桌面版網站 sc=1）",      iw: 980,  ih: 2200, sw: 412,  sh: 915,  sc: 1,    dt: false, dm: true  },
  { n: "手機（桌面版網站 sc=0.42）",   iw: 980,  ih: 2200, sw: 412,  sh: 915,  sc: 0.42, dt: false, dm: true  },
  { n: "手機（桌面模式+screen 吹水）", iw: 980,  ih: 2200, sw: 980,  sh: 1743, sc: 0.42, dt: false, dm: true  },
  { n: "手機（橫向 915×412）",         iw: 915,  ih: 412,  sw: 915,  sh: 412,  sc: 1,    dt: false, dm: false },
  { n: "手機（大芒 700 闊）",           iw: 700,  ih: 1500, sw: 700,  sh: 1500, sc: 1,    dt: false, dm: false },
  { n: "平板 iPad 直向",               iw: 810,  ih: 1080, sw: 810,  sh: 1080, sc: 1,    dt: true,  dm: false },
  { n: "平板 iPad 橫向",               iw: 1080, ih: 810,  sw: 1080, sh: 810,  sc: 1,    dt: true,  dm: false },
  { n: "電腦 1440",                    iw: 1440, ih: 900,  sw: 1920, sh: 1080, sc: 1,    dt: true,  dm: false },
  { n: "電腦（頁面縮細 sc=0.8）",       iw: 1440, ih: 900,  sw: 1920, sh: 1080, sc: 0.8,  dt: true,  dm: false },
  { n: "電腦窗口縮到 700",              iw: 700,  ih: 900,  sw: 1920, sh: 1080, sc: 1,    dt: false, dm: false },
  { n: "電腦窗口 1024",                iw: 1024, ih: 900,  sw: 1920, sh: 1080, sc: 1,    dt: true,  dm: false },
];

for (const s of SCEN) {
  const dom = new JSDOM("<!doctype html><html><head></head><body></body></html>", {
    url: "https://fung2222.github.io/hk-mbti/",
    runScripts: "dangerously",
    pretendToBeVisual: true,
    beforeParse(w) {
      Object.defineProperty(w, "innerWidth", { value: s.iw, configurable: true });
      Object.defineProperty(w, "innerHeight", { value: s.ih, configurable: true });
      Object.defineProperty(w, "screen", { value: { width: s.sw, height: s.sh }, configurable: true });
      w.visualViewport = { scale: s.sc, width: s.iw, height: s.ih };
    },
  });
  dom.window.eval(gate);
  const root = dom.window.document.documentElement;
  const gotDt = root.classList.contains("dt");
  const gotDm = root.classList.contains("dm");
  const zoom = parseFloat(root.style.zoom || "1") || 1;
  const ok = gotDt === s.dt && gotDm === s.dm && (s.dm ? zoom > 1.02 : zoom === 1);
  chk(ok, s.n.padEnd(26) + " → 桌面排版 " + (gotDt ? "開" : "關") +
      "｜還原 " + (gotDm ? "開 zoom=" + zoom.toFixed(2) : "關") +
      (ok ? "" : "  ← 預期：桌面排版 " + (s.dt ? "開" : "關") + "、還原 " + (s.dm ? "開" : "關")));

  // 桌面版網站模式：還原之後「1 CSS px ≈ 1 裝置 px」→ 版面闊度要等於裝置真實闊度
  if (s.n === "手機（桌面版網站 sc=1）" || s.n === "手機（桌面版網站 sc=0.42）") {
    const vwVar = parseFloat(root.style.getPropertyValue("--dm-vw"));
    const vhVar = parseFloat(root.style.getPropertyValue("--dm-vh"));
    chk(vwVar === 412 && vhVar === 915,
        s.n + "：還原變數用裝置真實尺寸（--dm-vw 412 / --dm-vh 915，實際 " + vwVar + "/" + vhVar + "）");
    chk(Math.abs(s.iw / zoom - 412) < 1.5,
        s.n + "：還原後版面闊度 ≈ 412px（等於正常手機，實際 " + (s.iw / zoom).toFixed(1) + "）");
  }
  if (s.n === "電腦 1440") {   // 即場 resize：電腦拖窄窗口應該即刻唔再套用桌面排版
    Object.defineProperty(dom.window, "innerWidth", { value: 700, configurable: true });
    dom.window.dispatchEvent(new dom.window.Event("resize"));
    chk(root.classList.contains("dt") === false, "同一部電腦拖窄窗口（1440→700）→ 桌面排版 關");
  }
  dom.window.close();
}
console.log("\n" + (pass === total ? "✓ 全部 " + pass + " 項正確" : "✗ " + (total - pass) + " 項有問題"));
process.exit(pass === total ? 0 : 1);
