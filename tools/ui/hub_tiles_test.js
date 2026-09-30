
// 守門：性格百科 16 型格要維持「直角、4px 密格、9/16」原狀（Roy 2026-09-29 明確話直角好）
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
  chk('16 型格格距仍然 4px（Roy：原狀）', /\.hub-type-grid\{display:grid;grid-template-columns:repeat\(4,1fr\);gap:4px;\}/.test(src));
  const base=(src.match(/\.hub-type-card\{[^}]*\}/)||[''])[0];
  chk('16 型卡仍然直角 border-radius:0', /border-radius:0/.test(base), base.slice(0,80));
  chk('16 型卡仍然 9/16 窄高', /aspect-ratio:9\/16/.test(base));
  chk('冇任何 .hub-type-grid .hub-type-card 覆寫（唔准再「美化」）', !/\.hub-type-grid \.hub-type-card/.test(src));
  chk('主頁跑馬燈卡維持 flex:0 0 6rem / 9/16', /\.home-type-reel \.hub-type-card\{[^}]*flex:0 0 6rem/.test(src.replace(/\n/g,'')));
  chk('桌面層維持 html.dt 1/1', /html\.dt \.home-type-reel \.hub-type-card\{[^}]*aspect-ratio:1\/1/.test(src));
  w.renderHub && w.renderHub();
  const tiles=[...d.querySelectorAll('#hubTypeGrid .hub-type-card')];
  chk('16 格仍然渲染到', tiles.length===16, tiles.length);
  chk('每格仍然有字母碼 + 中文名', tiles.every(t=>t.querySelector('.hub-type-code').textContent.trim() && t.querySelector('.hub-type-cn').textContent.trim()));
  chk('全程冇 JS 錯誤', jerr.length===0, JSON.stringify(jerr.slice(0,2)));
  // ---- 維度字母對比度（Roy 2026-10-01：性格百科「4 個維度（8 個字母）」大字母同細字太淺色）----
  chk('★ 8 個維度字母改用深色 --dc（唔再用淺色 #E89A6B 等）', (src.match(/--dc:#[0-9A-Fa-f]{6}/g)||[]).length===8, (src.match(/--dc:#[0-9A-Fa-f]{6}/g)||[]).length);
  chk('★ .dim-pair button 讀 --dc', /\.dim-pair button\{[^}]*color:var\(--dc/.test(src));
  chk('★ 維度字母有黑暗模式提亮（唔會深底深字）', /html\.dk \.dim-pair button\{filter:brightness/.test(src));
  chk('★ 「vs」字加深（原本 #b0a795 太淺）', /\.dim-pair \.vs\{[^}]*color:#8A8272/.test(src));
  chk('★ 4 個維度細字（能量來源等）已加深', ['能量來源','認知方式','決策方式','生活態度'].every(t=>new RegExp('text-\\[11px\\] text-gray-600 font-semibold mt-1">'+t).test(src)), '');
  const dimPairs=[...d.querySelectorAll('#hub .dim-pair')];
  chk('★ 4 個維度入口仍然齊（每組 2 個字母）', dimPairs.length===4 && dimPairs.every(t=>t.querySelectorAll('button').length===2), dimPairs.length);
  chk('★ 每組維度有深色左邊色條', (src.match(/border-left:4px solid #[0-9A-Fa-f]{6}/g)||[]).length>=4);
  console.log('');
  console.log('===== '+(ok===total?'全部通過':'有失敗')+'（'+ok+'/'+total+'） =====');
  process.exit(ok===total?0:1);
}, 1300);
