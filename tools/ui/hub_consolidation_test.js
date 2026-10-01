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
chk("★ 16 型色卡（hub-bleed）同上內文距離夠（26px）→ 百科／深入分析入口卡唔會貼", /\.hub-bleed\{margin:0 -16px 26px/.test(src));
chk("★ 場景文章頁：色卡同上內文距離夠（26px）", /\.article-type-stage\{margin:0 -16px 26px/.test(src));
chk("★ 場景文章頁：最底入口卡同上內文唔貼（+9px）", /#socialArticle \.softbox-tight,#romanceArticle \.softbox-tight\{margin-top:9px\}/.test(src));
chk("★ 非主頁垂直間距統一 16px（卡片同非卡容器一致）", !/\.(persona-sect|article-guide|wiz-facts)\{[^}]*margin:[^;}]*20px/.test(src) && /\.persona-sect\{margin:0 4px 16px/.test(src) && /\.article-guide\{margin:0 4px 16px/.test(src));
chk("★ 全站測試入口文案統一：「想確認自己 MBTI 人格？」（唔准有舊文案）", !/睇完想試/.test(src) && (src.match(/想確認自己 MBTI 人格？/g) || []).length >= 9, (src.match(/想確認自己 MBTI 人格？/g) || []).length + " 處");
chk("★ 全站測試入口按鈕統一：「立即選擇測試版本」（唔准有舊按鈕字）", !/返主頁開始測試/.test(src) && !/>選擇測試版本</.test(src) && !/>立即開始</.test(src) && (src.match(/立即選擇測試版本/g) || []).length >= 9, (src.match(/立即選擇測試版本/g) || []).length + " 處");
chk("★ 測試入口全部呼叫 goPickVersion()", (src.match(/goPickVersion\(\)/g) || []).length >= 9, (src.match(/goPickVersion\(\)/g) || []).length + " 處");
chk("★ show() 清單有 dims 同 typeScenes（scenes 已刪）", /"hub","dims"/.test(src) && /"dims","typeScenes","letter"/.test(src) && !/\bdims","scenes/.test(src));
chk("★ 光譜 5 段齊（E/I、S/N、T/F、J/P、T/A）", (function(){ const m = src.match(/window\.HUB_LETTERS = \[[\s\S]*?\n\];/); if(!m) return false; const t = m[0]; return ["E vs I","S vs N","T vs F","J vs P","T vs A"].every(x => t.includes(x)); })());
chk("★ 光譜段有「唔係…」澄清句", /唔係「內向 = 怕醜」/.test(src) && /唔係「P 型 = 散漫」/.test(src));
chk("★ 測試入口卡有「選擇測試版本」掣", /id="hubCta"[\s\S]{0,160}選擇測試版本/.test(src));
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
chk("★ 文章頁底 softbox 換成「性格百科 + 呢一型其他場景」", (function(){
  const seg = src.slice(src.indexOf('id="socialArticle"'), src.indexOf('id="type"'));
  return !/softbox-btn" onclick="open(?:Social|Romance)\(\)/.test(seg) && /softbox-btn" onclick="openTypeScenes\(window\._lastArticleType\)"/.test(seg) && /softbox-btn" onclick="openHub\(\)"/.test(seg);
})(), (function(){ const seg = src.slice(src.indexOf('id="socialArticle"'), src.indexOf('id="type"')); return (seg.match(/softbox-btn" onclick="(\w+)/g) || []).join(" | "); })());
chk("★ 結果頁兩條 stale 連結換成性格百科", (function(){
  const i = src.indexOf('id="personalityDetail"');
  const seg = src.slice(Math.max(0, i - 1200), i);
  return !/點同人相處|點同人拍拖/.test(seg) && /onclick="openHub\(\)"/.test(seg);
})());
chk("★ 桌面導覽列同右選單一致（冇光譜／相處攻略）", (function(){
  const i = src.indexOf('id="dtNav"'), seg = src.slice(i, src.indexOf("</nav>", i));
  return /性格百科/.test(seg) && /stats\.html/.test(seg) && /record\.html/.test(seg) && !/openSpectrum|openSocial\(/.test(seg);
})());
chk("★ 頁底唔再留 96px 大白（class 已冇 pb-24，改 16px + 安全區）", !/class="[^"]*pb-24/.test(src) && /#app\{padding-bottom:calc\(16px \+ env\(safe-area-inset-bottom\)\)\}/.test(src), (src.match(/id="app" class="[^"]*"/) || [""])[0]);
chk("★ 測試入口用 goPickVersion（去主頁揀版本位）", /id="hubCta"[\s\S]{0,200}goPickVersion\(\)/.test(src));
chk("★ 百科兩個模式各有測試入口，舊「返主頁開始測試」已清", (function(){ const i = src.indexOf('<section id="hub"'); const hub = src.slice(i, src.indexOf('</section>', i)); return !/返主頁開始測試/.test(hub) && (hub.match(/選擇測試版本/g) || []).length === 2; })(), (function(){ const i = src.indexOf('<section id="hub"'); const hub = src.slice(i, src.indexOf('</section>', i)); return "舊掣 " + ((hub.match(/返主頁開始測試/g) || []).length) + " 個、測試版本 " + ((hub.match(/選擇測試版本/g) || []).length) + " 個"; })());
chk("★ 人格頁有「深入睇吓呢一型」入口卡", /id="typeMore"[\s\S]{0,200}id="typeMoreList"/.test(src));
chk("★ 人格頁入口合併為「X × N 個場景」＋「人格深入分析」（Roy 2026-10-01 方案 A）", (function(){ const i = src.indexOf("window.renderTypeMore"); const fn = src.slice(i, src.indexOf("window.openDeepFor", i)); return /openTypeScenes\('/.test(fn) && /"人格深入分析"/.test(fn) && !/"個人相處"/.test(fn) && !/"個人拍拖"/.test(fn); })());
chk("★ 入口函數都有定義", ["openTypeScenes","openDeepFor","renderTypeScenes"].every(f => new RegExp("window\\." + f + " = function").test(src)));
chk("★ typeScenes 分頁存在且有返回掣", /<section id="typeScenes"/.test(src) && /id="typeScenesList"/.test(src));
chk("★ 深入分析入口要解鎖（未解鎖跳升級頁）", /window\.openDeepFor = function\(code\)\{\s*\n?\s*if\(!window\.isUnlocked \|\| !window\.isUnlocked\(\)\)\{ window\.openUpgrade\(\); return; \}/.test(src));
chk("★ 相處／拍拖有「正在睇 XX」提示條", /scene-for-banner/.test(src) && /_socialForType/.test(src) && /_romanceForType/.test(src));
chk("★ 提示條有「睇全部 16 型」清除掣", /scene-for-clear/.test(src) && /window\._socialForType=null/.test(src));
chk("★ 新元素有黑暗模式覆蓋", /html\.dk \.type-more-row\{/.test(src) && /html\.dk \.scene-for-banner\{/.test(src));

// ── jsdom 真跑 ──
const dom = new JSDOM(src, { runScripts: "dangerously", pretendToBeVisual: true, url: "https://example.com/" });
const w = dom.window, d = w.document;
const $ = s => d.querySelector(s);

setTimeout(() => {
  // jsdom 唔會 load 外部 script → 手動注入必要資料
  if (!w.SOCIAL) w.SOCIAL = { WhatsAppGroup: { name: "WhatsApp 群", desc: "d" }, TeaFriend: { name: "飲茶朋友", desc: "d" } };
  if (!w.ROMANCE) w.ROMANCE = { 拍拖: { name: "拍拖", desc: "d" }, 吵架: { name: "吵架", desc: "d" } };
  if (!w.TYPES) w.TYPES = { ENFP: { name: "調停者" }, INTJ: { name: "建築師" } };

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
  const _A = { INTJ: "a", ENFP: "b" };
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
  w.closeHubScene();
  chk("★ 撳「全部場景」返到場景清單", !$("#hubSceneList").classList.contains("hidden") && $("#hubSceneDetail").classList.contains("hidden"));

  // ①c 該型 × 場景頁（由人格頁入）
  w.openTypeScenes("ENFP");
  const tsRows = d.querySelectorAll("#typeScenesList .scene-go-row");
  chk("★ 該型場景頁：10 個場景（ENFP）", tsRows.length === 10, "render 出 " + tsRows.length);
  chk("★ 該型場景頁標題帶型別碼", /ENFP/.test($("#typeScenesTitle").textContent), $("#typeScenesTitle").textContent);
  chk("★ 該型場景卡呼叫 typeScenesOpenSocial／Romance", /typeScenesOpen(Social|Romance)\(/.test(tsRows[0].getAttribute("onclick")), tsRows[0].getAttribute("onclick"));

  // ①d 相處／拍拖場景頁（#social 仍保留，由文章返回用）
  w.openSocial();
  w.openSocialScenario("WhatsAppGroup");
  const gridInSocial = d.querySelector("#socialScenarios .hub-type-grid");
  chk("★ 相處場景頁 render 出 16 型卡 grid", !!gridInSocial, gridInSocial ? "有" : "冇");
  chk("★ 相處／拍拖場景頁：16 型卡 grid 有下距（唔會貼住入口卡）", /#socialScenarios \.hub-type-grid,#romanceScenarios \.hub-type-grid\{margin-bottom:20px\}/.test(src));
  chk("★ 提示同 16 型卡 grid 之間有距離", /#socialScenarios \.hub-type-hint,#romanceScenarios \.hub-type-hint\{margin-bottom:10px\}/.test(src));

  // ①d 捲動位置記憶

  // ② 人格頁兩個入口（相處＋拍拖已合併成「X × 10 個場景」）
  w.openType("ENFP", "test");
  const rows = d.querySelectorAll("#typeMoreList .type-more-row");
  chk("★ 人格頁 render 出 2 個入口", rows.length === 2, "render 出 " + rows.length + " 個");
  chk("★ 入口 1 係「ENFP × 10 個場景」", /openTypeScenes\('ENFP'\)/.test(rows[0].getAttribute("onclick")), rows[0].getAttribute("onclick"));
  chk("★ 入口 1 標題有 N 個場景（動態）", /個場景/.test(rows[0].textContent), rows[0].textContent.trim().slice(0, 40));
  chk("★ 入口 2 係深入分析、帶住 ENFP", /ENFP/.test(rows[1].getAttribute("onclick")), rows[1].getAttribute("onclick"));
  chk("★ 深入分析入口有「完整版」標記", /type-more-lock/.test(rows[1].innerHTML) && /完整版/.test(rows[1].textContent));
  chk("★ 入口副標顯示呢一型（ENFP · 調停者）", /ENFP/.test($("#typeMoreSub").textContent), $("#typeMoreSub").textContent);

  // ③ 型優先：相處 banner
  w.openSocialFor("ENFP");
  const banner = $("#socialScenarios .scene-for-banner");
  chk("★ 由人格頁跳相處：有「正在睇 ENFP」提示條", !!banner, banner ? banner.textContent.trim() : "(冇)");
  chk("★ 提示條顯示型名", !!banner && /ENFP/.test(banner.textContent), banner ? banner.textContent.trim() : "");

  // ④ 清除 → 返全部 16 型
  if (banner) banner.querySelector(".scene-for-clear").click();
  chk("★ 撳「睇全部 16 型」後提示條消失", !$("#socialScenarios .scene-for-banner"));

  // ⑤ 拍拖 banner
  w.openRomanceFor("INTJ");
  const rb = $("#romanceScenarios .scene-for-banner");
  chk("★ 由人格頁跳拍拖：有「正在睇 INTJ」提示條", !!rb && /INTJ/.test(rb.textContent));

  // ⑥ 未解鎖：深入分析入口會跳升級頁
  w.openDeepFor("ENFP");
  chk("★ 未解鎖撳深入分析 → 跳升級頁", !$("#upgrade").classList.contains("hidden") || w._showing === "upgrade", "showing=" + w._showing);

  console.log(fail === 0 ? "\n===== 全部通過（" + pass + "/" + pass + "）=====" : "\n===== 有失敗（" + pass + "/" + (pass + fail) + "）=====");
  process.exit(fail === 0 ? 0 : 1);
}, 300);
