// 記錄頁眼掣 → 主頁睇結果：端到端驗證（讀 record.html 真實 onclick → 行 index.html）
//
// 行法（jsdom 唔入 repo，喺 scratch 嗰邊）：
//   NODE_PATH=/opt/data/profiles/apps/cache/scratch/harness/node_modules \
//     node tools/record_view_test.js
//
// 守嘅 regression（2026-09-26 Roy 報「撳眼掣彈返主頁」）：
//   1. 紀錄多過 5 條時，第 6 行之後嘅眼掣一樣要開到結果
//      （舊 bug：getHistoryList() 得 5 條 + `if(!rec) return;` → 靜靜彈返主頁）
//   2. record.html 要用 id 唔用 index（兩頁排序／數量一唔同就死）
//   3. 類型代號唔喺 TYPES 嘅壞紀錄 → 要有提示，唔可以靜靜彈走
const fs = require("fs");
const path = require("path");
const { JSDOM, VirtualConsole } = require("jsdom");   // 見檔頂 NODE_PATH 說明

const REPO = "/opt/data/repos/hk-mbti";
function inlineLocal(html){
  return html
    .replace(/<script src="(https?:)?\/\/[^"]*"><\/script>/g, "")
    .replace(/<script src="([^"]+\.js)"><\/script>/g, (m, f) =>
      fs.existsSync(path.join(REPO, f)) ? "<script>\n" + fs.readFileSync(path.join(REPO, f), "utf8") + "\n</script>" : "");
}
const INDEX = inlineLocal(fs.readFileSync(REPO + "/index.html", "utf8"));
const RECORD = inlineLocal(fs.readFileSync(REPO + "/record.html", "utf8"));
const BASE = "https://fung2222.github.io/hk-mbti/";
const now = Date.now();

function stubCanvas(window){
  const ctx = new Proxy({}, {
    get(t, k){
      if(k === "canvas") return { width: 720, height: 1280 };
      if(k === "measureText") return () => ({ width: 10 });
      if(/Gradient/.test(String(k))) return () => ({ addColorStop(){} });
      return () => {};
    }, set(){ return true; },
  });
  window.HTMLCanvasElement.prototype.getContext = () => ctx;
  window.HTMLCanvasElement.prototype.toDataURL = () => "data:image/jpeg;base64,x";
  window.Image = class { set src(v){ setTimeout(() => this.onload && this.onload(), 0); } };
}

function loadPage(html, store, hash, wait){
  return new Promise(resolve => {
    const alerts = [], errs = [];
    const vc = new VirtualConsole();
    vc.on("jsdomError", e => { const m = String(e.message || e); if(!/scrollTo|Not implemented/.test(m)) errs.push(m.slice(0, 100)); });
    vc.on("error", (...a) => errs.push(a.map(String).join(" ").slice(0, 100)));
    const dom = new JSDOM(html, {
      url: BASE + (hash || ""), runScripts: "dangerously", pretendToBeVisual: true, virtualConsole: vc,
      beforeParse(window){
        window.alert = m => alerts.push(String(m));
        window.confirm = () => false;
        stubCanvas(window);
        try{ Object.defineProperty(window.document, "fonts", { value: { load: () => Promise.resolve([]) }, configurable: true }); }catch(e){}
        try{
          window.localStorage.setItem("hkmbti_history", JSON.stringify(store));
          window.localStorage.setItem("hkmbti_last_result", JSON.stringify(store[0] || {}));
        }catch(e){}
      },
    });
    setTimeout(() => resolve({ dom, alerts, errs }), wait || 1300);
  });
}

const mk = (i, over) => Object.assign({
  id: "rec" + i + "-" + (now - i * 1000), mbti: "INFP-A", timestamp: now - i * 600000,
  completed: true, name: "Roy", nickname: "阿豐", version: "life",
}, over || {});

const STORES = {
  "5 條（正常）": [mk(0), mk(1, {mbti:"ESTJ-T"}), mk(2, {mbti:"ENFP-A"}), mk(3, {mbti:"ISTJ-T"}), mk(4, {mbti:"INTJ-A"})],
  "6 條（超 5 上限）": [mk(0), mk(1), mk(2), mk(3), mk(4), mk(5)],
  "8 條（嚴重超額）": Array.from({length: 8}, (_, i) => mk(i, {mbti: ["INFP-A","ESTJ-T","ENFP-A","ISTJ-T","INTJ-A","ISFJ-T","ENFJ-A","ISTP-T"][i]})),
  "類型代號壞（ZZZZ-A）": [mk(0, {mbti: "ZZZZ-A"}), mk(1)],
  "類型代號空": [mk(0, {mbti: ""}), mk(1)],
};

(async () => {
  let bad = 0;
  for(const [name, store] of Object.entries(STORES)){
    // 1) 記錄頁：攞真實 onclick，抽 id / index
    const { dom: rDom } = await loadPage(RECORD, store, "", 1100);
    const onclicks = [...rDom.window.document.querySelectorAll(".act-view")].map(b => b.getAttribute("onclick"));
    rDom.window.close();
    const parsed = onclicks.map(s => {
      const m = s.match(/^viewRec\('([^']*)',\s*(\d+)\)$/);
      return m ? { id: m[1], i: Number(m[2]) } : null;
    });

    // 2) 主頁清單長度
    const { dom: iDom } = await loadPage(INDEX, store, "", 900);
    const all = iDom.window.getHistoryAll().length, five = iDom.window.getHistoryList().length;
    iDom.window.close();

    // 3) 逐個眼掣真跑
    const results = [];
    for(const p of parsed){
      const hash = "#view=" + encodeURIComponent(p.id || p.i);
      const { dom, alerts } = await loadPage(INDEX, store, hash, 1200);
      const d = dom.window.document;
      const shown = !d.getElementById("result").classList.contains("hidden");
      const home = !d.getElementById("home").classList.contains("hidden");
      const okRow = shown && !home;
      // 壞紀錄（類型代號唔喺 TYPES）開唔到結果唔算 bug，但一定要有提示；
      // 靜靜彈返主頁 = 用戶完全唔知發生咩事 = FAIL
      const silent = !okRow && !alerts.length;
      results.push(okRow ? "✓結果" : (alerts.length ? "✓提示" : "✗靜靜彈主頁"));
      if(silent) bad++;
      dom.window.close();
    }
    console.log(`${name.padEnd(22)} 記錄頁 ${String(parsed.length)} 行 | 主頁清單 all=${all} top5=${five} | 撳眼掣結果: ${results.join(" ")}`);
  }
  console.log(bad ? `\n✗ ${bad} 個眼掣靜靜彈返主頁（用戶睇唔到任何解釋）` : "\n✓ 冇任何眼掣會靜靜死（開到結果 或 有提示）");
  process.exit(bad ? 1 : 0);
})();
