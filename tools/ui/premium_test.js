
// 完整版（星級）：主頁等級掣 → 升級頁 → 示範解鎖 → 人格深入分析（目錄／9 章導航）
const fs=require('fs'), path=require('path');
const {JSDOM, VirtualConsole}=require('jsdom');
const REPO=path.resolve(__dirname,'../..');
let ok=0,total=0; function chk(n,c,x){total++; if(c)ok++; console.log((c?'✓':'✗')+' '+n+(c?'':'   <- '+(x||'')));}
const src=fs.readFileSync(path.join(REPO,'index.html'),'utf8');
const sw=fs.readFileSync(path.join(REPO,'sw.js'),'utf8');
const prem=fs.readFileSync(path.join(REPO,'premium-data.js'),'utf8');
function stubCanvas(w){ const ctx=new Proxy({}, { get(k){ if(k==="canvas") return {width:720,height:1280}; if(k==="measureText") return ()=>({width:10}); if(/Gradient/.test(String(k))) return ()=>({addColorStop(){}}); return ()=>{}; }, set(){return true;} });
  w.HTMLCanvasElement.prototype.getContext=()=>ctx; w.HTMLCanvasElement.prototype.toDataURL=()=>"data:image/jpeg;base64,x"; w.Image=class{ set src(v){ setTimeout(()=>this.onload&&this.onload(),0); } }; }
let html=src.replace(/<script src="(https?:)?\/\/[^"]*"><\/script>/g,'').replace(/<script src="([^"]+\.js)"><\/script>/g,(m,f)=>fs.existsSync(path.join(REPO,f))?'<script>'+String.fromCharCode(10)+fs.readFileSync(path.join(REPO,f),'utf8')+String.fromCharCode(10)+'</script>':'');
const vc=new VirtualConsole(); const jerr=[]; vc.on('jsdomError',e=>{const m=String(e.message||e); if(!/scrollIntoView|scrollTo|Not implemented|Could not load/i.test(m)) jerr.push(m.slice(0,90));});
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://fung2222.github.io/hk-mbti/',virtualConsole:vc,
  beforeParse(w){ w.alert=()=>{}; w.confirm=()=>true; stubCanvas(w);
    try{ Object.defineProperty(w,'appDialog',{configurable:true,get(){return ()=>Promise.resolve(true);},set(){}}); }catch(e){}
    try{ Object.defineProperty(w,'appNotice',{configurable:true,get(){return ()=>Promise.resolve(true);},set(){}}); }catch(e){} }});
setTimeout(async ()=>{
  const w=dom.window, d=w.document;
  const $=(s)=>d.querySelector(s);
  const vis=(id)=>{const el=d.getElementById(id); return el && !el.classList.contains('hidden');};

  // ---------- 結構 ----------
  chk('主頁頂有等級掣 #tierBtn', !!$('#tierBtn'));
  chk('#tierBtn 撳落去呼叫 openUpgrade()', $('#tierBtn') && $('#tierBtn').getAttribute('onclick')==='openUpgrade()');
  chk('等級掣喺 hero 右上（同主題掣同一組 .home-top-actions）', !!$('.home-top-actions #tierBtn') && !!$('.home-top-actions #themeBtn'));
  chk('有升級頁 #upgrade 同解鎖掣 #upgradeCta', !!$('#upgrade') && !!$('#upgradeCta'));
  chk('有人格深入分析頁 #deep 同章節頁 #deepChapter', !!$('#deep') && !!$('#deepChapter'));
  chk('章節底部有 上一章 / 目錄 / 下一章', !!$('#deepPrev') && !!$('#deepToc') && !!$('#deepNext'));
  chk('premium-data.js 有 PREMIUM.INTJ 9 章', /window\.PREMIUM\s*=/.test(prem) && (prem.match(/t:"/g)||[]).length>=9);
  chk('premium-data.js 已由 index.html 載入', /premium-data\.js/.test(src));
  chk('sw.js 有 cache premium-data.js', /premium-data\.js/.test(sw));
  chk('sw.js premium-data.js 走 network-first（內容更新即時生效）', /premium-data\.js";\s*\n?\s*if\(isHTML\)/.test(sw) || /endsWith\("premium-data\.js"\)/.test(sw));

  // ---------- 探索更多入口 + 下拉鎖 + 字級（Roy 2026-10-01） ----------
  chk('★ 探索更多已收窄（冇 deep／social／romance／spectrum 入口）', !/class="home-acc-item" data-acc="(deep|social|romance|spectrum)"/.test(src), (src.match(/class="home-acc-item" data-acc="[a-z]+"/g) || []).join(" "));
  chk('★ 探索更多已冇「場景攻略」入口（Roy 2026-10-01：全部收埋入百科）', !/data-acc="scenes"/.test(src) && !/openScenes\(\)/.test(src));
  chk('★ 百科有雙模式切換（由人格睇／由場景睇）', /class="hub-mode-btn is-on" data-mode="type"/.test(src) && /data-mode="scene"/.test(src) && /window\.setHubMode = function/.test(src));
  chk('★ 探索更多順序：關於→百科→統計→計分→私隱（Roy 指定）', (function(){ const b = src.slice(src.indexOf('id="homeAccordion"')); const got = [...b.matchAll(/class="home-acc-item" data-acc="([a-z]+)"/g)].map(m => m[1]); return JSON.stringify(got) === JSON.stringify(["about","hub","stats","method","privacy"]); })(), (function(){ const b = src.slice(src.indexOf('id="homeAccordion"')); return [...b.matchAll(/class="home-acc-item" data-acc="([a-z]+)"/g)].map(m => m[1]).join(" → "); })());
  chk('★ 人格頁「深入」tab 有 9 章入口（免費用戶標「第 1 章免費」）', (function(){ const i = src.indexOf("window.renderTypeTabs = function"); if(i < 0) return false; const fn = src.slice(i, src.indexOf("window.openDeepChapterFromType", i)); return /deep-tag is-free">免費</.test(fn) && /deep-tag">完整版</.test(fn) && /openDeepChapterFromType\(/.test(fn); })());
  chk('★ 免費用戶撳深入分析入口直入目錄（目錄全開放，唔再跳升級頁）', !/window\.openDeepFor = function\(code\)\{[\s\S]{0,110}openUpgrade\(\)/.test(src));
  chk('★ 主頁頂仍有星級用戶入口', /id="tierBtn"/.test(src));
  chk('★ 目錄項已經冇「睇」字（Roy 話唔需要）', !/deep-go">睇/.test(src));
  chk('★ 開放下拉重整（Roy 要求；唔再鎖 no-pull）', !/html\.no-pull/.test(src) && !/_noPull/.test(src));
  chk('html 有底色（下拉唔會露白，唔靠鎖 overscroll）', /html\{background:var\(--paper\)\}/.test(src));
  chk('測試頁仍然鎖下拉（防誤觸清走 60 題進度）', /body\.in-test\{overscroll-behavior-y:contain/.test(src));
  chk('★ 型別代號放大到 19px', /\.deep-code\{color:var\(--tc\);font-size:19px/.test(src));
  chk('★ 章節標題放大（21px、可換行）', /#deepChapterTitle\{font-size:21px;white-space:normal/.test(src));
  chk('鎖標籤有黑暗模式覆蓋', /html\.dk \.home-acc-lock/.test(src));

  // ---------- 返回鍵鏈（Roy 2026-10-01 報：完整版入到章節按返回返唔到主頁）----------
  chk('★ 返回還原認識 upgrade／deep／deepChapter', /if\(id === "upgrade"\)\{ show\("upgrade"\); return; \}/.test(src) && /if\(id === "deepChapter"\)\{/.test(src));
  chk('★ 導航快照記住 deepType / deepCh（還原得返邊一型邊一章）', /deepType: window\._deepType \|\| null,/.test(src) && /deepCh: \(typeof window\._deepCh === "number"/.test(src));
  chk('★ 章節頁「返回」用 goBack()（同系統返回鍵一致）', /window\.backToDeepToc = function\(\)\{\s*\n\/\/[^\n]*\nif\(\(window\._histDepth \|\| 0\) > 0\)\{ window\.goBack\(\); return; \}/.test(src));

  // ---------- 初始狀態（免費） ----------
  chk('初始 label = 免費版', $('#tierLabel').textContent.trim()==='免費版', $('#tierLabel').textContent);
  chk('初始冇 is-full class', !$('#tierBtn').classList.contains('is-full'));
  chk('初始 show deep 之前 deep 係收埋', !vis('deep'));

  // ---------- 撳等級掣 → 升級頁 ----------
  w.openUpgrade();
  chk('免費用戶撳等級掣 → 去 #upgrade', vis('upgrade') && !vis('home'), 'upgrade='+vis('upgrade'));
  chk('升級頁有價錢 HK$18', /HK\$18/.test($('#upgrade .up-price').textContent));
  chk('升級頁有免費／完整對比表', !!$('#upgrade table.up-cmp'));
  // ---------- 目錄全開放 + 第 1 章免費（Roy 2026-10-02）----------
  const _s=(ms)=>new Promise(r=>setTimeout(r,ms));
  w.localStorage.setItem('hkmbti_tier','free'); w.renderTier();
  w.show('home'); await _s(30); w.openDeep(); await _s(40);
  chk('★ 免費用戶 openDeep() 入到 16 型目錄（目錄全開放）', vis('deep') && d.querySelectorAll('#deepTypeGrid .hub-type-card').length===16, 'deep='+vis('deep'));
  w.openDeepType('INTJ'); await _s(40);
  chk('★ 免費用戶睇得到 9 章目錄', d.querySelectorAll('#deepList .deep-item').length===9, d.querySelectorAll('#deepList .deep-item').length);
  chk('★ 第 1 章標「免費」', /deep-tag is-free">免費/.test($('#deepList').innerHTML));
  chk('★ 第 2–9 章標「完整版」（8 個）', ($('#deepList').innerHTML.match(/deep-tag">完整版/g)||[]).length===8, ($('#deepList').innerHTML.match(/deep-tag">完整版/g)||[]).length);
  chk('★ 目錄頂卡寫「第 1 章免費，其餘要完整版」', /第 1 章免費，其餘要完整版/.test($('#deepList').textContent));
  w.openDeepChapter(0); await _s(40);
  chk('★ 免費用戶開得到第 1 章', vis('deepChapter'), 'deepChapter='+vis('deepChapter'));
  chk('★ 第 1 章 head = 第 1 章 · 免費試睇', $('#deepChapterHead').textContent==='第 1 章 · 免費試睇', $('#deepChapterHead').textContent);
  chk('★ 第 1 章有真內容（>300 字元）', $('#deepChapterBody').innerHTML.length>300, $('#deepChapterBody').innerHTML.length);
  w.openDeepChapter(1); await _s(40);
  chk('★ 免費用戶撳第 2 章 → 彈升級頁', vis('upgrade'), 'upgrade='+vis('upgrade'));
  chk('★ 把關喺 openDeepChapter（唔係入口把關）', /if\(i > 0 && window\.getTier\(\) !== "full"\)\{ window\.openUpgrade\(\); return; \}/.test(src));
  chk('★ .deep-tag 有黑暗模式覆蓋', /html\.dk \.deep-tag\{/.test(src) && /html\.dk \.deep-tag\.is-free\{/.test(src));
  chk('★ 升級頁有提「第 1 章免費」', /第 1 章免費/.test($('#upgrade').textContent));
  chk('★ 對比表：免費欄寫住「第 1 章」', /<td class="yes">第 1 章<\/td>/.test(src));

  // ---------- 示範解鎖 ----------
  await w.unlockFull();
  await new Promise(r=>setTimeout(r,320));
  chk('解鎖後 localStorage hkmbti_tier = full', w.localStorage.getItem('hkmbti_tier')==='full', w.localStorage.getItem('hkmbti_tier'));
  chk('解鎖後等級掣變「完整版」', $('#tierLabel').textContent.trim()==='完整版', $('#tierLabel').textContent);
  chk('解鎖後等級掣加 is-full（金色）', $('#tierBtn').classList.contains('is-full'));
  chk('解鎖後升級頁 CTA 文字改變', /已解鎖/.test($('#upgradeCta').textContent), $('#upgradeCta').textContent);
  chk('解鎖後自動去人格深入分析', vis('deep'), 'deep='+vis('deep'));
  chk('★ 解鎖後撳深入分析入口會直入（唔再彈升級頁）', (function(){ const before = vis('deep'); w.openType('ENFP','test'); w.openDeepFor('ENFP'); return vis('deep') && w._showing === 'deep'; })(), 'showing=' + w._showing);
  chk('★ 解鎖後人格頁深入 tab 唔再標「完整版」（內容已解鎖）', (function(){
    w.openType('ENFP','test');
    const h = $('#typeDeepBox').innerHTML;
    return h.length > 0 && !/deep-tag/.test(h) && /openDeepChapterFromType\(/.test(h);
  })(), $('#typeDeepBox').innerHTML.slice(0,70));

  // ---------- 16 型目錄（色卡版，參考性格百科排位）----------
  // 回 16 型選擇層（上面嘅入口測試會去咗某一型嘅 9 章目錄，同下面斷言無關）
  // ⚠️ 一定要顯式重設：唔可以靠「某一型未有內容所以 fallback 返 16 型格」
  //    —— 16 型寫齊之後就唔會再 fallback（2026-10-02 中過招）
  w.openDeep(); await _s(40);
  const cards=[...d.querySelectorAll('#deepTypeGrid .hub-type-card')];
  chk('★ 深入分析目錄用 16 張色卡（同性格百科同一款）', cards.length===16, cards.length);
  chk('★ 用返同一套 4 欄密格（hub-type-grid）', !!d.querySelector('#deepList .hub-type-grid'));
  chk('★ 分頁有標題組（金標＋說明＋提示，同性格百科同格式）', !!d.querySelector('#deep #deepIntro'));
  chk('★ 標題組用性格百科同款金標（16 種人格深入分析）', /16 種人格深入分析/.test($('#deep #deepIntro h3').textContent), $('#deep #deepIntro h3').textContent);
  chk('★ 說明文字整合 9 章內容（核心動機→日常相處）', /核心動機/.test($('#deep #deepIntro').textContent) && /日常相處/.test($('#deep #deepIntro').textContent));
  chk('★ 用性格百科同款滿版格式（hub-bleed）', !!d.querySelector('#deep .hub-bleed .hub-bleed-inner'));
  chk('★ 提示喺 16 型格上面（左上，唔再喺左下）', (function(){ const h=$('#deep #deepHint'), g=$('#deepTypeGrid'); return !!h && !!g && (h.compareDocumentPosition(g) & 4) > 0; })());
  chk('★ 提示文字係「請選擇其中一種人格」', /請選擇其中一種人格/.test($('#deep #deepHint').textContent), $('#deep #deepHint').textContent);
  chk('★ 提示唔喺卡片內（貼 16 種色牌上面，同性格百科排位一樣）', !$('#deep #deepIntro .hub-type-hint'), 'càrd內='+!!$('#deep #deepIntro .hub-type-hint'));
  chk('★ 提示喺色牌上面（DOM 次序；同 #hub 一致）', (function(){ const a=$('#deep .hub-type-hint'), b=$('#hub .hub-type-hint'); return !!a && !!b && a.className===b.className && a.textContent===b.textContent; })());
  chk('★ 提示靠左對齊（左上）', /\.hub-type-hint\{[^}]*text-align:left/.test(src));
  chk('★ 頁面結構同性格百科一樣（page-hero → 卡片 → hub-bleed → CTA 卡）', (function(){ const s=$('#deep'); const kids=[...s.children].map(e=>e.className); return kids.some(c=>c.includes('page-hero')) && kids.some(c=>c.includes('card')&&c.includes('mb-4')) && kids.some(c=>c.includes('hub-bleed')) && kids.filter(c=>c.includes('softbox')).length===1; })());
  chk('★ hub-bleed 唔會直接接住深色 top bar（冇「多一行」白色橫帶）', (function(){ const s=$('#deep'); const kids=[...s.children]; const heroIdx=kids.findIndex(e=>e.className.includes('page-hero')); return heroIdx>=0 && !kids[heroIdx+1].className.includes('hub-bleed'); })());
  chk('★ 版頭金標同性格百科一致（brand-gold + 場景 icon）', (function(){ const c=$('#deep #deepIntro'); return !!c && !!c.querySelector('h3.brand-gold') && !!c.querySelector('h3 .scenes-title-ico') && !!c.querySelector('p.text-gray-600'); })());
  chk('★ hub-bleed 內有提示 + 16 型格（同百科排位一樣）', (function(){ const b=$('#deep .hub-bleed-inner'); return !!b && !!b.querySelector('.hub-type-hint') && !!b.querySelector('#deepTypeGrid'); })());
  chk('★ 版頭簡介做成卡片（.card）', (function(){ const b=$('#deep #deepIntro'); return !!b && !!b.querySelector('.card h3.brand-gold') && !!b.querySelector('.card p.text-gray-600'); })());
  chk('★ 金標下面有一行黑大字（深入自我探索）', (function(){ const c=$('#deep #deepIntro'); return !!c && !!c.querySelector('.deep-lead') && c.querySelector('.deep-lead').textContent.includes('深入'); })(), (function(){ const e=$('#deep #deepIntro .deep-lead'); return e ? e.textContent : '(冇)'; })());
  chk('★ 黑大字喺金標下面、說明文字上面（DOM 次序）', (function(){ const c=$('#deep #deepIntro'); const h=c.querySelector('h3.brand-gold'), l=c.querySelector('.deep-lead'); return !!h && !!l && (h.compareDocumentPosition(l) & 4) > 0; })());
  chk('★ 黑大字係深色大字（19px / 900 / var(--ink)）', /\.deep-lead\{font-size:19px;font-weight:900;[^}]*color:var\(--ink\)/.test(src));
  chk('★ 版頭卡片有「有咩睇」同「有咩用」兩句', /核心動機/.test($('#deep #deepIntro').textContent) && /點相處/.test($('#deep #deepIntro').textContent));
  chk('★ 16 型格下面有測試入口卡', (function(){ const c=$('#deep #deepCta'), g=$('#deepTypeGrid'); return !!c && !!g && (g.compareDocumentPosition(c) & 4) > 0; })());
  chk('★ 測試入口文案同人格分頁一致（想知道自己 MBTI 人格？）', /想知道自己 MBTI 人格？/.test($('#deep #deepCta').textContent), $('#deep #deepCta').textContent.trim());
  chk('★ 16 型格同下面卡片有距離（hub-bleed margin-bottom 12px；Roy 2026-10-02 要緊啲）', /\.hub-bleed\{margin:0 -16px 12px/.test(src));
  chk('★ 上面卡片同 16 型格有距離（mb-4）', /<div class="card p-4 mb-4">/.test(src));
  chk('★ 測試入口掣去揀版本頁（goPickVersion）', /onclick="goPickVersion\(\)">立即測試/.test(src));
  chk('★ 入型別目錄時測試入口一齊收埋', /deepCta"[\s\S]{0,90}display = "none"/.test(src));
  chk('★ 返 16 型層時測試入口出返', /deepCta"[\s\S]{0,120}display = ""/.test(src));
  chk('★ 已清走舊 .deep-intro / .deep-chips CSS（唔留死碼）', !/\.deep-intro\{/.test(src) && !/\.deep-intro-sub\{/.test(src) && !/\.deep-chips\{/.test(src));
  // ---------- 人格分頁最底 CTA（Roy 2026-10-01）----------
  chk('★ 人格分頁最底文案改咗（想知道自己 MBTI 人格？）', /想知道自己 MBTI 人格？/.test(src));
  chk('★ 測試入口文案全站統一（想知道自己 MBTI 人格？）', (src.match(/想知道自己 MBTI 人格？/g) || []).length >= 8 && !/睇完想試/.test(src));
  chk('★ 測試入口按鈕全站統一（立即測試；Roy 2026-10-04 改）', (src.match(/>立即測試</g) || []).length >= 14 && !/立即選擇測試版本/.test(src) && !/返主頁開始測試/.test(src));
  chk('★ goPickVersion 存在（show home + 捲到 #homeBelow）', /window\.goPickVersion = function\(\)\{[\s\S]{0,260}show\("home"\)[\s\S]{0,200}homeBelow/.test(src));
  // ---------- 全站「大寫字母／型別碼」字型一致性（Roy 2026-10-01：檢查全站色卡用返 Archivo Black）----------
  chk('★ 色卡 4 字母 .hub-type-code 用 Archivo Black', /\.hub-type-code\{\s*\nfont-family:'Archivo Black'/.test(src));
  chk('★ .type-code-txt 強制繼承字型（包咗 span 都唔會跌返 body 字型）', /\.type-code-txt\{display:block;font-family:inherit;font-weight:inherit;font-size:inherit/.test(src));
  chk('★ 結果頁大字母 #typeBig 用 Archivo Black', /#typeBig\{font-family:'Archivo Black'/.test(src));
  chk('★ 維度分頁大字母 #letterBig 都用 Archivo Black（原本漏咗）', /#letterBig\{font-family:'Archivo Black'/.test(src));
  chk('★ 維度字母 .dim-pair button 用 Archivo Black', /\.dim-pair button\{[^}]*Archivo Black/.test(src));
  chk('★ 文章牌匾 4 字母改用同 #typeBig 一組（text-5xl font-black）', ['socialArticleType','romanceArticleType','deepChapterType'].every(id=>new RegExp('class="text-5xl font-black mb-1" id="'+id+'"').test(src)));
  chk('★ 場景／章節牌匾已經唔用 .hub-type-code（只剩 16 型 hub 卡用）', !/class="hub-type-code" id="/.test(src));
  // Roy 2026-10-03：章節色卡要同人格頁色卡一模一樣 → 4 字母改用同 #typeBig 一組 class
  chk('★ 章節色卡 4 字母跟人格頁 #typeBig（text-5xl font-black）',
      /class="text-5xl font-black mb-1" id="deepChapterType"/.test(src) && /class="text-5xl font-black mb-1" id="typeBig"/.test(src));
  chk('★ 三塊文章色卡（相處／拍拖／章節）都唔再係滿版（.card p-6 mb-[26px] ＋ type-hero-row/mid）', (src.match(/class="card p-6 mb-\[26px\]"/g)||[]).length===3 && !/article-type-stage/.test(src) && (src.match(/class="type-hero-row"/g)||[]).length>=3);
  // Roy 2026-10-03：九章目錄號碼 icon → 星星 + 標題上加「第X章」
  chk('★ 九章目錄：號碼方塊 .deep-num 已清走（死 CSS 都清）', !/deep-num/.test(src));
  chk('★ 九章目錄：每章有星星 icon（.deep-star，金色）', (src.match(/class="deep-star"/g)||[]).length===2 && /\.deep-star svg\{[^}]*fill:#C8A24C/.test(src));
  chk('★ 九章目錄：標題上面有「第X章」（兩處 renderer 都有）', (src.match(/deep-ch">第'/g)||[]).length===2);
  // ---------- 全站色卡文字比例統一（Roy 2026-10-01：用主頁色卡比例）----------
  chk('★ 色卡基準 font-size:24px 喺 .hub-type-card', /\.hub-type-card\{[^}]*font-size:24px/.test(src));
  chk('★ 4 字母 = 1em（跟基準）', /\.hub-type-code\{\s*\nfont-family:'Archivo Black'[^}]*font-size:1em/.test(src));
  chk('★ 中文 = .5em（= 12px）', /\.hub-type-cn\{font-size:\.5em/.test(src));
  chk('★ icon = .92em（= 22px）', /\.type-ico\{display:block;width:\.92em;height:\.92em/.test(src));
  chk('★ badge = .42em（= 10px）', /\.deep-badge\{[^}]*font-size:\.42em/.test(src));
  chk('★ 「進入」= .46em（= 11px）', /\.hub-type-go\{[^}]*font-size:\.46em/.test(src));
  chk('★ .article-type-card／.article-type-stage／.type-plaque-* 死 CSS 已清', !/article-type-card/.test(src) && !/article-type-stage/.test(src) && !/type-plaque-/.test(src));
  chk('★ 桌面轉輪基準移落 .hub-type-card', /html\.dt \.home-type-reel \.hub-type-card\{font-size:clamp/.test(src));
  chk('★ 冇任何色卡文字硬編 px（除基準 24px）', !/\.hub-type-code\{[^}]*font-size:\d+px/.test(src) && !/\.hub-type-cn\{[^}]*font-size:\d+px/.test(src) && !/\.article-type-card \.hub-type-code\{[^}]*font-size:\d+px/.test(src));
  chk('★ 簡介唔提「買斷」（Roy 指定：只講有咩睇、有咩用）', !/買斷/.test($('#deep #deepIntro').textContent), '');
  chk('INTJ 卡顯示「9 章」', /9 章/.test(cards[0].textContent), cards[0].textContent.replace(/\n/g,' '));
  // 動態判斷（唔綁死型號）：有內容顯示「N 章」、冇內容顯示「準備中」
  const _hasContent = (function(){ const keys = Object.keys(w.PREMIUM || {}); return cards.filter(c => keys.includes((c.getAttribute('onclick')||'').match(/'([A-Z]{4})'/)?.[1])); })();
  const _noContent = (function(){ const keys = Object.keys(w.PREMIUM || {}); return cards.filter(c => !keys.includes((c.getAttribute('onclick')||'').match(/'([A-Z]{4})'/)?.[1])); })();
  chk('★ 有內容嘅型全部顯示「9 章」', _hasContent.length > 0 && _hasContent.every(c => /9 章/.test(c.textContent)), _hasContent.length + ' 型：' + _hasContent.map(c=>c.textContent.replace(/\n/g,'')).join(' '));
  chk('★ 未有內容嘅型全部顯示「準備中」', _noContent.every(c => /準備中/.test(c.textContent)), _noContent.length + ' 型未有內容');
  chk('★ 16 型寫齊之後，冇任何一格顯示「準備中」', _noContent.length > 0 || _hasContent.every(c => !/準備中/.test(c.textContent)), _hasContent.length + ' 型有內容');
  chk('★ premium-data.js 每個型都係 9 章（型號數 × 9 = 章數）', (function(){
    const types = (prem.match(/^[A-Z]{4}: \{/gm) || []).length;
    const chapters = (prem.match(/\{ t:"/g) || []).length;
    return types > 0 && chapters === types * 9;
  })(), (prem.match(/^[A-Z]{4}: \{/gm)||[]).length + ' 型 × 9 = ' + ((prem.match(/^[A-Z]{4}: \{/gm)||[]).length*9) + '，實際 ' + (prem.match(/\{ t:"/g)||[]).length + ' 章');
  chk('★ 每章都有 s（摘要）同 b（內文）', (prem.match(/\{ t:"[^"]+",\s*\n\s*s:"[^"]+",\s*\n\s*b:`/g) || []).length === (prem.match(/\{ t:"/g) || []).length, (prem.match(/\{ t:"/g)||[]).length + ' 章');
  chk('★ 每個型都有 cn（中文名）', (prem.match(/cn:"[^"]+"/g) || []).length >= (prem.match(/^[A-Z]{4}: \{/gm) || []).length);
  chk('★ 卡有該型漸變色（唔係文字格）', /linear-gradient\(135deg,#6B4E9E/.test(cards[0].getAttribute('style')), cards[0].getAttribute('style'));
  chk('★ 16 張卡各有自己顏色', (new Set(cards.map(c=>(c.getAttribute('style')||'').match(/#[0-9A-Fa-f]{6}/g)?.join()))).size === 16);
  // ---------- 港物件 icon（第一版 9 個，實心）----------
  const icons=fs.readFileSync(path.join(REPO,'type-icons.js'),'utf8');
  const iconCodes=(icons.match(/^\s*([A-Z]{4}):/gm)||[]).map(s=>s.trim().replace(':',''));
  chk('★ type-icons.js 有齊 16 個 icon', iconCodes.length===16, iconCodes.join(','));
  chk('★ 16 個型齊（一個都唔少）', ['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP'].every(c=>iconCodes.includes(c)), iconCodes.join(','));
  chk('★ 每個 icon 都係 24×24 SVG + currentColor（自動跟卡色）', (icons.match(/viewBox="0 0 24 24"/g)||[]).length===16 && (icons.match(/fill="currentColor"/g)||[]).length>=16, 'viewBox='+(icons.match(/viewBox="0 0 24 24"/g)||[]).length+' currentColor='+(icons.match(/fill="currentColor"/g)||[]).length);
  chk('★ 全部實心（唔係淨線）—— 每 icon 都有 fill 形狀', (icons.match(/<(rect|circle|path|polygon)/g)||[]).length>=30, (icons.match(/<(rect|circle|path|polygon)/g)||[]).length);
  chk('icon 冇用 emoji', !/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(icons));
  chk('★ 16 張卡全部有 .type-ico', cards.filter(c=>c.querySelector('.type-ico')).length===16, cards.filter(c=>c.querySelector('.type-ico')).length);
  chk('卡內 icon 真係 SVG 元素', cards.filter(c=>c.querySelector('.type-ico svg')).length===16, cards.filter(c=>c.querySelector('.type-ico svg')).length);
  chk('type-icons.js 已由 index.html 載入', /type-icons\.js/.test(src));
  chk('sw.js 有 cache type-icons.js', /type-icons\.js/.test(sw));
  chk('★ icon 水平置中（唔會貼左邊）', /\.type-ico\{display:block;width:\.92em;height:\.92em;margin:0 auto/.test(src));
  chk('★ icon 同 4 字母有留白（唔會貼實）', /margin:0 auto \.21em/.test(src));
  chk('★ icon 喺 4 字母上面（.hub-type-code 內 DOM 次序）', (function(){ const h=cards[0].querySelector('.hub-type-code'); if(!h) return false; const k=h.querySelector('.type-ico'), t=h.querySelector('.type-code-txt'); return !!k && !!t && (k.compareDocumentPosition(t) & 4) > 0; })());
  chk('★ 4 字母文字冇壞（textContent 仍然係 4 個字母）', /^[A-Z]{4}$/.test(cards[0].querySelector('.hub-type-code').textContent.trim()), cards[0].querySelector('.hub-type-code').textContent.trim());
  chk('★ 章節頁內文唔再咁迫（行高 1.9、段距 16px）', /#deepChapter \.article-guide-body p\{margin:0 0 16px;line-height:1\.9;\}/.test(src));
  chk('★ 章節頁小標題上下留白加大（28/11）', /#deepChapter \.article-guide-body \.article-guide-kicker\{margin:28px 0 11px/.test(src));
  chk('鬆排版只 scope #deepChapter（唔影響相處／拍拖攻略）', /\.article-guide-body p\{\s*\nmargin:0 0 12px;line-height:1\.6/.test(src));

  // ---------- icon 鋪晒所有「英文大字」位（Roy 要求）----------
  const _w=(ms)=>new Promise(r=>setTimeout(r,ms));
  await _w(30); w.show('hub'); await _w(60);
  const hubCards=[...d.querySelectorAll('#hubTypeGrid .hub-type-card')];
  chk('★ 性格百科：16 張卡都有 icon', hubCards.length===16 && hubCards.filter(c=>c.querySelector('.hub-type-code .type-ico svg')).length===16, hubCards.length+' / '+hubCards.filter(c=>c.querySelector('.hub-type-code .type-ico svg')).length);
  chk('★ 主頁轉輪：32 張卡（16+16 複本）都有 icon', (function(){ const r=[...d.querySelectorAll('#homeTypeReel .hub-type-card')]; return r.length===32 && r.filter(c=>c.querySelector('.type-ico svg')).length===32; })(), (function(){ const r=[...d.querySelectorAll('#homeTypeReel .hub-type-card')]; return r.length+' / '+r.filter(c=>c.querySelector('.type-ico svg')).length; })());
  w.openSocialArticle('WhatsAppGroup','INTJ'); await _w(70);
  chk('★ 相處攻略：型別大字＝純 4 字母（同人格頁色卡一致，冇 icon）', !!d.getElementById('socialArticleType') && !d.querySelector('#socialArticleType .type-ico'));
  chk('★ 相處攻略：仍然讀得返型別 code（唔會因為加 icon 而壞）', d.querySelector('#socialArticleType').dataset.code==='INTJ', d.querySelector('#socialArticleType').dataset.code);
  w.openRomanceArticle('拍拖','INTJ'); await _w(70);
  chk('★ 拍拖攻略：型別大字＝純 4 字母（同人格頁色卡一致，冇 icon）', !!d.getElementById('romanceArticleType') && !d.querySelector('#romanceArticleType .type-ico'));
  chk('★ 拍拖攻略：仍然讀得返型別 code', d.querySelector('#romanceArticleType').dataset.code==='INTJ', d.querySelector('#romanceArticleType').dataset.code);
  chk('卡撳落去開該型目錄', /openDeepType\('INTJ'\)/.test(cards[0].getAttribute('onclick')));

  // ---------- 型別 9 章目錄 ----------
  w.openDeepType('INTJ');
  chk('★ 型別目錄層：標題組要收埋（Roy 話章節目唔需要）', $('#deep #deepIntro').style.display==='none', $('#deep #deepIntro').style.display);
  chk('★ 型別目錄內冇簡介標題句', !/揀一種人格/.test($('#deepList').textContent));
  chk('★ 型別目錄內冇提示（提示只喺 16 型選擇層）', !/撳入去/.test($('#deepList').textContent));
  const toc=[...d.querySelectorAll('#deepList .deep-item')];
  chk('INTJ 目錄有 9 章', toc.length===9, toc.length);
  chk('目錄每章有星星 icon ＋ 標題上「第一章」..「第九章」（號碼方塊已換走）',
      toc.length===9 && !toc[0].querySelector('.deep-num') && !!toc[0].querySelector('.deep-star svg')
      && toc[0].querySelector('.deep-ch').textContent==='第一章' && toc[8].querySelector('.deep-ch').textContent==='第九章',
      (toc[0].querySelector('.deep-ch')||{}).textContent);
  chk('目錄有「返全部 16 型」', /返全部 16 型/.test($('#deepList').textContent));

  // ---------- 章節頁 + 上一章／下一章 ----------
  w.openDeepChapter(0);
  chk('第 1 章：crumb = INTJ · 1 / 9', $('#deepChapterCrumb').textContent==='INTJ · 1 / 9', $('#deepChapterCrumb').textContent);
  chk('第 1 章：標題 = 你真正想要嘅嘢', $('#deepChapterTitle').textContent==='你真正想要嘅嘢', $('#deepChapterTitle').textContent);
  chk('第 1 章：上一章 disabled', $('#deepPrev').disabled===true);
  chk('第 1 章：下一章可用', $('#deepNext').disabled===false);
  chk('章節標示係完整版內容', /完整版/.test($('#deepChapterHead').textContent), $('#deepChapterHead').textContent);
  chk('章節內文有渲染（<p> 段落）', /<p>/.test($('#deepChapterBody').innerHTML), $('#deepChapterBody').innerHTML.slice(0,50));
  chk('★ 章節頁型別卡有該型漸變色（唔係淨灰）', /linear-gradient/.test($('#deepChapterHero').style.background) && (/rgb\(107,\s*78,\s*158\)/.test($('#deepChapterHero').style.background) || /#6B4E9E/i.test($('#deepChapterHero').style.background)), $('#deepChapterHero').style.background);
  chk('型別目錄標題都有型色', /--tc:#6B4E9E/.test($('#deepList').innerHTML));
  w.deepStep(1);
  chk('撳下一章 → 2 / 9', $('#deepChapterCrumb').textContent==='INTJ · 2 / 9', $('#deepChapterCrumb').textContent);
  w.openDeepChapter(8);
  chk('第 9 章：下一章 disabled', $('#deepNext').disabled===true);
  chk('第 9 章 crumb = INTJ · 9 / 9', $('#deepChapterCrumb').textContent==='INTJ · 9 / 9', $('#deepChapterCrumb').textContent);
  w.backToDeepToc();
  await new Promise(r=>setTimeout(r,120));
  chk('撳「返回」回目錄（9 章）', vis('deep') && d.querySelectorAll('#deepList .deep-item').length===9, 'showing='+w._showing);
  chk('章節頁有免責聲明（MBTI 係性格參考）', /MBTI 係性格參考/.test(prem));

  // ---------- 鐵律 ----------
  chk('新內容冇 emoji', !/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test($('#upgrade').textContent + $('#deepChapter').textContent + prem.replace(/\/\/[^\n]*/g,'')));
  chk('等級掣有黑暗模式覆蓋（html.dk .tier-btn）', /html\.dk \.tier-btn/.test(src));
  chk('升級頁／深入分析走 dark 覆蓋（html.dk .up-cmp / .deep-ch / .deep-star）', /html\.dk \.up-cmp/.test(src) && /html\.dk \.deep-ch/.test(src) && /html\.dk \.deep-star svg/.test(src));
  chk('冇改動版本號（仍然 2.0.0）', /"version":\s*"2\.0\.0"/.test(fs.readFileSync(path.join(REPO,'manifest.json'),'utf8')));

  // ---------- 真跑：完整返回鏈（4 層）----------
  const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
  const grid16=()=>d.querySelectorAll('#deepTypeGrid .hub-type-card').length;
  const toc9=()=>d.querySelectorAll('#deepList .deep-item').length;
  w.localStorage.setItem('hkmbti_tier','full');   // 已解鎖情境
  w.renderTier();
  w.show('home'); await sleep(40);
  w.openDeep(); await sleep(40);                  // 16 型選擇
  chk('層 1：主頁 → 16 型選擇（16 張色卡）', w._showing==='deep' && grid16()===16, 'showing='+w._showing+' 卡='+grid16());
  w.openDeepType('INTJ'); await sleep(40);        // 型別 9 章目錄
  chk('層 2：16 型選擇 → INTJ 9 章目錄', w._showing==='deep' && toc9()===9, 'toc='+toc9());
  w.openDeepChapter(2); await sleep(40);          // 章節
  chk('層 3：→ 章節 3 / 9', w._showing==='deepChapter' && $('#deepChapterCrumb').textContent==='INTJ · 3 / 9');

  w.goBack(); await sleep(160);                   // 返回 1
  chk('★ 返回 1：章節 → 返到 INTJ 9 章目錄', w._showing==='deep' && toc9()===9, 'showing='+w._showing+' toc='+toc9());
  w.goBack(); await sleep(160);                   // 返回 2
  chk('★ 返回 2：型別目錄 → 返到 16 型選擇（唔係跳去主頁！）', w._showing==='deep' && grid16()===16, 'showing='+w._showing+' 卡='+grid16());
  chk('★ 返到 16 型選擇時標題組會出返', $('#deep #deepIntro').style.display!=='none', $('#deep #deepIntro').style.display);
  w.goBack(); await sleep(160);                   // 返回 3
  chk('★ 返回 3：16 型選擇 → 返到主頁', w._showing==='home', 'showing='+w._showing);
  chk('★ 返到主頁時主頁真係顯示', !d.getElementById('home').classList.contains('hidden'));

  // 「返全部 16 型」掣亦要行 history（唔係直接跳）
  w.openDeep(); await sleep(40); w.openDeepType('INTJ'); await sleep(40);
  chk('「返全部 16 型」掣用 deepBackToTypes（行 history）', /onclick="deepBackToTypes\(\)"/.test(src));
  w.deepBackToTypes(); await sleep(160);
  chk('★ 撳「返全部 16 型」真係返到 16 型選擇', w._showing==='deep' && grid16()===16, 'card='+grid16());
  chk('頁面零 JS error', jerr.length===0, jerr.slice(0,2).join(' | '));

  console.log(`\n${ok===total?'===== 全部通過':'===== 有失敗'}（${ok}/${total}）=====`);
  process.exit(ok===total?0:1);
},600);
