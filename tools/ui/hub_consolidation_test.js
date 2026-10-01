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
chk("★ show() 清單有 dims 同 scenes", /"hub","dims"/.test(src) && /"dims","scenes","letter"/.test(src));
chk("★ 光譜 5 段齊（E/I、S/N、T/F、J/P、T/A）", (function(){ const m = src.match(/window\.HUB_LETTERS = \[[\s\S]*?\n\];/); if(!m) return false; const t = m[0]; return ["E vs I","S vs N","T vs F","J vs P","T vs A"].every(x => t.includes(x)); })());
chk("★ 光譜段有「唔係…」澄清句", /唔係「內向 = 怕醜」/.test(src) && /唔係「P 型 = 散漫」/.test(src));
chk("★ 16 型卡下面直接係測試入口（hubCta + 選擇測試版本）", /id="hubCta"[\s\S]{0,160}選擇測試版本/.test(src));
chk("★ 測試入口用 goPickVersion（去主頁揀版本位）", /id="hubCta"[\s\S]{0,200}goPickVersion\(\)/.test(src));
chk("★ 百科只留一個測試入口（舊「返主頁開始測試」已清）", (function(){ const i = src.indexOf('<section id="hub"'); const j = src.indexOf('<section id="scenes"'); const hub = src.slice(i, j > i ? j : src.indexOf('<section id="dims"')); return !/返主頁開始測試/.test(hub) && (hub.match(/選擇測試版本/g) || []).length === 1; })(), (function(){ const i = src.indexOf('<section id="hub"'); const j = src.indexOf('<section id="scenes"'); const hub = src.slice(i, j > i ? j : i + 9000); return "舊掣 " + ((hub.match(/返主頁開始測試/g) || []).length) + " 個、測試版本 " + ((hub.match(/選擇測試版本/g) || []).length) + " 個"; })());
chk("★ 人格頁有「深入睇吓呢一型」入口卡", /id="typeMore"[\s\S]{0,200}id="typeMoreList"/.test(src));
chk("★ 三個入口函數都有定義", ["openSocialFor","openRomanceFor","openDeepFor"].every(f => new RegExp("window\\." + f + " = function").test(src)));
chk("★ 入口文案齊（個人相處／個人拍拖／人格深入分析）", /"個人相處"/.test(src) && /"個人拍拖"/.test(src) && /"人格深入分析"/.test(src));
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

  // ①b 場景攻略
  w.SOCIAL = { WhatsAppGroup: { name: "WhatsApp 群組", desc: "d" }, FamilyGathering: { name: "親戚飯局", desc: "d" }, TeaFriend: { name: "飲茶吹水朋友", desc: "d" }, GroupProject: { name: "Group Project 隊友", desc: "d" }, Roommate: { name: "室友", desc: "d" }, Workplace: { name: "返工同事", desc: "d" }, 失戀陪: { name: "失戀時陪佢", desc: "d" } };
  w.ROMANCE = { 拍拖: { name: "拍拖", desc: "d" }, 吵架: { name: "吵架", desc: "d" }, 分手: { name: "分手", desc: "d" } };
  w.openScenes();
  const rowsS = d.querySelectorAll("#scenesSocial .scene-go-row");
  const rowsR = d.querySelectorAll("#scenesRomance .scene-go-row");
  chk("★ 場景攻略：相處 7 個", rowsS.length === 7, "render 出 " + rowsS.length);
  chk("★ 場景攻略：拍拖 3 個", rowsR.length === 3, "render 出 " + rowsR.length);
  chk("★ 場景數係動態顯示（唔會寫死錯數字）", /scenesSocialN/.test(src) && !/（10 個場景）/.test(src));
  chk("★ 相處場景卡呼叫 openSocialScenario", /openSocialScenario\(/.test(rowsS[0].getAttribute("onclick")), rowsS[0].getAttribute("onclick"));
  chk("★ 拍拖場景卡呼叫 openRomanceScenario", /openRomanceScenario\(/.test(rowsR[0].getAttribute("onclick")), rowsR[0].getAttribute("onclick"));
  chk("★ 場景攻略最底有測試入口", /id="scenes"[\s\S]{0,3000}選擇測試版本/.test(src));

  // ② 人格頁三個入口
  w.openType("ENFP", "test");
  const rows = d.querySelectorAll("#typeMoreList .type-more-row");
  chk("★ 人格頁 render 出 3 個入口", rows.length === 3, "render 出 " + rows.length + " 個");
  chk("★ 入口 1 係個人相處、帶住 ENFP", /ENFP/.test(rows[0].getAttribute("onclick")), rows[0].getAttribute("onclick"));
  chk("★ 入口 2 係個人拍拖、帶住 ENFP", /ENFP/.test(rows[1].getAttribute("onclick")), rows[1].getAttribute("onclick"));
  chk("★ 入口 3 係深入分析、帶住 ENFP", /ENFP/.test(rows[2].getAttribute("onclick")), rows[2].getAttribute("onclick"));
  chk("★ 深入分析入口有「完整版」標記", /type-more-lock/.test(rows[2].innerHTML) && /完整版/.test(rows[2].textContent));
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
