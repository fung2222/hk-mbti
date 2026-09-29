
// 4 個維度入口：E/I、S/N、T/F、J/P 每個字母都要撳得到（2026-09-29 修「只開到第一個」）
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
  beforeParse(w){ w.alert=()=>{}; w.confirm=()=>false; stubCanvas(w); }});
setTimeout(()=>{
  const w=dom.window, d=w.document;
  const boxes=[...d.querySelectorAll('.dim-pick')];
  chk('4 個維度入口卡都有 .dim-pick', boxes.length===4, boxes.length);
  const all=[];
  boxes.forEach(b=>[...b.querySelectorAll('button')].forEach(x=>all.push(x)));
  chk('8 個字母全部有獨立掣（原本只有 4 個）', all.length===8, all.length);
  const letters=all.map(b=>b.textContent.trim());
  chk('字母齊全 E/I/S/N/T/F/J/P', ['E','I','S','N','T','F','J','P'].every(x=>letters.includes(x)), letters.join(''));
  let bad=[];
  all.forEach(btn=>{
    const L=btn.textContent.trim();
    btn.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));
    const big=d.getElementById('letterBig').innerText;
    const career=(d.getElementById('letterCareer').innerText||'').trim();
    const open=!d.getElementById('letter').classList.contains('hidden');
    if(!(open && big===L && career.length>0)) bad.push(L+'(big='+big+',career='+(career?career.slice(0,8):'空')+')');
  });
  chk('★ 逐個字母撳落去 → 都開到自己嘅專頁（8/8）', bad.length===0, bad.join(' '));
  chk('全程冇 JS 錯誤', jerr.length===0, JSON.stringify(jerr.slice(0,2)));
  console.log('');
  console.log('===== '+(ok===total?'全部通過':'有失敗')+'（'+ok+'/'+total+'） =====');
  process.exit(ok===total?0:1);
}, 1300);
