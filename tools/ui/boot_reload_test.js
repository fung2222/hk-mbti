/* 開機／下拉重整：模擬真實載入，檢查有冇畫面（唔可以空白） */
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const root = path.resolve(__dirname, "../..");
const src = fs.readFileSync(path.join(root, "index.html"), "utf8");
const SECTIONS = ["home","profile","test","result","about","spectrum","hub","dims","scenes","letter","type","social","socialArticle","romance","romanceArticle","method","privacy","upgrade","deep","deepChapter"];

let pass = 0, fail = 0;
const chk = (n, ok, got) => { if (ok) pass++; else { fail++; console.log("✗ " + n + "   <- " + (got === undefined ? "" : got)); } };

function bootSync(label, opts) { return boot(label, opts); }

function boot(label, { lastSection, lastNav, navType = "reload" } = {}) {
  const dom = new JSDOM(src, {
    runScripts: "dangerously",
    pretendToBeVisual: true,
    url: "https://example.com/",
    beforeParse(w) {
      // 模擬 reload 前嘅 sessionStorage
      if (lastSection) { try { w.sessionStorage.setItem("hkmbti_last_section", lastSection); } catch (e) {} }
      if (lastNav) { try { w.sessionStorage.setItem("hkmbti_last_nav", JSON.stringify(lastNav)); } catch (e) {} }
      w.performance.getEntriesByType = function (t) { return t === "navigation" ? [{ type: navType }] : []; };
      w.scrollTo = function () {};
    }
  });
  const d = dom.window.document;
  const visible = SECTIONS.filter(s => { const el = d.getElementById(s); return el && !el.classList.contains("hidden"); });
  const bootOff = !d.body.classList.contains("js-boot");
  const appReady = (d.getElementById("app") || {}).classList ? d.getElementById("app").classList.contains("js-ready") : false;
  return { label, visible, bootOff, appReady, d };
}

const cases = [
  boot("第一次開 app（sessionStorage 空）", {}),
  boot("下拉重整（原本停主頁）", { lastSection: "home", lastNav: { id: "home" } }),
  boot("下拉重整（原本停百科）", { lastSection: "hub", lastNav: { id: "hub" } }),
  boot("下拉重整（原本停場景攻略）", { lastSection: "scenes", lastNav: { id: "scenes" } }),
  boot("下拉重整（原本停維度詳解）", { lastSection: "dims", lastNav: { id: "dims" } }),
  boot("下拉重整（原本停人格頁）", { lastSection: "type", lastNav: { id: "type", type: "ENFP" } }),
  boot("下拉重整（原本停深入分析）", { lastSection: "deep", lastNav: { id: "deep" } }),
  boot("下拉重整（原本停相處文章）", { lastSection: "socialArticle", lastNav: { id: "socialArticle", sKey: "WhatsAppGroup", articleType: "ENFP" } }),
  boot("下拉重整（last_section 壞值）", { lastSection: "someGarbageId", lastNav: { id: "someGarbageId" } }),
  boot("下拉重整（last_nav 壞 JSON）", { lastSection: "hub", lastNav: null }),
];

let done = 0;
for (const c of cases) {
  console.log("\n[" + c.label + "]  顯示中: " + (c.visible.join(", ") || "(冇！空白頁)") + "  | js-boot 已除: " + c.bootOff + " | js-ready: " + c.appReady);
  chk(c.label + " → 有畫面（唔會空白）", c.visible.length > 0, "顯示中 = " + (c.visible.join(", ") || "冇"));
  chk(c.label + " → js-boot 已移除（唔會 opacity:0）", c.bootOff);
}

setTimeout(() => {
  let p2 = 0, f2 = 0;
  for (const c of cases) {
    const visible = SECTIONS.filter(s => { const el = c.d.getElementById(s); return el && !el.classList.contains("hidden"); });
    const bootOff = !c.d.body.classList.contains("js-boot");
    console.log("[" + c.label + "]  顯示中: " + (visible.join(", ") || "(冇！空白頁)") + "  | js-boot 已除: " + bootOff);
    if (visible.length > 0) p2++; else { f2++; console.log("  ✗ 呢個情況會空白！"); }
    if (bootOff) p2++; else { f2++; console.log("  ✗ js-boot 未除 → #app opacity:0 → 睇落空白！"); }
  }
  console.log("\n" + (f2 === 0 ? "===== 全部通過（" + p2 + "/" + p2 + "）=====" : "===== 有失敗（" + p2 + "/" + (p2 + f2) + "）====="));
  process.exit(f2 === 0 ? 0 : 1);
}, 900);
