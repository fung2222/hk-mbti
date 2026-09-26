// 記錄頁眼掣 → 主頁睇結果：端到端驗證（讀 record.html 真實 onclick → 行 index.html）
//
// 行法（jsdom 唔入 repo，喺 scratch 嗰邊）：
//   NODE_PATH=/opt/data/profiles/apps/cache/scratch/harness/node_modules \
//     node tools/record_view_test.js
//
// 守嘅 regression（2026-09-26 Roy 報「撳眼掣／縮圖彈返主頁，入唔到結果」）：
//   1. 紀錄多過 5 條時，第 6 行之後嘅眼掣一樣要開到結果
//      （舊 bug：getHistoryList() 得 5 條 + `if(!rec) return;` → 靜靜彈返主頁）
//   2. record.html 要用 id 唔用 index（兩頁排序／數量一唔同就對唔上）
//   3. 兩個傳遞渠道都要通：sessionStorage（主）＋ hash（backup）
//   4. 畫分享卡出事，唔可以連結果都睇唔到
//   5. 壞紀錄 → 有提示；唔准靜靜彈走
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

function loadPage(html, store, opts){
  opts = opts || {};
  return new Promise(resolve => {
    const alerts = [], errs = [];
    const vc = new VirtualConsole();
    vc.on("jsdomError", e => { const m = String(e.message || e); if(!/scrollTo|Not implemented/.test(m)) errs.push(m.slice(0, 100)); });
    vc.on("error", (...a) => errs.push(a.map(String).join(" ").slice(0, 100)));
    const dom = new JSDOM(html, {
      url: BASE + (opts.hash || ""), runScripts: "dangerously", pretendToBeVisual: true, virtualConsole: vc,
      beforeParse(window){
        window.alert = m => alerts.push(String(m));
        window.confirm = () => false;
        stubCanvas(window);
        try{ Object.defineProperty(window.document, "fonts", { value: { load: () => Promise.resolve([]) }, configurable: true }); }catch(e){}
        try{
          window.localStorage.setItem("hkmbti_history", JSON.stringify(store));
          window.localStorage.setItem("hkmbti_last_result", JSON.stringify(store[0] || {}));
          if(opts.pending) window.sessionStorage.setItem("hkmbti_pending_record", JSON.stringify(opts.pending));
        }catch(e){}
      },
    });
    setTimeout(() => resolve({ dom, alerts, errs }), opts.wait || 1200);
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
  "冇 id（舊版紀錄）": [Object.assign(mk(1), {id: undefined}), mk(2)],
};

function judge(dom, alerts){
  const d = dom.window.document;
  const shown = !d.getElementById("result").classList.contains("hidden");
  const home = !d.getElementById("home").classList.contains("hidden");
  const ok = shown && !home;
  return { ok, silent: !ok && !alerts.length, tag: ok ? "✓結果" : (alerts.length ? "✓提示" : "✗靜靜彈主頁") };
}

(async () => {
  let bad = 0;
  const fail = (where, extra) => { bad++; console.log(`  ✗ ${where} ${extra || ""}`); };

  console.log("【渠道 1】hash #view=<id>（backup 渠道）");
  for(const [name, store] of Object.entries(STORES)){
    const { dom: rDom } = await loadPage(RECORD, store, { wait: 1100 });
    const onclicks = [...rDom.window.document.querySelectorAll(".act-view")].map(b => b.getAttribute("onclick"));
    rDom.window.close();
    const parsed = onclicks.map(s => {
      const m = s.match(/^viewRec\('([^']*)',\s*(\d+)\)$/);
      return m ? { id: m[1], i: Number(m[2]) } : null;
    });
    const { dom: iDom } = await loadPage(INDEX, store, { wait: 900 });
    const all = iDom.window.getHistoryAll().length, five = iDom.window.getHistoryList().length;
    iDom.window.close();
    const results = [];
    for(const p of parsed){
      const { dom, alerts } = await loadPage(INDEX, store, { hash: "#view=" + encodeURIComponent(p.id || p.i) });
      const j = judge(dom, alerts);
      results.push(j.tag);
      if(j.silent) fail(`${name} 第 ${p.i + 1} 行`);
      dom.window.close();
    }
    console.log(`  ${name.padEnd(20)} 記錄頁 ${String(parsed.length)} 行 | all=${all} top5=${five} | ${results.join(" ")}`);
  }

  console.log("\n【渠道 2】sessionStorage（主渠道，完全冇 hash）");
  {
    const store = STORES["5 條（正常）"];
    for(const p of [{ id: store[0].id, i: 0 }, { id: store[3].id, i: 3 }, { id: store[4].id, i: 4 }]){
      const { dom, alerts } = await loadPage(INDEX, store, { pending: { id: p.id, i: p.i } });
      const j = judge(dom, alerts);
      if(!j.ok) fail(`sessionStorage ${p.id}`, j.tag);
      dom.window.close();
    }
    // 冇 id 嘅舊紀錄 → fallback index
    const { dom: d2, alerts: a2 } = await loadPage(INDEX, store, { pending: { id: "", i: 2 } });
    if(!judge(d2, a2).ok) fail("sessionStorage fallback index", judge(d2, a2).tag);
    d2.window.close();
    // 指去唔存在嘅 id → 要有提示，唔可以靜靜
    const { dom: d3, alerts: a3 } = await loadPage(INDEX, store, { pending: { id: "根本冇呢個", i: 0 } });
    const j3 = judge(d3, a3);
    if(j3.silent) fail("sessionStorage 壞 id");
    console.log(`  開到結果 ✓ | fallback index ✓ | 壞 id → ${j3.tag}`);
    d3.window.close();
  }

  console.log("\n【渠道 3】畫分享卡出事（generateCardImage throw）");
  {
    const store = STORES["5 條（正常）"];
    const { dom, alerts } = await loadPage(INDEX, store, { wait: 1100 });   // 正常載入
    const w = dom.window;
    // 載入完成後，令 generateCardImage 拋錯 → 再行一次「睇結果」
    w.generateCardImage = function(){ throw new Error("模擬出卡失敗"); };
    w.viewHistoryResult(store[2].id);
    await new Promise(r => setTimeout(r, 300));
    const j = judge(dom, alerts);
    console.log(`  出卡 throw → ${j.tag}${j.ok ? "（結果照睇到，正確）" : ""}`);
    if(!j.ok) fail("出卡 throw 情況");
    dom.window.close();
  }

  console.log(bad ? `\n✗ ${bad} 項唔合格` : "\n✓ 全部通過（兩個渠道都通、冇眼掣會靜靜死、出卡壞都睇到結果）");
  process.exit(bad ? 1 : 0);
})();
