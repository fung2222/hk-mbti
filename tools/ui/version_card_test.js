
// 版本卡：撳卡(著燈+展開) → 撳「立即測試」→ 入測試（2026-09-29 還原）
const fs=require('fs'), path=require('path');
const {JSDOM, VirtualConsole}=require('jsdom');
const REPO=path.resolve(__dirname,'../..');
let ok=0,total=0; function chk(n,c,x){total++; if(c)ok++; console.log((c?'✓':'✗')+' '+n+(c?'':'   <- '+(x||'')));}
const src=fs.readFileSync(path.join(REPO,'index.html'),'utf8');
function stubCanvas(w){ const ctx=new Proxy({}, { get(k){ if(k==="canvas") return {width:720,height:1280}; if(k==="measureText") return ()=>({width:10}); if(/Gradient/.test(String(k))) return ()=>({addColorStop(){}}); return ()=>{}; }, set(){return true;} });
  w.HTMLCanvasElement.prototype.getContext=()=>ctx; w.HTMLCanvasElement.prototype.toDataURL=()=>"data:image/jpeg;base64,x"; w.Image=class{ set src(v){ setTimeout(()=>this.onload&&this.onload(),0); } }; }
let html=src.replace(/<script src="(https?:)?\/\/[^"]*"><\/script>/g,'').replace(/<script src="([^"]+\.js)"><\/script>/g,(m,f)=>fs.existsSync(path.join(REPO,f))?'<script>'+String.fromCharCode(10)+fs.readFileSync(path.join(REPO,f),'utf8')+String.fromCharCode(10)+'</script>':'');
const vc=new VirtualConsole(); const jerr=[]; vc.on('jsdomError',e=>{const m=String(e.message||e); if(!/scrollIntoView|scrollTo|Not implemented|Could not load/i.test(m)) jerr.push(m.slice(0,90));});
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://fung2222.github.io/hk-mbti/',virtualConsole:vc,
  beforeParse(w){ w.alert=()=>{}; w.confirm=()=>false; stubCanvas(w);
    try{ Object.defineProperty(w,'appDialog',{configurable:true,get(){return ()=>Promise.resolve(true);},set(){}}); }catch(e){}
    try{ Object.defineProperty(w,'appNotice',{configurable:true,get(){return ()=>Promise.resolve(true);},set(){}}); }catch(e){} }});
setTimeout(()=>{
  const w=dom.window, d=w.document;
  const click=(el)=>el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));
  const cards=[...d.querySelectorAll('.ver-btn[data-ver]')];
  chk('主頁有 4 張卡（3 版本 + 我的記錄）', cards.length===4, cards.length);
  ['life','advanced','bb'].forEach(v=>{
    const c=cards.find(x=>x.getAttribute('data-ver')===v);
    chk(`${v} 卡 onclick = selectVersion('${v}')（撳一下著燈展開）`, !!c && c.getAttribute('onclick')===`selectVersion('${v}')`, c&&c.getAttribute('onclick'));
  });
  const rc=cards.find(x=>x.getAttribute('data-ver')==='record');
  chk('紀錄卡 onclick = selectRecord()', !!rc && rc.getAttribute('onclick')==='selectRecord()', rc&&rc.getAttribute('onclick'));

  // ---------- Roy 2026-10-05：第二個 ▼（放喺版本卡最底）→ 撳去「多種港式日常情景」----------
  // 註：初版做成 position:fixed 浮動；Roy 澄清要「喺卡片最底、睇落似螢幕最底」→ 改返正常位置。
  const nd=d.querySelector('.home-next-down');
  chk('★ 有第二個 ▼（home-next-down）', !!nd);
  chk('★ 第二個 ▼ onclick = scrollHomeScenes()', !!nd && nd.getAttribute('onclick')==='scrollHomeScenes()', nd&&nd.getAttribute('onclick'));
  chk('★ scrollHomeScenes 已定義 ＋ 目標係 .scenes-bleed（多種港式日常情景）',
      /window\.scrollHomeScenes = function\(\)/.test(src) && /querySelector\("#home \.scenes-bleed"\)/.test(src));
  chk('★ 第二個 ▼ 係正常位置（唔准 position:fixed 浮動）＋ 貼近版本卡下面、下面留空間',
      /\.home-next-down\{margin-top:6px;margin-bottom:16px\}/.test(src) && /#homeBelow\{margin-bottom:6px\}/.test(src)
      && !/\.home-next-down[^{]*\{[^}]*position:fixed/.test(src));
  chk('★ 第二個 ▼ 位置：版本卡（#homeBelow）之後、情景帶之前',
      src.indexOf('id="homeBelow"') > -1
      && src.indexOf('id="homeBelow"') < src.indexOf('class="home-more-down home-next-down"')
      && src.indexOf('class="home-more-down home-next-down"') < src.indexOf('class="scenes-bleed"'));
  chk('卡入面 4 粒「立即測試／查看紀錄」掣仲喺度', d.querySelectorAll('.ver-hint').length===4, d.querySelectorAll('.ver-hint').length);

  // ---------- Roy 2026-10-05：3 個測試版本各加一個獨特線條 icon（「我的記錄」唔加）----------
  const icos=[...d.querySelectorAll('.ver-btn .ver-ico')];
  chk('★ 3 個測試版本卡各有 1 個 icon（我的記錄冇）', icos.length===3, icos.length);
  chk('★ 3 個 icon 圖案互不相同（每個獨特）', new Set(icos.map(s=>s.innerHTML.trim())).size===3,
      icos.map(s=>s.innerHTML.trim()).join(' | ').slice(0,90));
  chk('三個 icon 分別喺 life／advanced／bb 卡內',
      ['life','advanced','bb'].every(v=>!!d.querySelector('.ver-btn[data-ver="'+v+'"] .ver-ico')));
  chk('「我的記錄」卡冇 icon（Roy 指定）', !d.querySelector('.ver-btn[data-ver="record"] .ver-ico'));
  chk('icon 用線條風格（stroke:currentColor + fill:none）＋跟版本 accent 色',
      /\.ver-ico\{[^}]*stroke:currentColor[^}]*fill:none/.test(src) &&
      /\.ver-btn\[data-ver="life"\] \.ver-ico\{color:#C4922E\}/.test(src) &&
      /\.ver-btn\[data-ver="advanced"\] \.ver-ico\{color:#8A9099\}/.test(src) &&
      /\.ver-btn\[data-ver="bb"\] \.ver-ico\{color:#A96A2B\}/.test(src));

  let opened=null; w.openProfile=function(v){ opened=v; };
  const life=cards.find(x=>x.getAttribute('data-ver')==='life');
  const lifeCta=d.querySelector('.ver-btn[data-ver="life"] .ver-hint');
  click(life);
  chk('撳「生活版」卡一下 → 只著燈（唔會即刻入）', life.classList.contains('ver-lit') && opened===null, 'lit='+life.classList.contains('ver-lit')+' opened='+opened);
  chk('著燈後「立即測試」掣先會出現（CSS .ver-lit .ver-hint）', /\.ver-btn\.ver-lit \.ver-hint/.test(src));
  click(lifeCta);
  chk('★ 再撳「立即測試」→ 入 60 題流程（還原成功）', opened==='life', 'opened='+opened);
  // 再撳同一張卡 = 收返（toggle）— 用未入過嘅 advanced 卡
  const adv=cards.find(x=>x.getAttribute('data-ver')==='advanced');
  click(adv); const lit1=adv.classList.contains('ver-lit');
  click(adv); const lit2=adv.classList.contains('ver-lit');
  chk('撳一下著燈、再撳一下收返燈', lit1===true && lit2===false, 'lit1='+lit1+' lit2='+lit2);

  let recGo=0; w.goRecord=function(){ recGo++; };
  click(rc);
  chk('撳紀錄卡 → 著燈（唔會即刻跳）', rc.classList.contains('ver-lit') && recGo===0, 'lit='+rc.classList.contains('ver-lit'));
  click(d.querySelector('.ver-btn[data-ver="record"] .ver-hint'));
  chk('★ 再撳「查看紀錄」→ 去紀錄頁（還原成功）', recGo===1, 'recGo='+recGo);
  chk('全程冇 JS 錯誤', jerr.length===0, JSON.stringify(jerr.slice(0,2)));
  console.log('');
// 桌面：版本卡係 grid，唔准 stretch（展開一格會拉高整行 → 其他卡扮到一齊展開）
chk('桌面 #versionList grid 有 align-items:start', /html\.dt #versionList\{[^}]*align-items:start/.test(src));
chk('桌面 #versionList 仍然係 grid（欄數分級 2／4）', /html\.dt #versionList\{display:grid/.test(src) && /html\.dt #versionList\{grid-template-columns:repeat\(4/.test(src));
  console.log('===== '+(ok===total?'全部通過':'有失敗')+'（'+ok+'/'+total+'） =====');
  process.exit(ok===total?0:1);
}, 1300);
