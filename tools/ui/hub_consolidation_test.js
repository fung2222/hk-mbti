/* 百科整合測試（Roy 2026-10-01：性格百科做主入口）
   驗證：#hub 光譜整合 + 16 型卡下面測試入口 + #type 三個深入入口 + 型優先 banner */
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const root = path.resolve(__dirname, "../..");
const src = fs.readFileSync(path.join(root, "index.html"), "utf8");

let pass = 0, fail = 0;
function chk(name, ok, got) {
  if (ok) { pass++; }
  else { fail++; console.log("✗ " + name + "   <- " + (got === undefined ? "" : got)); }
}

// ── 靜態檢查 ──
chk("★ 百科首頁維度卡有 8 個字母掣（E/I、S/N、T/F、J/P）", (function(){ const s = src.slice(src.indexOf('id="hubDims"'), src.indexOf('<!-- 16 種性格入口') > 0 ? src.indexOf('<!-- 16 種性格入口') : src.indexOf('hub-bleed')); return (s.match(/openLetter\('/g) || []).length === 8; })(), (function(){ const s = src.slice(src.indexOf('id="hubDims"'), src.indexOf('hub-bleed')); return "字母掣 " + ((s.match(/openLetter\('/g) || []).length) + " 個"; })());
chk("★ 百科卡底有「撳入去睇」link → #dims", /class="hub-more-link" onclick="openDims\(\)"/.test(src));
chk("★ 維度詳解分頁（#dims）有「4 個英文字母代表咩」卡（光譜整合入嚟）", /<section id="dims"/.test(src) && /id="dimsLetters"/.test(src) && /class="hub-letter-list"/.test(src));
chk("★ 維度詳解分頁有 8 個字母掣 → #letter", (function(){ const s = src.slice(src.indexOf('<section id="dims"'), src.indexOf('<!-- ========== 人格深入分析')); return (s.match(/openLetter\('/g) || []).length === 8; })());
chk("★ 16 型色卡（hub-bleed）下間距＝12px（Roy 2026-10-02 兩輪：26px 太大 → 16px 後再要緊啲 → 12px）", /\.hub-bleed\{margin:0 -16px 12px/.test(src));
chk("★ 文章頁（相處／拍拖／章節）色卡同上內文距離夠（文章頁 26px 留白）", (src.match(/class="card p-6 mb-\[26px\]"/g)||[]).length===3, (src.match(/mb-\[26px\]/g)||[]).length+" 處");
chk("★ 場景文章頁底卡已整張刪（連舊 +9px 規則一併清走）", !/softbox-tight/.test(src) && !/article-more-list/.test(src));
chk("★ 非主頁垂直間距統一 16px（卡片同非卡容器一致）", !/\.(article-guide|wiz-facts)\{[^}]*margin:[^;}]*20px/.test(src) && /\.article-guide\{margin:0 4px 16px/.test(src) && /\.type-rel-grid\{[^}]*margin-bottom:16px\}/.test(src));
chk("★ 全站測試入口文案統一：「想確認自己 MBTI 人格？」（唔准有舊文案）", !/睇完想試/.test(src) && (src.match(/想確認自己 MBTI 人格？/g) || []).length >= 8, (src.match(/想確認自己 MBTI 人格？/g) || []).length + " 處");
chk("★ 全站測試入口按鈕統一：「立即選擇測試版本」（唔准有舊按鈕字）", !/返主頁開始測試/.test(src) && !/>選擇測試版本</.test(src) && (src.match(/立即選擇測試版本/g) || []).length >= 8, (src.match(/立即選擇測試版本/g) || []).length + " 處");
chk("★「立即開始」只准出現一次，而且喺結果頁「挑戰再測一次」卡入面（Roy 2026-10-02 指定）", (function(){
  const hits = src.match(/>立即開始</g) || [];
  const i = src.indexOf("挑戰再測一次"), k = src.indexOf(">立即開始<");
  return hits.length === 1 && i > 0 && k > i && k - i < 400;
})(), "出現 " + ((src.match(/>立即開始</g)||[]).length) + " 次");
chk("★ 測試入口全部呼叫 goPickVersion()", (src.match(/goPickVersion\(\)/g) || []).length >= 9, (src.match(/goPickVersion\(\)/g) || []).length + " 處");
chk("★ show() 清單有 dims 同 typeScenes（scenes 已刪）", /"hub","dims"/.test(src) && /"dims","letter","type"/.test(src) && !/\bdims","scenes/.test(src));
chk("★ 光譜 5 段齊（E/I、S/N、T/F、J/P、T/A）", (function(){ const m = src.match(/window\.HUB_LETTERS = \[[\s\S]*?\n\];/); if(!m) return false; const t = m[0]; return ["E vs I","S vs N","T vs F","J vs P","T vs A"].every(x => t.includes(x)); })());
chk("★ 光譜段有「唔係…」澄清句", /唔係「內向 = 怕醜」/.test(src) && /唔係「P 型 = 散漫」/.test(src));
// ⚠️ 用字數窗口好脆弱：2026-10-02 喺 CTA 文案上面加咗發光燈泡 span（~650 字）→ 舊窗口 {0,160} 掃唔到。
//    改成切出成個 #hubCta 卡再驗，唔靠字數。
chk("★ 測試入口卡有「選擇測試版本」掣", (function(){
  const i = src.indexOf('id="hubCta"');
  if(i < 0) return false;
  const seg = src.slice(i, src.indexOf("</div>", src.indexOf("goPickVersion", i)) + 6);
  return /選擇測試版本/.test(seg) && /goPickVersion\(\)/.test(seg);
})());
// Roy 2026-10-01：百科「由人格睇」次序 = 4 維度卡 → 16 型卡 → 比較工具 → 測試入口（最底）
chk("★ 百科「由人格睇」次序：16 型卡 → 比較工具 → 測試入口（最底）", (function(){
  const i = src.indexOf('<div id="hubTypeMode">'), j = src.indexOf('</div><!-- /hubTypeMode -->');
  const seg = src.slice(i, j);
  const at = s => seg.indexOf(s);
  return at('id="hubDims"') < at('id="hubTypeGrid"') && at('id="hubTypeGrid"') < at('id="compareA"') && at('id="compareA"') < at('id="hubCta"');
})());
chk("★ 右上選單跟探索更多同一排序（冇光譜／相處／拍拖）", (function(){
  const i = src.indexOf("const LINKS = [");
  const seg = src.slice(i, src.indexOf("const NAV", i));
  return JSON.stringify([...seg.matchAll(/\["(\w+)"/g)].map(m => m[1])) === JSON.stringify(["home","record","about","hub","stats","method","privacy"]) && !/spectrum|social|romance/.test(seg);
})(), (function(){ const i = src.indexOf("const LINKS = ["); return ([...src.slice(i, src.indexOf("const NAV", i)).matchAll(/\["(\w+)"/g)].map(m => m[1]).join(" → ")); })());
chk("★ 主頁 ⋯ 選單同右上一樣（補返計分方法、冇光譜／相處／拍拖）", (function(){
  const i = src.indexOf('id="homeMenu"'), seg = src.slice(i, src.indexOf("home-menu-foot", i));
  return /openAbout/.test(seg) && /openHub/.test(seg) && /stats\.html/.test(seg) && /openMethod/.test(seg) && /openPrivacy/.test(seg) && !/openSpectrum|openSocial|openRomance/.test(seg);
})(), (function(){ const i = src.indexOf('id="homeMenu"'); return (src.slice(i, src.indexOf("home-menu-foot", i)).match(/>(主頁|我的紀錄|關於港式 MBTI|性格百科|香港16型統計|計分方法同限制|私隱聲明)</g) || []).join(" "); })());
// Roy 2026-10-01：清走已淘汰嘅 UI 入口（光譜／個人相處／個人拍拖）
chk("★ 全站已冇 UI 入口連去光譜／個人相處／個人拍拖", !/onclick="openSpectrum\(\)"/.test(src) && !/onclick="openSocial\(\)"/.test(src) && !/onclick="openRomance\(\)"/.test(src));
// Roy 2026-10-02：文章頁底「立即睇睇其他攻略」整張刪除 → 反轉成「一段 softbox-btn 都唔准有」
chk("★ 文章頁底完全冇入口卡（softbox-btn／其他攻略）", (function(){
  const seg = src.slice(src.indexOf('id="socialArticle"'), src.indexOf('id="type"'));
  return !/softbox-btn/.test(seg) && !/立即睇睇其他攻略/.test(seg) && !/article-more-list/.test(seg);
})(), (function(){ const seg = src.slice(src.indexOf('id="socialArticle"'), src.indexOf('id="type"')); return (seg.match(/softbox-btn/g) || []).length + " 個 softbox-btn"; })());
chk("★ 結果頁已經冇「性格百科」入口（Roy 2026-10-02：有睇完整分析就唔需要）", (function(){
  const i = src.indexOf('id="personalityDetail"');
  const seg = src.slice(Math.max(0, i - 1500), i);
  return !/點同人相處|點同人拍拖/.test(seg) && !/openHub\(\)/.test(seg) && /goTypeFromResult\(\)/.test(seg);
})());
chk("★ 百科「16 型卡」band 下間距 16px，同其他 band 一致（原本 26px＝場景文章頁例外值，唔啱比例）", (function(){
  const mb = (n)=>{ const m=new RegExp("\\."+n+"\\{([^}]*)\\}").exec(src); if(!m) return -1;
    const mm=/margin:([^;]*);/.exec(m[1]); return parseInt(mm[1].trim().split(/\s+/)[2],10); };
  return mb("hub-bleed")===12 && mb("result-bleed")===16 && mb("scenes-bleed")===16;
})());
chk("★ 卡牌格 → 比較工具嘅實際間距（band padding-bottom ＋ margin-bottom）唔可以大過同類 band", (function(){
  const gap = (n)=>{ const m=new RegExp("\\."+n+"\\{([^}]*)\\}").exec(src); if(!m) return 9999;
    const pb=parseInt(/padding:([^;]*);/.exec(m[1])[1].trim().split(/\s+/)[2],10);
    const mb2=parseInt(/margin:([^;]*);/.exec(m[1])[1].trim().split(/\s+/)[2],10); return pb+mb2; };
  return gap("hub-bleed") < gap("result-bleed") && gap("hub-bleed") < gap("scenes-bleed");
})(), "hub=" + (function(){ return ""; })());
chk("★ 桌面導覽列同右選單一致（冇光譜／相處攻略）", (function(){
  const i = src.indexOf('id="dtNav"'), seg = src.slice(i, src.indexOf("</nav>", i));
  return /性格百科/.test(seg) && /stats\.html/.test(seg) && /record\.html/.test(seg) && !/openSpectrum|openSocial\(/.test(seg);
})());
chk("★ 頁底唔再留 96px 大白（class 已冇 pb-24，改 16px + 安全區）", !/class="[^"]*pb-24/.test(src) && /#app\{padding-bottom:calc\(16px \+ env\(safe-area-inset-bottom\)\)\}/.test(src), (src.match(/id="app" class="[^"]*"/) || [""])[0]);
chk("★ 測試入口用 goPickVersion（去主頁揀版本位）", (function(){
  const i = src.indexOf('id="hubCta"');
  return i > 0 && /goPickVersion\(\)/.test(src.slice(i, i + 1200));
})());
chk("★ 百科兩個模式各有測試入口，舊「返主頁開始測試」已清", (function(){ const i = src.indexOf('<section id="hub"'); const hub = src.slice(i, src.indexOf('</section>', i)); return !/返主頁開始測試/.test(hub) && (hub.match(/選擇測試版本/g) || []).length === 2; })(), (function(){ const i = src.indexOf('<section id="hub"'); const hub = src.slice(i, src.indexOf('</section>', i)); return "舊掣 " + ((hub.match(/返主頁開始測試/g) || []).length) + " 個、測試版本 " + ((hub.match(/選擇測試版本/g) || []).length) + " 個"; })());
chk("★ 人格頁有 4 個分頁掣（性格／關係／場景／深入）", (function(){
  const i = src.indexOf('id="typeTabSwitch"'); if(i < 0) return false;
  const seg = src.slice(i, src.indexOf("</div>", i));
  return ["basic","rel","scene","deep"].every(t => new RegExp('data-tab="' + t + '"').test(seg)) && (seg.match(/setTypeTab\(/g) || []).length === 4
   && (seg.match(/hub-mode-btn/g) || []).length === 4;
})(), "");
chk("★ 人格頁 4 個分頁面板齊 + renderTypeTabs 一個函數 render 晒（Roy 2026-10-02 方案 B）", (function(){
  const okBox = ["typeTabBasic","typeTabRel","typeTabScene","typeTabDeep"].every(id => new RegExp('id="' + id + '"').test(src));
  const i = src.indexOf("window.renderTypeTabs = function"); if(i < 0 || !okBox) return false;
  const fn = src.slice(i, src.indexOf("window.openDeepChapterFromType", i));
  return /typeProsCons/.test(fn) && /typeRelCards/.test(fn) && /typeSceneList/.test(fn) && /typeDeepBox/.test(fn)
   && !/"個人相處"/.test(fn) && !/"個人拍拖"/.test(fn);
})(), "");
chk("★ 入口函數都有定義", ["openTypeScenes","openDeepFor","setTypeTab","renderTypeTabs","openDeepChapterFromType"].every(f => new RegExp("window\\." + f + " = function").test(src)));
chk("★ 場景攻略已併入人格頁「場景」tab（#typeScenes 獨立分頁已拆走）", !/<section id="typeScenes"/.test(src) && !/id="typeScenesList"/.test(src) && /id="typeSceneList"/.test(src) && /window\.openTypeScenes = function/.test(src));
chk("★ 深入分析入口全開放（目錄免費睇，把關喺第 2–9 章）", !/openDeepFor = function\(code\)\{[\s\S]{0,130}openUpgrade/.test(src) && /if\(i > 0 && window\.getTier\(\) !== "full"\)\{ window\.openUpgrade\(\); return; \}/.test(src) && /window\.isUnlocked = function\(\)\{ return window\.getTier\(\) === "full"; \};/.test(src));
  chk("★ 舊「正在睇 XX」提示條已隨分頁拆走", !src.includes("scene-for-banner") && !src.includes("_socialForType") && !src.includes("_romanceForType"));
  chk("★ 人格頁關係卡有黑暗模式覆蓋（規則喺 #dark-layer 內）", (function(){
  const i = src.indexOf('id="dark-layer"'), j = src.indexOf("</style>", i);
  return i > 0 && /html\.dk \.type-rel-card\{/.test(src.slice(i, j)) && /html\.dk \.type-rel-item\{/.test(src.slice(i, j));
})());

// ── jsdom 真跑 ──
const dom = new JSDOM(src, { runScripts: "dangerously", pretendToBeVisual: true, url: "https://example.com/" });
const w = dom.window, d = w.document;
const $ = s => d.querySelector(s);

setTimeout(() => {
  // jsdom 唔會 load 外部 script → 手動注入必要資料
  if (!w.SOCIAL) w.SOCIAL = { WhatsAppGroup: { name: "WhatsApp 群", desc: "d" }, TeaFriend: { name: "飲茶朋友", desc: "d" } };
  if (!w.ROMANCE) w.ROMANCE = { 拍拖: { name: "拍拖", desc: "d" }, 吵架: { name: "吵架", desc: "d" } };
  if (!w.TYPES) w.TYPES = { ENFP: { name: "調停者" }, INTJ: { name: "建築師" } };
  if (!w.PREMIUM) w.PREMIUM = { INTJ: { chapters: [{ t: "第一章", b: "測試內容一。\n\n- 點一\n- 點二" }, { t: "第二章", b: "測試內容二。\n\n- 點三" }] } };  // 2 章：第 1 章免費、第 2 章要解鎖（Roy 2026-10-02）

  // ① 百科：維度掣撳入 → 維度詳解分頁
  w.openHub();
  // ①c 捲動位置記憶（Roy 2026-10-01：返回要停返原本位置，唔彈返頂）
  let _lastScrollY = null;
  w.scrollTo = function(a, b){ _lastScrollY = (b === undefined ? a : b); };
  Object.defineProperty(w, "scrollY", { configurable: true, get: function(){ return w._mockY || 0; } });
  w.goHome();                        // 先返主頁（_showing === "home"）
  w._mockY = 980;
  w.openHub();                      // 由主頁去百科 → 應該記住 980
  chk("★ 離開主頁會記住捲動位置", w._homeScrollY === 980, "記住 " + w._homeScrollY);
  _lastScrollY = null;
  w.show("home");                    // 返主頁 → 應該還原 980，唔係 0
  chk("★ 返主頁會還原原本位置（唔彈返頂）", _lastScrollY === 980, "scrollTo → " + _lastScrollY);
  w.goHome();                        // 主動撳主頁掣 → 去頂
  chk("★ 主動撳主頁掣仍然去頂", _lastScrollY === 0, "scrollTo → " + _lastScrollY);
  chk("★ 撳主頁掣會清記憶", w._homeScrollY === 0, w._homeScrollY);

  chk("★ 百科維度卡底 link 撳入會去維度詳解", (function(){ $("#hubDims .hub-more-link").click(); return !$("#dims").classList.contains("hidden") && $("#hub").classList.contains("hidden"); })());
  const letters = d.querySelectorAll("#dims .hub-letter-list > div");
  chk("★ 維度詳解 render 出 5 段 + 底註", letters.length === 6, "render 出 " + letters.length + " 段（預期 6＝5 段＋1 底註）");
  chk("★ 字母卡第一段係 E vs I", /E vs I/.test($("#dims .hub-letter-list").textContent));
  w.goBack();

  // ①b 百科「由場景睇」模式（Roy 2026-10-01 方案 A：場景入口收埋入百科）
  const _A = { INTJ: "測試內文一。**最忌**：測試內文二。", ENFP: "測試內文一。**最忌**：測試內文二。" };
  w.SOCIAL = { WhatsAppGroup: { name: "WhatsApp 群組", desc: "d", articles: _A }, FamilyGathering: { name: "親戚飯局", desc: "d", articles: _A }, TeaFriend: { name: "飲茶吹水朋友", desc: "d", articles: _A }, GroupProject: { name: "Group Project 隊友", desc: "d", articles: _A }, Roommate: { name: "室友", desc: "d", articles: _A }, Workplace: { name: "返工同事", desc: "d", articles: _A }, 失戀陪: { name: "失戀時陪佢", desc: "d", articles: _A } };
  w.ROMANCE = { 拍拖: { name: "點同佢拍拖", desc: "d", articles: _A }, 吵架: { name: "同佢點收科", desc: "d", articles: _A }, 分手: { name: "點同佢分手", desc: "d", articles: _A } };
  // jsdom 唔 load data.js → 補返 hubTypeCardHtml 需要嘅 palette
  if (typeof w.getPalette !== "function") w.getPalette = function () { return { c1: "#6B5B95", c2: "#4E4270", accent: "#F0EAF8" }; };
  w.openHub();
  chk("★ 百科預設「由人格睇」（type 模式）", !$("#hubTypeMode").classList.contains("hidden") && $("#hubSceneMode").classList.contains("hidden"));
  w.setHubMode("scene");
  chk("★ 撳「由場景睇」→ 切去場景模式", $("#hubTypeMode").classList.contains("hidden") && !$("#hubSceneMode").classList.contains("hidden"));
  const rowsS = d.querySelectorAll("#hubSceneList .scene-go-row");
  chk("★ 百科場景模式：10 個場景卡（相處 7 + 拍拖 3）", rowsS.length === 10, "render 出 " + rowsS.length);
  chk("★ 場景數係動態顯示（唔會寫死錯數字）", /Object\.keys\(window\.SOCIAL \|\| \{\}\)\.length/.test(src) && !/（10 個場景）/.test(src));
  chk("★ 場景卡呼叫 openHubScene", /openHubScene\(/.test(rowsS[0].getAttribute("onclick")), rowsS[0].getAttribute("onclick"));
  const icoS = d.querySelectorAll("#hubSceneList .scene-go-row .scene-go-ico svg");
  chk("★ 每個場景前面都有 icon（10 個）", icoS.length === 10, "有 icon 嘅卡 " + icoS.length);
  const cols = [...icoS].map(sv => (sv.getAttribute("style") || "").match(/color:(#[0-9A-Fa-f]{6})/i)).filter(Boolean).map(m => m[1].toLowerCase());
  chk("★ 10 個場景 10 種唔同顏色", cols.length >= 10 && new Set(cols).size >= 10, new Set(cols).size + " 種：" + [...new Set(cols)].join(" "));
  // 撳場景 → 場景詳情 + 16 型卡（同一個 #hub 內，唔跳頁）
  const sBtn = d.querySelector("#hubSceneList .scene-go-row");
  sBtn.click();
  chk("★ 撳場景後仲喺百科（冇跳頁）", w._showing === "hub", "showing=" + w._showing);
  const gridInHub = d.querySelector("#hubSceneDetail .hub-type-grid");
  chk("★ 場景詳情 render 出 16 型卡 grid", !!gridInHub, gridInHub ? "有" : "冇");
  chk("★ 場景詳情有「全部場景」返回掣", !!d.querySelector("#hubSceneDetail .hub-scene-back"));
  chk("★ 場景詳情 16 型卡 grid 有下距（唔會貼住測試入口卡）", /#hubSceneDetail \.hub-type-grid\{margin-bottom:20px\}/.test(src));
  chk("★ 場景詳情提示同 16 型卡之間有距離", /#hubSceneDetail \.hub-type-hint\{margin-bottom:10px\}/.test(src));
  w.closeHubScene();
  chk("★ 撳「全部場景」返到場景清單", !$("#hubSceneList").classList.contains("hidden") && $("#hubSceneDetail").classList.contains("hidden"));

  // ①c 該型 × 場景頁（由人格頁入）
  w.openTypeScenes("ENFP");
  const tsRows = d.querySelectorAll("#typeSceneList .scene-go-row");
  chk("★ 該型場景 tab：10 個場景（ENFP）", tsRows.length === 10, "render 出 " + tsRows.length);
  chk("★ 撳「呢一型其他場景」→ 去人格頁 + 場景 tab（唔再係獨立分頁）", w._showing === "type" && w._typeTab === "scene" && !$("#typeTabScene").classList.contains("hidden"), "showing=" + w._showing + " tab=" + w._typeTab);
  // ⚠️ 2026-10-02 教訓：原本只驗 onclick 字串有冇「openSocialArticle(」→ 漏傳 type 參數
  //    （openSocialArticle(key, type) 少一個 arg → 靜靜 return → 掣完全冇反應）都照綠。
  //    假守門！而家一定要**真撳** + 驗參數數目。
  chk("★ 該型場景卡 onclick 有齊 2 個參數（key ＋ type）",
      /open(Social|Romance)Article\('[^']+','[A-Z]{4}'\)/.test(tsRows[0].getAttribute("onclick")), tsRows[0].getAttribute("onclick"));
  (function(){
    const before = w._showing;
    tsRows[0].dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
    const after = w._showing;
    const okNav = (after === "socialArticle" || after === "romanceArticle");
    chk("★ ★ 真撳第一個場景卡 → 真係去咗文章頁（bug 2026-10-02：撳完冇反應）", okNav, "before=" + before + " after=" + after);
    if(okNav){
      // ⚠️ 呢個檔嘅 $ 係 d.querySelector（CSS selector），唔係 getElementById → 要寫 "#id"
      const bodySel = after === "socialArticle" ? "#socialArticleBody" : "#romanceArticleBody";
      const bEl = $(bodySel);
      // ⚠️ 測試環境嘅 SOCIAL／ROMANCE 係 mock（「測試內文一。」）→ 唔可以要求 50 字，
      //    重點係「有真內容 render 入去、唔係空頁」。
      chk("★ 文章內容真係 render 咗（唔係空頁）", !!bEl && bEl.innerHTML.includes("<p>") && bEl.textContent.trim().length > 5,
          "字數=" + (bEl ? bEl.textContent.trim().length : 0));
    }
    w.openTypeScenes("ENFP");
  })();

  // ①d 舊相處／拍拖／光譜分頁已拆走（Roy 2026-10-01「整靚啲潔淨啲」）
  chk("★ 舊分頁已拆走：#spectrum／#social／#romance 都唔存在", !w.$("spectrum") && !w.$("social") && !w.$("romance"));
  chk("★ 舊分頁函數已清走", typeof w.openSpectrum !== "function" && typeof w.openSocial !== "function" && typeof w.openSocialScenario !== "function" && typeof w.openRomance !== "function" && typeof w.openRomanceScenario !== "function");
  chk("★ show() 清單唔會再撞已刪 section", !/"about","spectrum"/.test(src) && !/"type","social"/.test(src));
  chk("★ 舊 CSS 已清（scene-for-banner／#socialScenarios）", !/scene-for-banner/.test(src) && !/socialScenarios/.test(src) && !/scene-for-clear/.test(src));

  // ①e 拆頁面時唔可以連共用 helper 一齊刪（2026-10-01 真實教訓：formatGuideHtml／formatTypeFullHtml 被誤刪）
  chk("★ 共用排版 helper 仍在（formatGuideHtml）", typeof w.formatGuideHtml === "function");
  chk("★ 共用排版 helper 仍在（formatTypeFullHtml）", typeof w.formatTypeFullHtml === "function");
  chk("★ 每個 window.X(...) 呼叫點都有定義（跨 index.html + 所有 .js）", (function(){
    const files = ["data.js","social.js","premium-data.js","type-icons.js","voice-data.js"].filter(f => fs.existsSync(path.join(root, f)));
    const all = src + files.map(f => fs.readFileSync(path.join(root, f), "utf8")).join("\n");
    const defined = new Set([...all.matchAll(/window\.([A-Za-z_$][\w$]*)\s*=\s*(?:function|\{|\(|async)/g)].map(m=>m[1]));
    const called = new Set([...src.matchAll(/window\.([A-Za-z_$][\w$]*)\s*\(/g)].map(m=>m[1]));
    const BROWSER = ["scrollTo","addEventListener","matchMedia","open","print","getComputedStyle"];
    const bad = [...called].filter(x => !defined.has(x) && !BROWSER.includes(x));
    if(bad.length) console.log("      未定義：", bad.join(", "));
    return bad.length === 0;
  })());

  // ③ 相處／拍拖文章頁仍然開到（helper 還原後）
  w.openSocialArticle("WhatsAppGroup", "ENFP");
  chk("★ 相處文章仍開到（排版正常）", !w.$("socialArticle").classList.contains("hidden") && /article-guide-kicker/.test(w.$("socialArticleBody").innerHTML) && /測試內文一/.test(w.$("socialArticleBody").innerHTML), "內文 " + w.$("socialArticleBody").innerHTML.length);
  const rk = Object.keys(w.ROMANCE || {})[0];
  w.openRomanceArticle(rk, "ENFP");
  chk("★ 拍拖文章仍開到（排版正常）", !w.$("romanceArticle").classList.contains("hidden") && /article-guide-kicker/.test(w.$("romanceArticleBody").innerHTML) && /測試內文一/.test(w.$("romanceArticleBody").innerHTML), "內文 " + w.$("romanceArticleBody").innerHTML.length);
  // 文章頁底卡片：Roy 2026-10-02 明確要求「立即睇睇其他攻略」整張刪除 → 反轉成「必須唔存在」
  const sBox = w.$("socialArticle").querySelector(".article-more-list");
  chk("★ 文章頁底「立即睇睇其他攻略」卡已刪", !sBox);
  chk("★ 拍拖文章頁底同一張卡都已刪", !w.$("romanceArticle").querySelector(".article-more-list"));
  chk("★ 文章頁底冇殘留「個人相處／個人拍拖／其他攻略」字", !/個人相處|個人拍拖|立即睇睇其他攻略/.test(w.$("socialArticle").textContent + w.$("romanceArticle").textContent));

  // ③b 深入分析章節頁仍然開到（formatGuideHtml）
  w.openDeepType("INTJ");
  w.openDeepChapter(0);
  chk("★ 深入分析章節頁仍 render 到內文", w.$("deepChapterBody").innerHTML.length > 20, "內文 " + w.$("deepChapterBody").innerHTML.length);

  // ⑥ 未解鎖：深入分析入口會跳升級頁
  w.openDeepFor("INTJ");
  chk("★ 免費用戶撳深入分析 → 入到目錄（目錄全開放）", w._showing === "deep", "showing=" + w._showing);
  w.openDeepChapter(1);
  chk("★ 免費用戶撳第 2 章 → 跳升級頁", !$("#upgrade").classList.contains("hidden") || w._showing === "upgrade", "showing=" + w._showing);

  // ---------- 文章牌匾左右箭咀（Roy 2026-10-02 第二輪）----------
  // 內容（Roy 糾正後）：「同一個人格、左右切換唔同場景」＋「所有文章都加左右三角」。
  // ⚠️ 本檔係 sync（setTimeout callback）→ 唔可以用 await。
  // ⚠️ 測試 mock 只有 INTJ／ENFP 兩種型有文章 → 要補齊 16 型（下面嗰 10 個場景都係跟 mock）。
  (function(){
    [w.SOCIAL, w.ROMANCE].forEach(function(bag){
      Object.keys(bag||{}).forEach(function(k){
        const arts = bag[k].articles || (bag[k].articles = {});
        const ks = Object.keys(arts); if(!ks.length) return;
        const tpl = arts[ks[0]]; if(typeof tpl !== "string") return;
        (w.TYPE_ORDER||[]).forEach(function(c){ if(!arts[c]) arts[c]=tpl; });
      });
    });
  })();
  const get = function(id){ return d.getElementById(id); };
  chk("★ 相處／拍拖牌匾都有左右箭咀（aria-label＝上／下一個場景）", (function(){
    return ["socialArticleHero","romanceArticleHero"].every(function(id){
      const hero=get(id); if(!hero) return false;
      const b=hero.querySelectorAll(".type-nav");
      return b.length===2 && /上一個場景/.test(b[0].getAttribute("aria-label")||"")
          && /下一個場景/.test(b[1].getAttribute("aria-label")||"");
    });
  })());
  chk("★ 深入分析章節牌匾都有左右箭咀（aria-label＝上／下一章）", (function(){
    const hero=get("deepChapterHero"); if(!hero) return false;
    const b=hero.querySelectorAll(".type-nav");
    return b.length===2 && /上一章/.test(b[0].getAttribute("aria-label")||"")
        && /下一章/.test(b[1].getAttribute("aria-label")||"");
  })());
  chk("★ 文章牌匾箭咀撳得到（色卡 ＝ 普通 .card p-6，冇 pointer-events:none）", !/\.article-type-card/.test(src) && (src.match(/class="card p-6 mb-\[26px\]"/g)||[]).length===3);
  chk("★ articleStep／deepStep 都有定義",
      /window\.articleStep = function\(dir\)/.test(src) && /window\.deepStep = function\(dir\)/.test(src));
  chk("★ 舊嘅 articleTypeStep（轉人格版，做錯）已清走", !/articleTypeStep/.test(src));

  // 場景牌匾：**人格唔變**、場景變、次序跟「相處 7 + 拍拖 3」
  const pSk=Object.keys(w.SOCIAL||{})[0];
  w.openSocialArticle(pSk,"INTJ");
  const firstSc=get("socialArticleScenario").innerText;
  const sBtns=get("socialArticleHero").querySelectorAll(".type-nav");
  const sDepth=w._histDepth||0, sLen=w.history.length;
  sBtns[1].dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  chk("★ 撳牌匾右箭咀：**人格唔變**（INTJ）、換咗場景",
      get("socialArticleType").dataset.code==="INTJ" && get("socialArticleScenario").innerText!==firstSc
      && /INTJ/.test(get("socialArticleBreadcrumb").innerText),
      get("socialArticleType").dataset.code+" / "+get("socialArticleScenario").innerText);
  chk("★ 場景轉換＝同一頁換內容 → 唔加 history 層",
      (w._histDepth||0)===sDepth && w.history.length===sLen, "depth "+sDepth+"→"+w._histDepth+" / len "+sLen+"→"+w.history.length);
  chk("★ 當前歷史層快照已更新做新場景（sKey）", w._navSnap().sKey!==pSk, "sKey="+w._navSnap().sKey);

  w.openSocialArticle(pSk,"INTJ");
  const expectK=Object.keys(w.SOCIAL).filter(function(k){ return w.SOCIAL[k].articles && w.SOCIAL[k].articles["INTJ"]; })
    .concat(Object.keys(w.ROMANCE).filter(function(k){ return w.ROMANCE[k].articles && w.ROMANCE[k].articles["INTJ"]; }));
  const gotNames=[get("socialArticleScenario").innerText];
  for(let k=0;k<expectK.length-1;k++){
    const inR = (w._showing === "romanceArticle");
    const bts = (inR ? get("romanceArticleHero") : get("socialArticleHero")).querySelectorAll(".type-nav");
    bts[1].dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
    gotNames.push((w._showing === "romanceArticle" ? get("romanceArticleScenario") : get("socialArticleScenario")).innerText);
  }
  chk("★ 行 9 步：場景次序 = 相處 7 → 拍拖 3（跨 section 都跟次序）", (function(){
    const want=expectK.map(function(k){ return (w.SOCIAL[k]||w.ROMANCE[k]).name; });
    return JSON.stringify(gotNames)===JSON.stringify(want);
  })(), gotNames.length+" 個："+gotNames.slice(0,3).join("→")+"…→"+gotNames[gotNames.length-1]);
  chk("★ 場景全部係同一個人格（INTJ）＋ 最後跨到拍拖 section", /INTJ/.test(get("romanceArticleBreadcrumb").innerText) && w._showing==="romanceArticle",
      get("romanceArticleBreadcrumb").innerText);
  const rBtns=get("romanceArticleHero").querySelectorAll(".type-nav");
  rBtns[1].dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  chk("★ 最後一個場景撳下一個 → 環繞返第一個（拍拖 → 相處）",
      w._showing==="socialArticle" && get("socialArticleScenario").innerText===firstSc,
      w._showing+" / "+get("socialArticleScenario").innerText);

  // 深入分析章節牌匾：同一個人、上一／下一章、頭尾夾住
  w.localStorage.setItem("hkmbti_tier","full"); w.renderTier();
  w.openDeepFor("INTJ"); w.openDeepChapter(0);
  const dPrev=get("deepPrevTop"), dNext=get("deepNextTop");
  chk("★ 第 1 章：上一章 disabled（夾住唔環繞）、下一章可撳", dPrev.disabled===true && dNext.disabled===false,
      "prev="+dPrev.disabled+" next="+dNext.disabled);
  const dDepth=w._histDepth||0, dLen=w.history.length;
  dNext.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  chk("★ 撳下一章 → 去第 2 章（同一個人、內文真係換）",
      /2 \/ 2/.test(get("deepChapterCrumb").textContent) && get("deepChapterBody").innerHTML.length>5 && dPrev.disabled===false,
      get("deepChapterCrumb").textContent);
  chk("★ 章節轉頁都唔加 history 層", (w._histDepth||0)===dDepth && w.history.length===dLen,
      "depth "+dDepth+"→"+w._histDepth);
  chk("★ 最後一章：上下兩對「下一章」全部 disabled（唔環繞）",
      dNext.disabled===true && get("deepNext").disabled===true && get("deepPrevTop").disabled===false);
  dPrev.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  chk("★ 撳上一章 → 返第 1 章", /1 \/ 2/.test(get("deepChapterCrumb").textContent), get("deepChapterCrumb").textContent);

  // ---------- 九章目錄：星星 + 第X章 + 章節色卡格式（Roy 2026-10-03）----------
  w.localStorage.setItem("hkmbti_tier","full"); w.renderTier();
  w.openDeepFor("INTJ");
  const dItems=d.querySelectorAll("#deepList .deep-item");
  const nChap=(w.PREMIUM["INTJ"].chapters||[]).length;
  chk("★ 目錄頁：每章一張卡 ＋ 每張都有星星（號碼方塊冇咗）",
      dItems.length===nChap && d.querySelectorAll("#deepList .deep-star svg").length===nChap
      && d.querySelectorAll("#deepList .deep-num").length===0,
      "卡 "+dItems.length+" / 星 "+d.querySelectorAll("#deepList .deep-star svg").length);
  chk("★ 目錄頁：標題上有「第X章」（中文數字、無空格）",
      (d.querySelectorAll("#deepList .deep-ch")[0]||{}).textContent==="第一章",
      (d.querySelectorAll("#deepList .deep-ch")[0]||{}).textContent);
  chk("★ 目錄頁：卡內順序＝[icon] 第X章 → 標題 → 副標題", (function(){
    const it=d.querySelectorAll("#deepList .deep-item")[0];
    return !!(it.querySelector(".deep-ico") && it.querySelector(".deep-ch") && it.querySelector(".deep-t") && it.querySelector(".text-xs"));
  })());
  chk("★ 目錄頁：icon 喺最前、星星喺最後（次序 deep-ico → 文字 → deep-star）", (function(){
    const it=d.querySelectorAll("#deepList .deep-item")[0];
    const kids=[...it.querySelector(".deep-row").children].map(e=>e.className.split(" ")[0]);
    return kids[0]==="deep-ico" && kids[kids.length-1]==="deep-star" && kids.length===3;
  })());
  chk("★ 目錄 icon 同場景目錄一樣：36px ＋ 垂直置中（.deep-row align-items:center）",
      /\.deep-ico svg\{width:36px;height:36px/.test(src) && /\.deep-row\{display:flex;align-items:center/.test(src)
      && /\.deep-ico\{[^}]*align-self:center/.test(src));
  chk("★ 目錄標題字級＝場景目錄同一套（.deep-t 14px/700,同 .scene-go-t）",
      /\.deep-t\{display:block;font-size:14px;font-weight:700;color:var\(--ink\)/.test(src));
  dItems[0].dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  const dHero=d.getElementById("deepChapterHero");
  chk("★ 章節色卡＝人格頁色卡同一格式（card p-6 ＋ type-hero-row/mid，唔再滿版）", dHero.className.indexOf("card")>=0 && dHero.className.indexOf("p-6")>=0 && /mb-/.test(dHero.className) && !dHero.classList.contains("article-type-card") && !!dHero.querySelector(".type-hero-row .type-hero-mid"), dHero.className);
  chk("★ 章節色卡文字色白（底色係型漸層）＋ 4 字母純文字", dHero.style.color==="white" && d.getElementById("deepChapterType").innerText==="INTJ",
      dHero.style.color+" / "+d.getElementById("deepChapterType").innerText);
  w.openType("INTJ","hub"); w.setTypeTab("deep");
  chk("★ 九章目錄：每章都有線條 icon（9 個，層次唔同主題）", d.querySelectorAll("#deepList .deep-ico svg").length===nChap && (d.querySelectorAll("#deepList .deep-ico svg")[0]||{}).innerHTML!==(d.querySelectorAll("#deepList .deep-ico svg")[1]||{}).innerHTML, d.querySelectorAll("#deepList .deep-ico svg").length+" 個 icon");
  chk("★ 人格頁「深入分析」分頁都有 9 粒星 ＋ 第X章",
      d.querySelectorAll("#typeDeepBox .deep-star svg").length===nChap
      && (d.querySelectorAll("#typeDeepBox .deep-ch")[0]||{}).textContent==="第一章",
      d.querySelectorAll("#typeDeepBox .deep-star svg").length+" 星");

  // ---------- 性格百科：字級／字色對齊（Roy 2026-10-03；jsdom 冇 Tailwind CDN → 靜態 assertion）----------
  const _css=(src.match(/<style>([\s\S]*)<\/style>/)||["",""])[1];
  const ruleAll=sel=>{const out=[];const re=new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"\\{([^}]*)\\}","g");let m;while((m=re.exec(_css)))out.push(m[1]);return out;};
  const has=(sel,tok)=>ruleAll(sel).some(b=>b.indexOf(tok)>=0);
  const MUTED="#6b6560", GOLD="#8B6F3D", LGOLD="#A08A5C";
  const GREY_SEL=[".hub-type-hint",".hub-scene-n",".scene-go-d",".hub-mode-btn",".dim-pair .vs"];
  const GOLD_SEL=[".hub-more-link",".hub-scene-back",".deep-tag",".deep-ch",".deep-go"];
  chk("★ 百科字色：灰只用一個 token #6b6560", GREY_SEL.every(sel=>has(sel,MUTED)), GREY_SEL.map(s=>has(s,MUTED)?"✓":"✗").join(""));
  chk("★ 百科字色：金棕只用一個 token #8B6F3D", GOLD_SEL.every(sel=>has(sel,GOLD)), GOLD_SEL.map(s=>has(s,GOLD)?"✓":"✗").join(""));
  chk("★ 淡金 glyph 統一 #A08A5C（.hub-row-chev）", has(".hub-row-chev",LGOLD));
  chk("★ 舊散色已清（#6b6257/#9a9086/#8a6a1f/#C0B08A 全清；#8a8174 只准留喺桌面版）",
      !/#6b6257|#9a9086|#8a6a1f|#C0B08A/.test(_css) && !has(".hub-type-hint","#8a8174") && !has(".scene-go-d","#8a8174"));
  chk("★ T/A 維度軸數據色 #8A7A5A 唔准當文字色換走（仍 3 處）", (src.match(/#8A7A5A/g)||[]).length>=3);
  chk("★ 字重：百科 flow 規則冇 800（只准 400/600/700/900）",
      ![".hub-mode-btn",".deep-ch",".deep-go",".deep-badge",".deep-foot-btn",".type-rel-t",".scene-go-t",".hub-scene-back"].some(sel=>/font-weight:\s*800/.test(ruleAll(sel).join(""))));
  chk("★ 字級折入 scale：tab 切換 12px、關係項目 14px、冇 12.5px／.85rem",
      has(".type-tab-switch .hub-mode-btn","font-size:12px") && has(".type-rel-item","font-size:14px")
      && !/font-size:\s*12\.5px|font-size:\s*\.85rem/.test(_css));
  chk("★ 百科卡標題＝同一套（.hub-sec-title 同 .softbox-title 19px/900/1.45/var(--ink)）",
      /\.hub-sec-title\{font-size:19px;font-weight:900;[^}]*color:var\(--ink\)[^}]*line-height:1\.45/.test(_css)
      && (src.match(/class="hub-sec-title/g)||[]).length>=7, (src.match(/class="hub-sec-title/g)||[]).length+" 個標題");
  chk("★ 百科 Tailwind 灰（text-gray-600/500）remap 成 token ＋ 深色模式有覆蓋",
      /#hub \.text-gray-600,#hub \.text-gray-500,#type \.text-gray-600,#type \.text-gray-500\{color:#6b6560!important\}/.test(_css)
      && /html\.dk #hub \.text-gray-600[^{]*\{color:#A79E92!important\}/.test(_css));

  // ---------- 章節內文排版（Roy 2026-10-03：唔可以逐句切段／唔可以露星號）----------
  chk("★ 章節排版器存在；章節頁用 formatChapterHtml（場景文章仍用 formatGuideHtml）",
      typeof w.formatChapterHtml==="function" && /deepChapterBody"\)\.innerHTML = window\.formatChapterHtml/.test(src)
      && (src.match(/formatGuideHtml/g)||[]).length>=3);
  chk("★ 段落跟原文（\n\n 分段）—— 唔再逐個「。」切段", (function(){
    const h=w.formatChapterHtml("第一句。第二句。第三句。\n\n第四句。第五句。");
    return (h.match(/<p>/g)||[]).length===2 && /第一句。第二句。第三句。/.test(h);
  })());
  chk("★ 行內粗體轉 <strong>，唔會露 ** 星號（144 章全掃）", (function(){
    for(const t of Object.keys(w.PREMIUM)) for(const c of w.PREMIUM[t].chapters) if(/\*\*/.test(w.formatChapterHtml(c.b))) return false;
    return true;
  })());
  chk("★ 3 點清單變真 <ol class=guide-list>（<li> ×3）", (function(){
    const h=w.formatChapterHtml("1. **要點一**：說明一。\n\n2. **要點二**：說明二。\n\n3. **要點三**：說明三。");
    return /<ol class="guide-list">/.test(h) && (h.match(/<li>/g)||[]).length===3 && (h.match(/<strong>/g)||[]).length===3 && !/<p>/.test(h);
  })());
  chk("★ 收尾「**一句總結**：…」變 kicker ＋ 一段（唔會連住內文）", (function(){
    const h=w.formatChapterHtml("正文一段。\n\n**一句總結**：你要嘅唔係人哋聽你講。");
    return /<div class="article-guide-kicker">一句總結<\/div><p>/.test(h) && (h.match(/<p>/g)||[]).length===2;
  })());
  chk("★ 場景文章唔受影響（formatGuideHtml 保留逐句 <p>，只加 <strong>）",
      (function(){const h=w.formatGuideHtml("第一句。第二句。**重點**跟住。");return (h.match(/<p>/g)||[]).length===3 && /<strong>重點<\/strong>/.test(h);})());
  chk("★ 章節頁 CSS：清單 <ol> 用 decimal ＋ 章節 li 行高 1.9",
      /\.article-guide-body ol\.guide-list\{list-style:decimal\}/.test(src) && /#deepChapter \.article-guide-body li\{[^}]*line-height:1\.9/.test(src));

  console.log(fail === 0 ? "\n===== 全部通過（" + pass + "/" + pass + "）=====" : "\n===== 有失敗（" + pass + "/" + (pass + fail) + "）=====");
  process.exit(fail === 0 ? 0 : 1);
}, 300);
