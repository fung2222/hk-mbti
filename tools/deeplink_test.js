// 深層連結測試：由其他頁（或任何時候）跳入 index.html 都要開到對應畫面
//
// 行法：NODE_PATH=/opt/data/profiles/apps/cache/scratch/harness/node_modules node tools/deeplink_test.js
//
// 守嘅 regression（2026-09-26 Roy 報「記錄頁 16 型統計撳人格圖彈返主頁」）：
//   1. #type=XXXX / #about / #hub / #spectrum / #social / #romance / #method / #privacy 都要開到
//   2. sessionStorage 舊旗標唔可以劫持明確深層連結（hash 一定要贏）
//   3. load 之後 hash 再變（同一文件內跳轉）／bfcache 還原（load 唔會再跑）都要照開
const fs = require("fs");
const path = require("path");
const { JSDOM, VirtualConsole } = require("jsdom");

const REPO = "/opt/data/repos/hk-mbti";
function inlineLocal(html){
  return html
    .replace(/<script src="(https?:)?\/\/[^"]*"><\/script>/g, "")
    .replace(/<script src="([^"]+\.js)"><\/script>/g, (m, f) =>
      fs.existsSync(path.join(REPO, f)) ? "<script>\n" + fs.readFileSync(path.join(REPO, f), "utf8") + "\n</script>" : "");
}
const INDEX = inlineLocal(fs.readFileSync(REPO + "/index.html", "utf8"));
const BASE = "https://fung2222.github.io/hk-mbti/";
const now = Date.now();
const store = [{ id: "r0", mbti: "INFP-A", timestamp: now, completed: true, name: "Roy", nickname: "阿豐", version: "life" }];
const sleep = ms => new Promise(r => setTimeout(r, ms));

function stubCanvas(window){
  const ctx = new Proxy({}, { get(t, k){
    if(k === "canvas") return { width: 720, height: 1280 };
    if(k === "measureText") return () => ({ width: 10 });
    if(/Gradient/.test(String(k))) return () => ({ addColorStop(){} });
    return () => {};
  }, set(){ return true; } });
  window.HTMLCanvasElement.prototype.getContext = () => ctx;
  window.HTMLCanvasElement.prototype.toDataURL = () => "data:image/jpeg;base64,x";
  window.Image = class { set src(v){ setTimeout(() => this.onload && this.onload(), 0); } };
}

function load(opts){
  opts = opts || {};
  return new Promise(resolve => {
    const alerts = [], errs = [];
    const vc = new VirtualConsole();
    vc.on("jsdomError", e => { const m = String(e.message || e); if(!/scrollTo|Not implemented/.test(m)) errs.push(m.slice(0, 120)); });
    const dom = new JSDOM(INDEX, {
      url: BASE + (opts.hash || ""), runScripts: "dangerously", pretendToBeVisual: true, virtualConsole: vc,
      beforeParse(window){
        window.alert = m => alerts.push(String(m));
        window.confirm = () => false;
        stubCanvas(window);
        try{ Object.defineProperty(window.document, "fonts", { value: { load: () => Promise.resolve([]) }, configurable: true }); }catch(e){}
        try{
          window.localStorage.setItem("hkmbti_history", JSON.stringify(store));
          window.localStorage.setItem("hkmbti_last_result", JSON.stringify(store[0]));
          window.sessionStorage.setItem("hkmbti_last_section", "home");
          if(opts.pending) window.sessionStorage.setItem("hkmbti_pending_record", JSON.stringify(opts.pending));
          if(opts.pendingType) window.sessionStorage.setItem("hkmbti_pending_type", JSON.stringify(Object.assign({ t: Date.now() }, opts.pendingType)));
          if(opts.navlog) window.sessionStorage.setItem("hkmbti_navlog", JSON.stringify(Object.assign({ t: Date.now(), build: "d1" }, opts.navlog)));
        }catch(e){}
      },
    });
    setTimeout(() => resolve({ w: dom.window, alerts, errs }), opts.wait || 2300);   // 等埋 1.8s 診斷
  });
}

const visible = w => ["home","type","about","spectrum","hub","social","romance","method","privacy","result"]
  .filter(s => w.document.getElementById(s) && !w.document.getElementById(s).classList.contains("hidden"));

(async () => {
  let bad = 0;

  console.log("【1】load 時嘅深層連結");
  const CASES = [["#type=INFP","type"],["#type=ESTJ","type"],["#type=isfp","type"],
    ["#about","about"],["#spectrum","spectrum"],["#hub","hub"],["#social","social"],
    ["#romance","romance"],["#method","method"],["#privacy","privacy"],["(冇 hash)","home"]];
  for(const [hash, expect] of CASES){
    const { w } = await load({ hash: hash === "(冇 hash)" ? "" : hash });
    const ok = w._showing === expect;
    if(!ok) bad++;
    console.log(`  ${hash.padEnd(14)} 預期 ${expect.padEnd(8)} 實際 ${String(w._showing).padEnd(8)} 顯示=${visible(w).join("+")||"冇"} ${ok ? "✓" : "✗"}`);
    w.close();
  }

  console.log("\n【2】舊 sessionStorage 旗標唔可以劫持深層連結");
  {
    // 旗標指去一筆唔存在嘅紀錄：以前會 alert + 停留主頁，人格圖就開唔到
    const { w, alerts } = await load({ hash: "#type=INFP", pending: { id: "根本冇呢筆", i: 0 } });
    const ok = w._showing === "type";
    if(!ok) bad++;
    console.log(`  pending(壞) + #type=INFP → 實際 ${w._showing} ${ok ? "✓ 人格圖照開" : "✗ 被旗標劫持"}` + (alerts.length ? ` alert=${JSON.stringify(alerts[0]).slice(0,30)}` : ""));
    w.close();
  }
  {
    // 旗標指去一筆有效紀錄：都唔可以搶走人格圖
    const { w } = await load({ hash: "#type=ESTJ", pending: { id: "r0", i: 0 } });
    const ok = w._showing === "type";
    if(!ok) bad++;
    console.log(`  pending(有效) + #type=ESTJ → 實際 ${w._showing} ${ok ? "✓ hash 優先" : "✗ 搶走咗"}`);
    w.close();
  }
  {
    // 冇 hash 嘅時候，旗標照樣要 work（眼掣主渠道）
    const { w } = await load({ pending: { id: "r0", i: 0 } });
    const ok = w._showing === "result";
    if(!ok) bad++;
    console.log(`  淨係 pending（眼掣）→ 實際 ${w._showing} ${ok ? "✓" : "✗"}`);
    w.close();
  }

  console.log("\n【3】load 之後 hash 再變 / bfcache 還原");
  {
    const { w } = await load({});
    w.location.hash = "#hub";
    await sleep(400);
    const ok = w._showing === "hub";
    if(!ok) bad++;
    console.log(`  hashchange → #hub 實際 ${w._showing} ${ok ? "✓" : "✗"}`);
    w.close();
  }
  {
    const { w } = await load({});
    // 模擬 bfcache 還原：location.hash 已有 #type=INFP 但 load 唔會再跑
    w.history.replaceState({}, "", BASE + "#type=INFP");
    const ev = new w.Event("pageshow");
    Object.defineProperty(ev, "persisted", { value: true });
    w.dispatchEvent(ev);
    await sleep(400);
    const ok = w._showing === "type";
    if(!ok) bad++;
    console.log(`  pageshow(persisted) → #type 實際 ${w._showing} ${ok ? "✓ bfcache 都開到" : "✗"}`);
    w.close();
  }

  console.log("\n【4】臨時診斷報告（跳轉開唔到要做聲，開到就唔嘈）");
  {
    const { w, alerts } = await load({ hash: "#type=INFP", navlog: { k: "type", v: "INFP" } });
    const ok = w._showing === "type" && !alerts.length;
    if(!ok) bad++;
    console.log(`  開得到 → 實際 ${w._showing}，診斷提示 ${alerts.length} 個 ${ok ? "✓ 唔嘈" : "✗ 嘈咗"}`);
    w.close();
  }
  {
    const { w, alerts } = await load({ hash: "#type=ZZZZ", navlog: { k: "type", v: "ZZZZ" } });
    const report = alerts.find(a => a.indexOf("診斷報告") === 0);
    const ok = w._showing === "home" && !!report;
    if(!ok) bad++;
    console.log(`  開唔到 → 實際 ${w._showing}，有冇報告：${report ? "✓ 有" : "✗ 冇"}`);
    if(report) console.log("    報告內容：\n" + report.split("\n").map(l => "      " + l).join("\n"));
    w.close();
  }
  {
    const { w, alerts } = await load({});
    const ok = w._showing === "home" && !alerts.length;
    if(!ok) bad++;
    console.log(`  正常瀏覽（冇跳轉意圖）→ 診斷提示 ${alerts.length} 個 ${ok ? "✓ 唔嘈" : "✗ 嘈咗"}`);
    w.close();
  }
  console.log("\n【5】記錄頁人格圖（type 渠道對比：以前淨係 hash 一條）");
  {
    // (a) 淨係 sessionStorage（完全冇 hash）—— 同眼掣睇結果一樣嘅第二條渠道
    const { w, alerts } = await load({ pendingType: { code: "INFP" } });
    const ok = w._showing === "type" && !alerts.length;
    if(!ok) bad++;
    console.log(`  淨係 pending_type → 實際 ${w._showing} ${ok ? "✓ 開到百科" : "✗"}`);
    w.close();
  }
  {
    // (b) hash 壞（類型代號唔存在）＋ pending_type 好 → 一定要開到（渠道互相補位）
    const { w } = await load({ hash: "#type=ZZZZ", pendingType: { code: "ESTJ" } });
    const ok = w._showing === "type" && w.document.getElementById("typeBig").innerText === "ESTJ";
    if(!ok) bad++;
    console.log(`  hash 壞 + pending_type 好 → 實際 ${w._showing}/${w.document.getElementById("typeBig").innerText} ${ok ? "✓ 補位成功" : "✗"}`);
    w.close();
  }
  {
    // (c) 類型代號真係唔存在 → 一定要出聲，唔可以靜靜彈返主頁
    const { w, alerts } = await load({ hash: "#type=ZZZZ" });
    const said = alerts.some(a => a.indexOf("暫時未有資料") >= 0);
    const ok = said && w._showing === "home";
    if(!ok) bad++;
    console.log(`  #type=ZZZZ（冇 pending）→ 實際 ${w._showing}，有冇提示：${said ? "✓ 有" : "✗ 靜靜死"}`);
    w.close();
  }
  console.log(bad ? `\n✗ ${bad} 項唔合格` : "\n✓ 全部深層連結都開到對應畫面");
  process.exit(bad ? 1 : 0);
})();
