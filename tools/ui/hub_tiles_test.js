
// Box B：性格百科 16 型格（圓角、格距、比例）— 2026-09-29 Roy 要求美化後嘅守門測試
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
  // 1) CSS 值
  const grid=src.match(/\.hub-type-grid\{[^}]*\}/)[0];
  const gap=parseInt((grid.match(/gap:(\d+)px/)||[])[1],10);
  chk('16 型格格距 ≥ 8px（原本 4px 太密）', gap>=8, 'gap='+gap);
  const card=(src.match(/\.hub-type-grid \.hub-type-card\{[^}]*\}/)||[''])[0];
  const radius=parseInt((card.match(/border-radius:(\d+)px/)||[])[1],10);
  chk('16 型格有圓角 ≥ 8px（原本直角 0）', radius>=8, 'radius='+radius);
  chk('比例改成 4/5（原本 9/16 太窄高）', /aspect-ratio:4\/5/.test(card), card);
  // 2) 唔可以影響主頁跑馬燈 / 桌面層
  chk('主頁跑馬燈卡冇被改（仍然 9/16）', /\.home-type-reel \.hub-type-card\{[^}]*flex:0 0 6rem/.test(src.replace(/\n/g,'')));
  chk('桌面層規則冇被改（html.dt 仍然 aspect-ratio:1/1）', /html\.dt \.home-type-reel \.hub-type-card\{[^}]*aspect-ratio:1\/1/.test(src));
  // 3) 16 格真係渲染出嚟 + 開得到
  w.renderHub && w.renderHub();
  const tiles=[...d.querySelectorAll('#hubTypeGrid .hub-type-card')];
  chk('16 型格渲染到 16 格', tiles.length===16, tiles.length);
  const codes=tiles.map(t=>t.querySelector('.hub-type-code').textContent.trim());
  chk('16 個字母碼齊全', new Set(codes).size===16, codes.join(','));
  chk('每格有中文名', tiles.every(t=>{const cn=t.querySelector('.hub-type-cn'); return cn && cn.textContent.trim().length>0;}));
  let bad=0;
  tiles.slice(0,3).forEach(tile=>{
    tile.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));
    const go=tile.querySelector('.hub-type-go');
    if(go) go.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));
    if(d.getElementById('type').classList.contains('hidden')) bad++;
  });
  chk('撳格 → 可以入到專頁（試 3 格）', bad===0, 'bad='+bad);
  chk('全程冇 JS 錯誤', jerr.length===0, JSON.stringify(jerr.slice(0,2)));
  console.log('');
  console.log('===== '+(ok===total?'全部通過':'有失敗')+'（'+ok+'/'+total+'） =====');
  process.exit(ok===total?0:1);
}, 1300);
