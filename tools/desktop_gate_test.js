/**
 * 桌面／平板層開關測試（tools/desktop_gate_test.js）
 *
 * 唯一判斷：<html class="dt">
 *   .dt = viewport ≥768px 而且實體螢幕唔細（≥680×600）、而且頁面冇被縮細
 * 冇 .dt → 一定係手機排版。
 *
 * 歷史教訓：曾經有「手機桌面版網站補償」（html zoom + .dm 改 hero 高度），
 * 結果手機開「桌面版網站」時 hero 被壓扁、卡滑輪貼上大標題、底部多空間。
 * 永久移除，唔好再加任何改手機排版嘅補償。
 *
 * 執行：NODE_PATH=<jsdom 位置> node tools/desktop_gate_test.js
 */
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const REPO = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(REPO, "index.html"), "utf8");
const gate = html.match(/<script>([\s\S]*?classList\.add\("dt"\)[\s\S]*?)<\/script>/)[1];

// iw=innerWidth, sw/sh=screen 尺寸, sc=visualViewport.scale
const SCEN = [
  { n: "手機（正常模式）",                 iw: 412,  sw: 412,  sh: 915,  sc: 1,    dt: false },
  { n: "手機（screen.width 報細 320）",    iw: 412,  sw: 320,  sh: 800,  sc: 1,    dt: false },
  { n: "手機（桌面版網站模式 980）",       iw: 980,  sw: 412,  sh: 915,  sc: 0.42, dt: false },
  { n: "手機（桌面模式 + screen 吹水）",   iw: 980,  sw: 980,  sh: 1743, sc: 0.42, dt: false },
  { n: "手機（橫向）",                     iw: 915,  sw: 915,  sh: 412,  sc: 1,    dt: false },
  { n: "手機（大芒 700 闊）",              iw: 700,  sw: 700,  sh: 1500, sc: 1,    dt: false },
  { n: "平板 iPad 直向",                   iw: 810,  sw: 810,  sh: 1080, sc: 1,    dt: true  },
  { n: "平板 iPad 橫向",                   iw: 1080, sw: 1080, sh: 810,  sc: 1,    dt: true  },
  { n: "電腦 1440",                        iw: 1440, sw: 1920, sh: 1080, sc: 1,    dt: true  },
  { n: "電腦窗口縮到 700（窄）",            iw: 700,  sw: 1920, sh: 1080, sc: 1,    dt: false },
  { n: "電腦窗口 1024（平板臨界）",         iw: 1024, sw: 1920, sh: 1080, sc: 1,    dt: true  },
  { n: "電腦（頁面被縮細 sc 0.8）",         iw: 1440, sw: 1920, sh: 1080, sc: 0.8,  dt: false },
];

let pass = 0, total = 0;
const chk = (ok, label) => { total++; if (ok) pass++; console.log((ok ? "✓ " : "✗ ") + label); return ok; };

console.log("=== 靜態檢查 ===");
chk(!/desktop-mode-fix/.test(html), "index.html 冇 .dm 補償 CSS 區塊");
chk(!/style\.zoom/.test(html), "index.html 冇任何 html zoom（改手機排版嘅補償）");
chk(/min-height:100dvh/.test(html), "主頁 hero 原規則（100dvh）仍在，冇被改");
chk(/\.home-hero-mbti\{font-size:clamp/.test(html), "hero 大標題原 clamp 字級仍在，冇被改");

console.log("\n=== 開關情境 ===");
for (const s of SCEN) {
  const dom = new JSDOM("<!doctype html><html><head></head><body></body></html>", {
    url: "https://fung2222.github.io/hk-mbti/",
    runScripts: "dangerously",
    pretendToBeVisual: true,
    beforeParse(w) {
      Object.defineProperty(w, "innerWidth", { value: s.iw, configurable: true });
      Object.defineProperty(w, "screen", { value: { width: s.sw, height: s.sh }, configurable: true });
      w.visualViewport = { scale: s.sc, width: s.iw, height: s.iw * 0.6 };
    },
  });
  dom.window.eval(gate);
  const root = dom.window.document.documentElement;
  const gotDt = root.classList.contains("dt");
  const ok = gotDt === s.dt && !root.classList.contains("dm") && !root.style.zoom;
  chk(ok, s.n.padEnd(26) + " → 桌面排版 " + (gotDt ? "開" : "關") +
      "（.dt）｜補償 " + ((root.classList.contains("dm") || root.style.zoom) ? "有 ✗" : "無") +
      (ok ? "" : "  ← 預期：桌面排版 " + (s.dt ? "開" : "關")));
  if (s.n === "電腦 1440") {   // 即場 resize：電腦拖窄窗口應該即刻唔再套用桌面排版
    Object.defineProperty(dom.window, "innerWidth", { value: 700, configurable: true });
    dom.window.dispatchEvent(new dom.window.Event("resize"));
    chk(root.classList.contains("dt") === false, "同一部電腦拖窄窗口（1440→700）→ 桌面排版 關");
  }
  dom.window.close();
}
console.log("\n" + (pass === total ? "✓ 全部 " + pass + " 項正確" : "✗ " + (total - pass) + " 項有問題"));
process.exit(pass === total ? 0 : 1);
