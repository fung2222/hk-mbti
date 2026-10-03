
const fs=require('fs'), path=require('path');
const {JSDOM, VirtualConsole}=require('jsdom');
const REPO=path.resolve(__dirname,'../..');
let ok=0,total=0; function chk(n,c,x){total++; if(c)ok++; console.log((c?'✓':'✗')+' '+n+(c?'':'   <- '+(x||'')));}
function stubCanvas(w){ const ctx=new Proxy({}, { get(k){ if(k==="canvas") return {width:720,height:1280}; if(k==="measureText") return ()=>({width:10}); if(/Gradient/.test(String(k))) return ()=>({addColorStop(){}}); return ()=>{}; }, set(){return true;} });
  w.HTMLCanvasElement.prototype.getContext=()=>ctx; w.HTMLCanvasElement.prototype.toDataURL=()=>"data:image/jpeg;base64,x";
  w.Image=class{ set src(v){ setTimeout(()=>this.onload&&this.onload(),0); } }; }
let html=fs.readFileSync(path.join(REPO,'index.html'),'utf8');
html=html.replace(/<script src="(https?:)?\/\/[^"]*"><\/script>/g,'').replace(/<script src="([^"]+\.js)"><\/script>/g,(m,f)=>fs.existsSync(path.join(REPO,f))?'<script>\n'+fs.readFileSync(path.join(REPO,f),'utf8')+'\n</script>':'');
const errs=[]; const vc=new VirtualConsole();
vc.on('jsdomError',e=>{const m=String(e.message||e); if(/scrollTo|Not implemented|Could not load|scrollIntoView/i.test(m)) return; errs.push(m.slice(0,120));});
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://fung2222.github.io/hk-mbti/',virtualConsole:vc,
  beforeParse(w){ w.alert=()=>{}; w.confirm=()=>false; stubCanvas(w);
    try{ Object.defineProperty(w,'appDialog',{configurable:true,get(){return()=>Promise.resolve(false);},set(){}}); }catch(e){}
    try{ Object.defineProperty(w,'appNotice',{configurable:true,get(){return()=>{};},set(){}}); }catch(e){} }});
setTimeout(()=>{
  const w=dom.window, d=w.document;
  const letterHidden=()=>d.getElementById('letter').classList.contains('hidden');
  const findBtn=(L)=>[...d.querySelectorAll('[onclick]')].find(e=>(e.getAttribute('onclick')||'').indexOf("openLetter('"+L+"')")>=0);
  ['E','S','T','J'].forEach(L=>{
    const btn=findBtn(L);
    chk(`有 ${L} 卡`, !!btn);
    if(btn){
      btn.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));
      chk(`${L} 撳一下 → 開到維度頁（以前完全冇反應 ✗）`, letterHidden()===false && d.getElementById('letterBig').innerText===L,
          'hidden='+letterHidden()+' big='+d.getElementById('letterBig').innerText);
      chk(`${L} 標題有內容`, (d.getElementById('letterTitle').innerText||'').length>0);
    }
  });
  // ---------- 字母卡左右箭咀（Roy 2026-10-03：「字母卡要加」）----------
  // 同一個位置、左右切換唔同字母（次序 ＝ window.LETTERS：E→I→S→N→T→F→J→P）
  const lHero=d.getElementById('letterHero');
  const lBtns=lHero.querySelectorAll('.type-nav');
  chk('字母卡有左右箭咀（aria-label＝上／下一個字母）',
      lBtns.length===2 && /上一個字母/.test(lBtns[0].getAttribute('aria-label')||'')
      && /下一個字母/.test(lBtns[1].getAttribute('aria-label')||''), '搵到 '+lBtns.length+' 粒');
  chk('箭咀喺 .type-hero-row 內（flex 排版，320px 都唔會壓字）', !!lHero.querySelector('.type-hero-row .type-nav'));
  chk('箭咀用 ink 色（字母卡係淺底，白色會睇唔到）＋var(--ink) 自動跟黑夜模式',
      lBtns.length===2 && lBtns[0].classList.contains('is-ink') && /\.type-nav\.is-ink\{color:var\(--ink\)/.test(html));
  w.openLetter('E');   // 明確起點（上面個 loop 停喺 J）
  const lDep=w._histDepth||0, lLen=w.history.length;
  lBtns[1].dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  chk('撳右箭咀 → 轉下一個字母（E → I）＋標題／麵包屑／內文都換',
      d.getElementById('letterBig').innerText==='I' && /I/.test(d.getElementById('letterBreadcrumb').innerText)
      && (d.getElementById('letterDesc').innerText||'').length>50,
      d.getElementById('letterBig').innerText+' / '+d.getElementById('letterBreadcrumb').innerText);
  chk('字母轉換＝同一頁換內容 → 唔加 history 層',
      (w._histDepth||0)===lDep && w.history.length===lLen, 'depth '+lDep+'→'+w._histDepth);
  chk('當前歷史層快照已更新做新字母', w._navSnap().letter==='I', w._navSnap().letter);
  lBtns[0].dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  chk('撳返左箭咀 → 返 E', d.getElementById('letterBig').innerText==='E', d.getElementById('letterBig').innerText);
  w.openLetter('E');
  d.getElementById('letterHero').querySelectorAll('.type-nav')[0].dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  chk('第一個字母撳左 → 環繞去最後一個（E → P）', d.getElementById('letterBig').innerText==='P', d.getElementById('letterBig').innerText);
  w.openLetter('E');
  const lSeq=['E'];
  for(let k=0;k<7;k++){
    d.getElementById('letterHero').querySelectorAll('.type-nav')[1].dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
    lSeq.push(d.getElementById('letterBig').innerText);
  }
  chk('行 7 步 → 次序完全等於 window.LETTERS（8 個字母齊）',
      JSON.stringify(lSeq)===JSON.stringify(Object.keys(w.LETTERS)), lSeq.join('→'));

  chk('全程冇 JS 錯誤', errs.length===0, errs.slice(0,2).join(' | '));
  console.log('\n===== '+(ok===total?'全部通過':'有失敗')+'（'+ok+'/'+total+'） =====');
  process.exit(ok===total?0:1);
}, 1200);
