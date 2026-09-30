
// 主頁 16 型卡轉輪：無限輪 + 自轉 +5% + 撳箭嘴快速轉再減速（俄羅斯輪盤感）
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
  beforeParse(w){ w.alert=()=>{}; w.confirm=()=>true; stubCanvas(w); }});
setTimeout(()=>{
  const w=dom.window, d=w.document;
  const $=(s)=>d.querySelector(s);

  // ---------- 靜態：速度／機制 ----------
  chk('自轉速度 = 0.441（原本 0.42，+5%）', /const AUTO_V = 0\.441;/.test(src));
  chk('唔再硬寫 scrollLeft += 0.42', !/scrollLeft \+= 0\.42;/.test(src));
  chk('★ 有「殘餘速度」spinV 機制', /let spinV = 0;/.test(src));
  chk('★ 快速轉之後每 frame 減速（×0.955）', /spinV \*= 0\.955;/.test(src));
  chk('減到 ≤ 自轉速度就交返自動（唔會反方向）', /if\(Math\.abs\(spinV\) <= AUTO_V\) spinV = 0;/.test(src));
  chk('★ 無限輪：向右溢出繞返（-= w）', /if\(reel\.scrollLeft >= w\) reel\.scrollLeft -= w;/.test(src));
  chk('★ 無限輪：向左溢出繞返（+= w）', /else if\(reel\.scrollLeft <= 0\) reel\.scrollLeft \+= w;/.test(src));
  chk('★ 撳箭嘴 = 快速轉（spinV = dir * 26），唔再一格一格 scrollBy', /spinV = dir \* 26;/.test(src) && !/scrollBy\(\{ left: dir \* step/.test(src));
  chk('撳箭嘴即刻恢復自轉（唔等 1.8 秒）', /spinV = dir \* 26;\s*\npaused = false;/.test(src));
  chk('手動拖（pointerdown）會清走殘餘速度，唔會撞', /const pauseAuto = \(\) => \{\s*\npaused = true;\s*\nspinV = 0;/.test(src));
  chk('慢速／正常速度仍然係 requestAnimationFrame 驅動', /requestAnimationFrame\(tick\);/.test(src));
  chk('冇用 smooth scrollBy 做手動（避免同自轉打架）', !/behavior: "smooth"/.test(src));

  // ---------- 靜態：冇搞壞原有結構 ----------
  chk('reel 仍然係 overflow-x:auto + 隱藏 scrollbar', /\.home-type-reel\{[^}]*overflow-x:auto/.test(src));
  chk('仍然有 is-auto class（自動模式）', /reel\.classList\.add\("is-auto"\)/.test(src));
  chk('左右箭嘴仍然存在', !!$('.home-type-nav.is-l') && !!$('.home-type-nav.is-r'));
  chk('桌面層轉輪規則冇被郁（html.dt .home-type-reel）', /html\.dt \.home-type-reel\{grid-column:1;grid-row:1;display:grid/.test(src));
  chk('桌面隱藏複本規則仍在（nth-child(n+17)）', /html\.dt \.home-type-reel \.hub-type-card:nth-child\(n\+17\)\{display:none\}/.test(src));

  // ---------- jsdom 真跑：32 張卡（16 + 16 複本 = 無限輪基礎）----------
  const reel=$('#homeTypeReel');
  chk('轉輪有 32 張卡（16 正本 + 16 複本）', reel && reel.querySelectorAll('.hub-type-card').length===32, reel?reel.querySelectorAll('.hub-type-card').length:'null');
  const first=reel.querySelector('.hub-type-card');
  const codes=[...reel.querySelectorAll('.hub-type-card')].slice(0,16).map(el=>el.textContent.trim().slice(0,4));
  chk('順序仍然係 INTJ…ESFP', codes.join(',')==='INTJ,INTP,ENTJ,ENTP,INFJ,INFP,ENFJ,ENFP,ISTJ,ISFJ,ESTJ,ESFJ,ISTP,ISFP,ESTP,ESFP', codes.slice(0,4).join(','));
  chk('第一張同第 17 張同型（接得返最尾）', [...reel.querySelectorAll('.hub-type-card')][0].textContent.trim()===[...reel.querySelectorAll('.hub-type-card')][16].textContent.trim());
  chk('卡片仍然可撳（openType）', /openType\('INTJ','home'\)/.test(reel.innerHTML));
  chk('頁面零 JS error', jerr.length===0, jerr.slice(0,2).join(' | '));

  console.log(`\n${ok===total?'===== 全部通過':'===== 有失敗'}（${ok}/${total}）=====`);
  process.exit(ok===total?0:1);
},600);
