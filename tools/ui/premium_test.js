
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
  chk('「探索更多」有「人格深入分析」入口', !!d.querySelector('#homeAccordion .home-acc-item[data-acc="deep"]'));
  chk('入口有上鎖標籤（免費用戶見到「完整版」）', !!$('#deepAccLock') && $('#deepAccLock').textContent==='完整版');
  chk('入口掣呼叫 openDeep()（免費用戶會轉去升級頁）', /openDeep\(\)/.test(d.querySelector('#homeAccordion .home-acc-item[data-acc="deep"] .home-acc-go').getAttribute('onclick')||''));
  chk('★ 目錄項已經冇「睇」字（Roy 話唔需要）', !/deep-go">睇/.test(src));
  chk('★ 完整版頁面會鎖住下拉（no-pull）', /html\.no-pull,body\.no-pull\{overscroll-behavior/.test(src) && /_noPull/.test(src));
  chk('html 有底色（避免下拉露白）', /html\{background:var\(--paper\)\}/.test(src));
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
  chk('★ 免費用戶 openDeep() 會彈返升級頁（唔會偷入）', (function(){ w.openDeep(); return vis('upgrade') && !vis('deep'); })());

  // ---------- 示範解鎖 ----------
  await w.unlockFull();
  await new Promise(r=>setTimeout(r,320));
  chk('解鎖後 localStorage hkmbti_tier = full', w.localStorage.getItem('hkmbti_tier')==='full', w.localStorage.getItem('hkmbti_tier'));
  chk('解鎖後等級掣變「完整版」', $('#tierLabel').textContent.trim()==='完整版', $('#tierLabel').textContent);
  chk('解鎖後等級掣加 is-full（金色）', $('#tierBtn').classList.contains('is-full'));
  chk('解鎖後升級頁 CTA 文字改變', /已解鎖/.test($('#upgradeCta').textContent), $('#upgradeCta').textContent);
  chk('解鎖後自動去人格深入分析', vis('deep'), 'deep='+vis('deep'));
  chk('解鎖後「探索更多」鎖標籤收埋', $('#deepAccLock').style.display==='none', $('#deepAccLock').style.display);
  chk('解鎖後入口掣變「睇完整分析」', $('#deepAccGo').textContent==='睇完整分析', $('#deepAccGo').textContent);
  chk('入 deep 時 body 加 no-pull（防下拉露白）', d.body.classList.contains('no-pull'));
  chk('返主頁時 no-pull 會除返', (function(){ w.show('home'); return !d.body.classList.contains('no-pull'); })());

  // ---------- 16 型目錄（色卡版，參考性格百科排位）----------
  const cards=[...d.querySelectorAll('#deepTypeGrid .hub-type-card')];
  chk('★ 深入分析目錄用 16 張色卡（同性格百科同一款）', cards.length===16, cards.length);
  chk('★ 用返同一套 4 欄密格（hub-type-grid）', !!d.querySelector('#deepList .hub-type-grid'));
  chk('★ 分頁有簡介（唔再係空白頁只有卡）', !!d.querySelector('#deep .deep-intro'));
  chk('★ 簡介列出 9 章類型', d.querySelectorAll('#deep .deep-chips span').length===9, d.querySelectorAll('#deep .deep-chips span').length);
  chk('★ 簡介有標題句（大字）', /請選擇其中一種人格深入了解/.test($('#deep .deep-intro-lead').textContent), $('#deep .deep-intro-lead').textContent);
  chk('簡介有黑暗模式覆蓋', /html\.dk \.deep-intro-sub/.test(src) && /html\.dk \.deep-chips span/.test(src));
  chk('★ 簡介唔提「買斷」（Roy 指定：只講有咩睇、有咩用）', !/買斷/.test($('#deep .deep-intro').textContent), $('#deep .deep-intro-sub').textContent);
  chk('★ 簡介講「有咩可以睇」同「有咩用」', /有 9 章/.test($('#deep .deep-intro-sub').textContent) && /明自己|知身邊|點相處/.test($('#deep .deep-intro-sub').textContent));
  chk('INTJ 卡顯示「9 章」', /9 章/.test(cards[0].textContent), cards[0].textContent.replace(/\n/g,' '));
  chk('未寫嘅型顯示「準備中」', /準備中/.test(cards[1].textContent), cards[1].textContent.replace(/\n/g,' '));
  chk('★ 卡有該型漸變色（唔係文字格）', /linear-gradient\(135deg,#6B4E9E/.test(cards[0].getAttribute('style')), cards[0].getAttribute('style'));
  chk('★ 16 張卡各有自己顏色', (new Set(cards.map(c=>(c.getAttribute('style')||'').match(/#[0-9A-Fa-f]{6}/g)?.join()))).size === 16);
  chk('卡撳落去開該型目錄', /openDeepType\('INTJ'\)/.test(cards[0].getAttribute('onclick')));

  // ---------- 型別 9 章目錄 ----------
  w.openDeepType('INTJ');
  chk('★ 型別目錄層：簡介要收埋（Roy 話章節目唔需要）', $('#deep .deep-intro').style.display==='none', $('#deep .deep-intro').style.display);
  chk('★ 型別目錄內冇「請選擇其中一種人格」', !/請選擇其中一種人格/.test($('#deepList').textContent));
  const toc=[...d.querySelectorAll('#deepList .deep-item')];
  chk('INTJ 目錄有 9 章', toc.length===9, toc.length);
  chk('目錄每章有序號 1..9', toc[0].querySelector('.deep-num').textContent==='1' && toc[8].querySelector('.deep-num').textContent==='9');
  chk('目錄有「返全部 16 型」', /返全部 16 型/.test($('#deepList').textContent));

  // ---------- 章節頁 + 上一章／下一章 ----------
  w.openDeepChapter(0);
  chk('第 1 章：crumb = INTJ · 1 / 9', $('#deepChapterCrumb').textContent==='INTJ · 1 / 9', $('#deepChapterCrumb').textContent);
  chk('第 1 章：標題 = 你真正想要嘅嘢', $('#deepChapterTitle').textContent==='你真正想要嘅嘢', $('#deepChapterTitle').textContent);
  chk('第 1 章：上一章 disabled', $('#deepPrev').disabled===true);
  chk('第 1 章：下一章可用', $('#deepNext').disabled===false);
  chk('章節標示係完整版內容', /完整版/.test($('#deepChapterHead').textContent), $('#deepChapterHead').textContent);
  chk('章節內文有渲染（<p> 段落）', /<p>/.test($('#deepChapterBody').innerHTML), $('#deepChapterBody').innerHTML.slice(0,50));
  chk('★ 章節頁型別卡有該型漸變色（唔係淨灰）', /rgb\(107, 78, 158\)/.test($('#deepChapterHero').style.background), $('#deepChapterHero').style.background);
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
  chk('升級頁／深入分析走 dark 覆蓋（html.dk .up-cmp / .deep-num）', /html\.dk \.up-cmp/.test(src) && /html\.dk \.deep-num/.test(src));
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
  chk('★ 返到 16 型選擇時簡介會出返', $('#deep .deep-intro').style.display!=='none', $('#deep .deep-intro').style.display);
  w.goBack(); await sleep(160);                   // 返回 3
  chk('★ 返回 3：16 型選擇 → 返到主頁', w._showing==='home', 'showing='+w._showing);
  chk('★ 返到主頁時主頁真係顯示', !d.getElementById('home').classList.contains('hidden'));
  chk('★ 返到主頁時 no-pull 已除', !d.body.classList.contains('no-pull'));

  // 「返全部 16 型」掣亦要行 history（唔係直接跳）
  w.openDeep(); await sleep(40); w.openDeepType('INTJ'); await sleep(40);
  chk('「返全部 16 型」掣用 deepBackToTypes（行 history）', /onclick="deepBackToTypes\(\)"/.test(src));
  w.deepBackToTypes(); await sleep(160);
  chk('★ 撳「返全部 16 型」真係返到 16 型選擇', w._showing==='deep' && grid16()===16, 'card='+grid16());
  chk('頁面零 JS error', jerr.length===0, jerr.slice(0,2).join(' | '));

  console.log(`\n${ok===total?'===== 全部通過':'===== 有失敗'}（${ok}/${total}）=====`);
  process.exit(ok===total?0:1);
},600);
