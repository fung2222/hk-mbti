/* 開機／下拉重整：模擬真實載入，檢查有冇畫面（唔可以空白） */
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const root = path.resolve(__dirname, "../..");
const src = fs.readFileSync(path.join(root, "index.html"), "utf8");
// typeScenes 獨立分頁已拆（2026-10-02）→ 場景攻略而家係人格頁 #type 嘅一個 tab
const SECTIONS = ["home","profile","test","result","about","hub","dims","letter","type","socialArticle","romanceArticle","method","privacy","upgrade","deep","deepChapter"];

let pass = 0, fail = 0;
const chk = (n, ok, got) => { if (ok) pass++; else { fail++; console.log("✗ " + n + "   <- " + (got === undefined ? "" : got)); } };

function bootSync(label, opts) { return boot(label, opts); }

function boot(label, { lastSection, lastNav, navType = "reload", hubMode } = {}) {
  const dom = new JSDOM(src, {
    runScripts: "dangerously",
    pretendToBeVisual: true,
    url: "https://example.com/",
    beforeParse(w) {
      // 模擬 reload 前嘅 sessionStorage
      if (lastSection) { try { w.sessionStorage.setItem("hkmbti_last_section", lastSection); } catch (e) {} }
      if (lastNav) { try { w.sessionStorage.setItem("hkmbti_last_nav", JSON.stringify(lastNav)); } catch (e) {} }
      if (hubMode) { try { w.sessionStorage.setItem("hkmbti_hub_mode", hubMode); } catch (e) {} }
      w.performance.getEntriesByType = function (t) { return t === "navigation" ? [{ type: navType }] : []; };
      w.scrollTo = function () {};
      // jsdom 唔會 load 外部 script → inject 場景資料（模擬真機已載入）
      const _A = { ENFP: { body: "b" } };
      w.SOCIAL = { WhatsAppGroup: { name: "WhatsApp 群組", desc: "d", articles: _A }, FamilyGathering: { name: "親戚飯局", desc: "d", articles: _A }, TeaFriend: { name: "飲茶吹水朋友", desc: "d", articles: _A }, GroupProject: { name: "Group Project 隊友", desc: "d", articles: _A }, Roommate: { name: "室友", desc: "d", articles: _A }, Workplace: { name: "返工同事", desc: "d", articles: _A }, 失戀陪: { name: "失戀時陪佢", desc: "d", articles: _A } };
      w.ROMANCE = { 拍拖: { name: "點同佢拍拖", desc: "d", articles: _A }, 吵架: { name: "同佢點收科", desc: "d", articles: _A }, 分手: { name: "點同佢分手", desc: "d", articles: _A } };
      w.TYPES = { ENFP: { name: "調停者" }, INTJ: { name: "建築師" } };
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
  boot("下拉重整（原本停百科）", { lastSection: "hub", lastNav: { id: "hub" }, hubMode: "scene" }),
  boot("下拉重整（原本停該型場景頁）", { lastSection: "typeScenes", lastNav: { id: "typeScenes", type: "ENFP" } }),   // 舊 sessionStorage 值 → 要還原去人格頁場景 tab
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
  // 註：load 事件係非同步，呢刻 js-boot 仲未移除係正常 → 只做資訊，真正驗證喺下面 900ms 段
}

setTimeout(() => {
  let p2 = 0, f2 = 0;
  for (const c of cases) {
    const visible = SECTIONS.filter(s => { const el = c.d.getElementById(s); return el && !el.classList.contains("hidden"); });
    const bootOff = !c.d.body.classList.contains("js-boot");
    console.log("[" + c.label + "]  顯示中: " + (visible.join(", ") || "(冇！空白頁)") + "  | js-boot 已除: " + bootOff);
    if (visible.length > 0) p2++; else { f2++; console.log("  ✗ 呢個情況會空白！"); }
    if (bootOff) p2++; else { f2++; console.log("  ✗ js-boot 未除 → #app opacity:0 → 睇落空白！"); }
    // JS render 嘅頁面：下拉重整後內容必須仲在（Roy 2026-10-01 報「場景攻略下拉後冇晒資料」）
    if (c.label.includes("原本停百科")) {
      // 百科場景模式（下拉重整後要仲 render 得出 10 個場景卡）
      const n = c.d.querySelectorAll("#hubSceneList .scene-go-row").length;
      if (n === 10) p2++; else { f2++; console.log("  ✗ 百科「由場景睇」下拉後冇晒資料！場景卡 = " + n + "（預期 10）"); }
      const mode = c.d.getElementById("hubSceneMode");
      const typeMode = c.d.getElementById("hubTypeMode");
      if (mode && !mode.classList.contains("hidden") && typeMode && typeMode.classList.contains("hidden")) p2++;
      else { f2++; console.log("  ✗ 下拉重整後模式唔一致（應該停喺「由場景睇」）"); }
    }
    if (c.label.includes("該型場景")) {
      const n = c.d.querySelectorAll("#typeSceneList .scene-go-row").length;
      if (n === 10) p2++; else { f2++; console.log("  ✗ 該型場景 tab 下拉後內容冇晒！場景卡 = " + n + "（預期 10）"); }
      const panel = c.d.getElementById("typeTabScene");
      if (panel && !panel.classList.contains("hidden")) p2++;
      else { f2++; console.log("  ✗ 下拉重整後冇停喺場景 tab"); }
    }
    if (c.label.includes("維度詳解")) {
      const n = c.d.querySelectorAll("#dims .hub-letter-list > div").length;
      if (n === 6) p2++; else { f2++; console.log("  ✗ 維度詳解下拉後內容冇晒！段落 = " + n + "（預期 6）"); }
    }
  }
  console.log("\n" + (f2 === 0 ? "===== 全部通過（" + p2 + "/" + p2 + "）=====" : "===== 有失敗（" + p2 + "/" + (p2 + f2) + "）====="));
  process.exit(f2 === 0 ? 0 : 1);
}, 900);
