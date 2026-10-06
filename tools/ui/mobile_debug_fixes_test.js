
// 手機版除錯報告修復守門（Grok 報告 2026-10-04 ＋ 母代理獨立覆核）
const fs=require('fs'), path=require('path');
const {JSDOM, VirtualConsole}=require('jsdom');
const REPO=path.resolve(__dirname,'../..');
let ok=0,total=0; function chk(n,c,x){total++; if(c)ok++; console.log((c?'✓':'✗')+' '+n+(c?'':'   <- '+(x||'')));}
const src=fs.readFileSync(path.join(REPO,'index.html'),'utf8');
function stubCanvas(w){ const ctx=new Proxy({}, { get(k){ if(k==="canvas") return {width:720,height:1280}; if(k==="measureText") return ()=>({width:10}); if(/Gradient/.test(String(k))) return ()=>({addColorStop(){}}); return ()=>{}; }, set(){return true;} }); w.HTMLCanvasElement.prototype.getContext=()=>ctx; w.HTMLCanvasElement.prototype.toDataURL=()=>"data:image/jpeg;base64,x"; w.Image=class{ set src(v){ setTimeout(()=>this.onload&&this.onload(),0); } }; }
let html=src.replace(/<script src="(https?:)?\/\/[^"]*"><\/script>/g,'').replace(/<script src="([^"]+\.js)"><\/script>/g,(m,f)=>fs.existsSync(path.join(REPO,f))?'<script>'+String.fromCharCode(10)+fs.readFileSync(path.join(REPO,f),'utf8')+String.fromCharCode(10)+'</script>':'');
const vc=new VirtualConsole(); const jerr=[]; vc.on('jsdomError',e=>{const m=String(e.message||e); if(!/scrollIntoView|scrollTo|Not implemented|Could not load/i.test(m)) jerr.push(m.slice(0,90));});
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://fung2222.github.io/hk-mbti/',virtualConsole:vc,
  beforeParse(w){ w.alert=()=>{}; w.confirm=()=>false; stubCanvas(w);
    try{ Object.defineProperty(w,'appDialog',{configurable:true,get(){return ()=>Promise.resolve(true);},set(){}}); }catch(e){}
    try{ Object.defineProperty(w,'appNotice',{configurable:true,get(){return ()=>Promise.resolve(true);},set(){}}); }catch(e){} }});
setTimeout(()=>{
  const w=dom.window, d=w.document;
  // P1-1 章節 <br> 唔可以被 escape 成字面
  const out=w.formatChapterHtml("第一行\n第二行\n\n第三段。");
  chk('P1-1 段內換行出真 <br>（唔係 &lt;br&gt;）', out.includes("<br>") && !out.includes("&lt;br&gt;"), out.slice(0,70));
  chk('P1-1 段落數仍按空行分', (out.match(/<p>/g)||[]).length===2, out);
  let leak=0, n=0;
  for(const t of w.TYPE_ORDER||[]) { const dd=(w.PREMIUM||{})[t]; if(!dd||!dd.chapters) continue; dd.chapters.forEach(c=>{ n++; if(String(w.formatChapterHtml(c.b)).includes("&lt;br&gt;")) leak++; }); }
  chk('P1-1 全 16 型 × 9 章（'+n+' 章）零字面 <br>', n>=144 && leak===0, 'n='+n+' leak='+leak);
  // P1-2 結果頁 % 穩定
  chk('P1-2 % 夾 用 typeCompatPct（冇 Math.random）', /typeCompatPct\(type, c\)/.test(src) && !/% 夾<\/div>`/.test(src.replace(/\$\{[^}]*\}/g,'X')) ? /typeCompatPct\(type, c\)/.test(src) : false);
  chk('P1-2 同一個配對兩次計同一個數', w.typeCompatPct("INTJ","ENFP")===w.typeCompatPct("INTJ","ENFP"));
  const pct=w.typeCompatPct("INTJ","ENFP"); chk('P1-2 範圍 82–94（同人格頁一致）', pct>=82&&pct<=94, pct);
  // P1-3 雙擊唔可以跳題
  w.openProfile("life");
  setTimeout(()=>{
    const before=w.state.idx;
    w.selectOpt(0); w.selectOpt(1);
  setTimeout(()=>{
    chk('P1-3 280ms 內連撳兩下 → 只前進一題', w.state.idx===before+1, 'idx '+before+' → '+w.state.idx);
    chk('P1-3 selectOpt 有 in-flight 鎖', /if\(state\._advancing\) return;/.test(src));
    // P1-4 字母卡切主題要重上色
    w.openLetter("E");
    const bg1=d.getElementById("letterHero").style.background;
    w.toggleTheme();
    const bg2=d.getElementById("letterHero").style.background;
    chk('P1-4 切黑夜 → 字母卡底色跟住變', !!bg1 && bg1!==bg2, bg1+' → '+bg2);
    w.toggleTheme();
    chk('P1-4 切返日頭 → 還原', d.getElementById("letterHero").style.background===bg1, d.getElementById("letterHero").style.background);
    chk('P1-4 底色只有一個來源（_applyLetterHeroBg）', /window\._applyLetterHeroBg = function/.test(src) && (src.match(/_applyLetterHeroBg/g)||[]).length>=4, (src.match(/_applyLetterHeroBg/g)||[]).length);
    // P2-1 字重／字型
    let bad=[];
    ["index.html","record.html","stats.html","tee.html","privacy.html","offline.html"].forEach(f=>{
      const t=fs.readFileSync(path.join(REPO,f),'utf8');
      if(/font-weight:\s*800/.test(t)) bad.push(f);
      if(/font-weight:\s*500/.test(t)) bad.push(f+'(500)');
    });
    chk('P2-1 全站冇 font-weight:800 / 500', bad.length===0, bad.join(','));
    chk('P2-1 字型 URL 載 600、唔載 500', /wght@400;600;700;900/.test(src) && !/wght@[^"']*\b500\b/.test(src));
    // ── #1 窄屏標題（Roy 2026-10-04 批准）
    chk('#1 有 ≤379px media query', /@media \(max-width:379px\)/.test(src));
    chk('#1 窄屏收標題留白 4.5rem→2.75rem', /@media \(max-width:379px\)\{[\s\S]*?\.page-hero-row h1\{padding:0 2\.75rem\}/.test(src));
    chk('#1 章節標題窄屏 21→19px／padding 2.25rem', /@media \(max-width:379px\)\{[\s\S]*?#deepChapterTitle\{font-size:19px;padding:0 2\.25rem\}/.test(src));
        chk('#1 320px 算術：一般 '+(320-32-88)+'px 盒 ≥ 164；章節 '+(320-32-72)+'px 盒 ≥ 209', (320-32-88)>=164 && (320-32-72)>=209);
    // ── #2 隨機灰統一（長文內文保留）
    let greyBad=[];
    ['record.html','stats.html','tee.html','privacy.html','offline.html','index.html'].forEach(fn=>{
      const tt=fs.readFileSync(path.join(REPO,fn),'utf8');
      ['#888','#555','#666','#6b6b6b','#4a4640','#9ca3af'].forEach(c=>{ if(new RegExp(':'+c+'\\b').test(tt)) greyBad.push(fn+':'+c); });
      if(/var\(--muted\)/.test(tt) && !/--muted:/.test(tt)) greyBad.push(fn+':--muted 冇定義');
      if(/--muted:/.test(tt) && !/--muted:#A79E92/.test(tt)) greyBad.push(fn+':黑夜 --muted 未定義');
    });
    chk('#2 隨機灰零殘留／--muted 日夜有定義', greyBad.length===0, greyBad.join(','));
    chk('#2 長文內文 #374151 保留（唔整頁換色）', /#374151/.test(src));
    // ── #4 單星 → 旁白款（唔斜體）
    let starLeak=0, asideHits=0, chN=0;
    for(const tt of w.TYPE_ORDER||[]){ const dd=(w.PREMIUM||{})[tt]; if(!dd||!dd.chapters) continue; dd.chapters.forEach(c=>{ chN++; const h=String(w.formatChapterHtml(c.b)); if(/\*/.test(h)) starLeak++; if(/chapter-aside/.test(h)) asideHits++; }); }
    chk('#4 全 16 型 × 9 章（'+chN+'）零殘留星號', chN>=144 && starLeak===0, 'leak='+starLeak);
    chk('#4 單星用 .chapter-aside（唔斜體）', asideHits>0 && /\.chapter-aside\{color:#6b6560\}/.test(src), asideHits);
    chk('#4 dark 規則喺 #dark-layer', /html\.dk \.chapter-aside\{color:#A79E92\}/.test(src));
    // CTA 統一（Roy 2026-10-04：Icon ＋「想知道自己 MBTI 人格？」＋「立即測試」；結果頁例外）
    chk('CTA 標題統一 ×8（想知道自己 MBTI 人格？）＋冇舊文案', (src.match(/>想知道自己 MBTI 人格？<\/p>/g)||[]).length>=8 && !/想確認自己 MBTI 人格？/.test(src));
    chk('CTA 按鈕統一 ×14（立即測試）＋冇「立即選擇測試版本」「立即進行」', (src.match(/>立即測試</g)||[]).length>=14 && !/立即選擇測試版本/.test(src) && !/>立即進行</.test(src));
    chk('每個 CTA 有 Icon（cta-bulb）＋結果頁「立即開始」保留', (src.match(/cta-bulb/g)||[]).length>=8 && (src.match(/>立即開始</g)||[]).length===1);
    chk('子頁 CTA 亦統一（stats／privacy 立即測試）', ['stats.html','privacy.html'].every(fn=>/>立即測試<\/a>/.test(fs.readFileSync(path.join(REPO,fn),'utf8'))));
    chk('子頁 CTA 都有 Icon（cta-bulb）＋標題統一＋冇舊句', ['stats.html','privacy.html'].every(fn=>{
      const tt=fs.readFileSync(path.join(REPO,fn),'utf8');
      return /cta-bulb/.test(tt) && /\.cta-bulb\{display:block/.test(tt) && /想知道自己 MBTI 人格？/.test(tt) && !/睇完想試/.test(tt);
    }));
    chk('冇新 jsdom error', jerr.length===0, jerr.join(' | '));
    console.log(ok===total ? "===== 全部通過（"+total+" 項）====="
        : "===== 有失敗（"+ok+"/"+total+"）=====");
    process.exit(ok===total?0:1);
  }, 420);
  }, 300);
}, 500);
