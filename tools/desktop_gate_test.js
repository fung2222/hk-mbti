/**
 * 桌面／平板層開關測試（tools/desktop_gate_test.js）
 *
 * 驗證 index.html <head> 嗰段 script 對各情境嘅判斷：
 *   .dt → 開桌面／平板排版（只應該喺真大螢幕開）
 *   .dm → 手機「桌面版網站」補償（html 加 zoom，按裝置真實寬度重新渲染）
 * 執行：NODE_PATH=<jsdom 位置> node tools/desktop_gate_test.js
 */
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const REPO = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(REPO, "index.html"), "utf8");
const gate = html.match(/<script>([\s\S]*?classList\.add\("dm"\)[\s\S]*?)<\/script>/)[1];

// iw=innerWidth, sw/sh=screen 尺寸, sc=visualViewport.scale
const SCEN = [
  { n: "手機（正常模式）",               iw: 412,  sw: 412,  sh: 915,  sc: 1,    dt: false, dm: false },
  { n: "手機（桌面版網站模式）",         iw: 980,  sw: 412,  sh: 915,  sc: 0.42, dt: false, dm: true  },
  { n: "手機（桌面模式 + screen 吹水）", iw: 980,  sw: 980,  sh: 1743, sc: 0.42, dt: false, dm: true  },
  { n: "手機（橫向）",                   iw: 915,  sw: 915,  sh: 412,  sc: 1,    dt: false, dm: false },
  { n: "平板 iPad 直向",                 iw: 810,  sw: 810,  sh: 1080, sc: 1,    dt: true,  dm: false },
  { n: "平板 iPad 橫向",                 iw: 1080, sw: 1080, sh: 810,  sc: 1,    dt: true,  dm: false },
  { n: "電腦 1440",                      iw: 1440, sw: 1920, sh: 1080, sc: 1,    dt: true,  dm: false },
  { n: "電腦窗口縮到 700（窄）",          iw: 700,  sw: 1920, sh: 1080, sc: 1,    dt: false, dm: false },
  { n: "電腦窗口 1024（平板臨界）",       iw: 1024, sw: 1920, sh: 1080, sc: 1,    dt: true,  dm: false },
];

let pass = 0, total = 0;
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
  const gotDm = root.classList.contains("dm");
  const ok = gotDt === s.dt && gotDm === s.dm;
  total++; if (ok) pass++;
  console.log(
    (ok ? "✓" : "✗") + " " + s.n.padEnd(26) +
    " → 桌面排版 " + (gotDt ? "開" : "關") +
    "（.dt）｜桌面模式補償 " + (gotDm ? "開 zoom=" + root.style.zoom : "關") +
    (ok ? "" : "  ← 預期：桌面排版 " + (s.dt ? "開" : "關") + "、補償 " + (s.dm ? "開" : "關"))
  );
  if (s.n === "電腦 1440") {   // 即場 resize：電腦拖窄窗口應該即刻唔再套用桌面排版
    Object.defineProperty(dom.window, "innerWidth", { value: 700, configurable: true });
    dom.window.dispatchEvent(new dom.window.Event("resize"));
    const after = root.classList.contains("dt");
    total++; if (after === false) pass++;
    console.log((after === false ? "✓" : "✗") + " 同一部電腦拖窄窗口（1440→700）→ 桌面排版 " + (after ? "開" : "關") + "（應該關）");
  }
  dom.window.close();
}
console.log("\n" + (pass === total ? "✓ 全部 " + pass + " 個情境正確" : "✗ " + (total - pass) + " 個情境有問題"));
process.exit(pass === total ? 0 : 1);
