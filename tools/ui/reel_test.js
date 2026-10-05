
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
  chk('★ 撳箭嘴 = 快速轉（spinV = dir * 26），唔再一格一格 scrollBy', /spinV = dir \* 26;/.test(src) && !/scrollBy\(\{ left: dir \* step/.test(src));
  chk('撳箭嘴即刻恢復自轉（唔等 1.8 秒）', /spinV = dir \* 26;\s*\npaused = false;/.test(src));
  chk('手動拖（pointerdown）會清走殘餘速度，唔會撞', /const pauseAuto = \(\) => \{\s*\npaused = true;\s*\nspinV = 0;/.test(src));

  // ---------- ★ 左邊唔會露空位（Roy 2026-10-01 報）----------
  chk('★ wrapLoop 用 [pad, pad+w] 做循環範圍（唔會退到 padding 之前）', /if\(reel\.scrollLeft >= pad \+ w\) reel\.scrollLeft -= w;/.test(src) && /else if\(reel\.scrollLeft < pad\) reel\.scrollLeft \+= w;/.test(src));
  chk('★ 有 padPx() 讀返 reel 左邊 padding', /const padPx = \(\) =>/.test(src));
  chk('★ 開頁時把第一張卡置中（用複本第 17 張）', /const _mid = _cards\[Math\.floor\(_cards\.length \/ 2\)\];/.test(src) && /reel\.scrollLeft = Math\.max\(0, _mid\.offsetLeft - \(reel\.clientWidth - _mid\.offsetWidth\) \/ 2\);/.test(src));
  // 模擬真機 layout（390px 寬）驗算：初始位置左邊一定要有卡、第一張要置中
  (function(){
    const VW=390, CARD=96, GAP=4, STEP=CARD+GAP, N=32, HALF=N/2;
    const PAD=VW/2-48;                       // padding: calc(50% - 3rem) = 165
    const off=(i)=>PAD+i*STEP;               // 第 i 張卡嘅 offsetLeft
    const sl=off(HALF)-(VW-CARD)/2;          // 我 code 嘅公式（第 17 張置中）
    const leftEdge=sl, rightEdge=sl+VW;
    const covers=(x)=>off(0)<=x && x<off(N-1)+CARD;
    chk('★ 驗算：初始左邊界一定有卡（唔係 padding 空位）', covers(leftEdge), '左邊界='+Math.round(leftEdge)+' 第一張由 '+off(0)+' 開始');
    chk('★ 驗算：第一張卡真係置中', Math.abs((off(HALF)+CARD/2)-(sl+VW/2))<1.5, '卡中心='+(off(HALF)+CARD/2)+' 畫面中心='+(sl+VW/2));
    const w=HALF*STEP;
    chk('★ 驗算：繞圈尺度 = 16 張（複本對齊，繞完畫面一樣）', w%STEP===0 && w/STEP===HALF);
    chk('★ 驗算：繞圈後仍然左邊有卡', covers(sl-w>=PAD?sl-w:sl), '下限='+PAD);
  })();
  chk('慢速／正常速度仍然係 requestAnimationFrame 驅動', /requestAnimationFrame\(tick\);/.test(src));
  chk('冇用 smooth scrollBy 做手動（避免同自轉打架）', !/behavior: "smooth"/.test(src));

  // ---------- 靜態：冇搞壞原有結構 ----------
  chk('reel 仍然係 overflow-x:auto + 隱藏 scrollbar', /\.home-type-reel\{[^}]*overflow-x:auto/.test(src));
  chk('仍然有 is-auto class（自動模式）', /reel\.classList\.add\("is-auto"\)/.test(src));
  chk('左右箭嘴仍然存在', !!$('.home-type-nav.is-l') && !!$('.home-type-nav.is-r'));
  chk('桌面層轉輪維持橫向可滑（唔係 grid）', /html\.dt \.home-type-reel\{[^}]*display:flex[^}]*overflow-x:auto/.test(src) && !/html\.dt \.home-type-reel\{[^}]*display:grid/.test(src));
  chk('桌面唔准再隱藏複本（要 32 張先可以無縫循環）', !/nth-child\(n\+17\)\{display:none\}/.test(src));
  chk('桌面滑輪一樣自動轉（唔准 onDt ? 0）', /let v = AUTO_V;/.test(src) && !/onDt \? 0/.test(src) && !/onDt/.test(src));
  chk('桌面自轉一樣會 wrapLoop（到中間就回捲，唔會飄到盡頭）', /wrapLoop\(\);\s*\n\s*\}\s*\nrequestAnimationFrame\(tick\)/.test(src) || /if\(v\)\{\s*reel\.scrollLeft \+= v;\s*wrapLoop\(\);/.test(src));
  chk('桌面滑輪卡係 9/16 直角（唔准 aspect-ratio:1/1 ／ border-radius:14px）',
      !/html\.dt \.home-type-reel \.hub-type-card\{[^}]*aspect-ratio:1\/1/.test(src) && !/html\.dt \.home-type-reel \.hub-type-card\{[^}]*border-radius:14px/.test(src)
      && /\.hub-type-card\{\s*aspect-ratio:9\/16;border-radius:0/.test(src));
  chk('桌面 is-auto 關 snap（唔同自轉搶）', /html\.dt \.home-type-reel\.is-auto\{scroll-snap-type:none\}/.test(src));

  // ---------- jsdom 真跑：32 張卡（16 + 16 複本 = 無限輪基礎）----------
  const reel=$('#homeTypeReel');
  chk('轉輪有 32 張卡（16 正本 + 16 複本）', reel && reel.querySelectorAll('.hub-type-card').length===32, reel?reel.querySelectorAll('.hub-type-card').length:'null');
  const first=reel.querySelector('.hub-type-card');
  const codes=[...reel.querySelectorAll('.hub-type-card')].slice(0,16).map(el=>el.textContent.trim().slice(0,4));
  chk('順序仍然係 INTJ…ESFP', codes.join(',')==='INTJ,INTP,ENTJ,ENTP,INFJ,INFP,ENFJ,ENFP,ISTJ,ISFJ,ESTJ,ESFJ,ISTP,ISFP,ESTP,ESFP', codes.slice(0,4).join(','));
  chk('第一張同第 17 張同型（接得返最尾）', [...reel.querySelectorAll('.hub-type-card')][0].textContent.trim()===[...reel.querySelectorAll('.hub-type-card')][16].textContent.trim());
  chk('卡片仍然可撳（openType）', /openType\('INTJ','home'\)/.test(reel.innerHTML));
  chk('頁面零 JS error', jerr.length===0, jerr.slice(0,2).join(' | '));

  // ---------- ★ 主頁高度：下拉重新整理之後唔可以令輪盤貼底（Roy 2026-10-05 實報）----------
  // dvh 係 dynamic：下拉後工具列收埋會報大 ~48px → hero 變高 → 輪盤被推到底（像素量度：距底 266px → 122px）
  // 所以要用 svh（small viewport ＝ 最細值，唔會變），並保留一行 dvh 做舊瀏覽器 fallback。
  chk('★ .home-hero 用 svh（唔淨係 dvh）—— 防下拉重新整理後輪盤貼底',
      /\.home-hero\{[^}]*min-height:100dvh;\s*min-height:100svh;/s.test(src));

  console.log(`\n${ok===total?'===== 全部通過':'===== 有失敗'}（${ok}/${total}）=====`);
  process.exit(ok===total?0:1);
},600);
