
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
  chk('全程冇 JS 錯誤', errs.length===0, errs.slice(0,2).join(' | '));
  console.log('\n===== '+(ok===total?'全部通過':'有失敗')+'（'+ok+'/'+total+'） =====');
  process.exit(ok===total?0:1);
}, 1200);
