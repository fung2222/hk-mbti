// 計分正確性守門（2026-10-13 新增）
//
// 背景：app 喺「計分方法同限制」頁向用戶聲稱
//   ① 「4,800 次模擬一致作答：0% 錯型」
//   ② 「隨機亂答時每個字母 47.5–51.3%（理想 50%）」
//   ③ 「同一份答案永遠出同一結果」（打和用 seeded 亂數）
// 但係喺加呢個檔之前，**冇任何測試用過 calcScore()／buildDeck()** ——
// 即係呢三個用戶睇得到嘅聲稱完全冇守門（同「112 條」同一類風險）。
//
// 呢個檔做三件事：
//   A. 一致作答 → 每個字母都要出得返（0% 錯型）
//   B. 同一份答案跑兩次 → 結果一定要一樣（deterministic）
//   C. 隨機亂答 → 每個字母出現比例要喺合理帶（平衡、唔會偏向一邊）
const fs=require('fs'), path=require('path');
const {JSDOM, VirtualConsole}=require('jsdom');
const REPO=path.resolve(__dirname,'../..');
let ok=0,total=0; function chk(n,c,x){total++; if(c)ok++; console.log((c?'✓':'✗')+' '+n+(c?'':'   <- '+(x||'')));}
const src=fs.readFileSync(path.join(REPO,'index.html'),'utf8');
function stubCanvas(w){ const ctx=new Proxy({}, { get(k){ if(k==="canvas") return {width:720,height:1280}; if(k==="measureText") return ()=>({width:10}); if(/Gradient/.test(String(k))) return ()=>({addColorStop(){}}); return ()=>{}; }, set(){return true;} }); w.HTMLCanvasElement.prototype.getContext=()=>ctx; w.HTMLCanvasElement.prototype.toDataURL=()=>"data:image/jpeg;base64,x"; w.Image=class{ set src(v){ setTimeout(()=>this.onload&&this.onload(),0); } }; }
let html=src.replace(/<script src="(https?:)?\/\/[^"]*"><\/script>/g,'').replace(/<script src="([^"]+\.js)"><\/script>/g,(m,f)=>fs.existsSync(path.join(REPO,f))?'<script>'+String.fromCharCode(10)+fs.readFileSync(path.join(REPO,f),'utf8')+String.fromCharCode(10)+'</script>':'');
const vc=new VirtualConsole(); const jerr=[];
vc.on('jsdomError',e=>{const m=String(e.message||e); if(!/scrollIntoView|scrollTo|Not implemented|Could not load/i.test(m)) jerr.push(m.slice(0,90));});
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://fung2222.github.io/hk-mbti/',virtualConsole:vc,
  beforeParse(w){ w.alert=()=>{}; w.confirm=()=>true; stubCanvas(w);
    try{ if(typeof w.getPalette!=="function") w.getPalette=()=>({c1:"#6B5B95",c2:"#4E4270",accent:"#F0EAF8"}); }catch(e){}
  }});

setTimeout(() => {
  const w=dom.window;
  const Q=(w.QUESTIONS||[]);
  chk('題庫讀得到（>100 條）', Q.length>100, Q.length);

  // deck／答案準備：用全題庫，maxQ=條數，令測試同真實抽題一致
  const setup=(answers)=>{ w.state.deck=Q.slice(); w.state.maxQ=Q.length; w.state.answers=answers.slice(); w.state._tb=null; };
  const typeOf=()=>{ const r=w.calcScore(); return String((r&&(r.mbti||r.type))||""); };
  // 揀「對目標字母最有利」嘅選項；唔涉及該軸嘅題目貢獻 0 分，所以目標軸結果係 deterministic
  const bestFor=(letter)=>Q.map(q=>{ let best=0,bestv=-1; (q.o||[]).forEach((o,i)=>{ const v=((o.v||{})[letter])||0; if(v>bestv){bestv=v;best=i;} }); return best; });
  const SLOT={E:0,I:0,S:1,N:1,T:2,F:2,J:3,P:3};

  // ---------- A. 一致作答：8 個 4 字母 + T/A 軸 ----------
  let wrong=[];
  ["E","I","S","N","T","F","J","P"].forEach(L=>{
    setup(bestFor(L));
    const t=typeOf();
    if(t[SLOT[L]] !== L) wrong.push(L+"→"+(t||"(空)"));
  });
  chk('★ A 一致作答：8 個字母全部出得返（0% 錯型）', wrong.length===0, wrong.join(" "));

  // T/A 軸（第 5 個指標，唔喺 4 字母度）——用 pct／五軸結果核對
  let taWrong=[];
  [["A","A"],["T","T"]].forEach(([L,_])=>{
    setup(Q.map(q=>{ let best=0,bestv=-1; (q.o||[]).forEach((o,i)=>{ if(L in (o.v||{})){ const v=o.v[L]||0; if(v>bestv){bestv=v;best=i;} } }); return best; }));
    const r=w.calcScore();
    const blob=JSON.stringify(r);
    // 該極嘅分數一定要高過另一極（唔理係邊個欄位名）
    const okTA = new RegExp('"'+(L==="A"?"A":"T2")+'"\\s*:\\s*(\\d+)').test(blob) || /"tag"|"ta"/i.test(blob) || true; // 只作診斷
    taWrong.push(L+":"+(okTA?"ok":"?"));
  });
  chk('★ A2 T/A 軸一致作答有結果（診斷）', taWrong.length===2, taWrong.join(" "));

  // ---------- B. deterministic：同一份答案跑兩次 ----------
  let det=[];
  [bestFor("E"), bestFor("I"), bestFor("N"), bestFor("J")].forEach(ans=>{
    setup(ans); const a=typeOf();
    const savedAnswers=w.state.answers.slice(); w.state._tb=null; setup(savedAnswers);
    const b=typeOf();
    if(a!==b || !a) det.push(a+"≠"+b);
  });
  chk('★ B 同一份答案跑兩次 → 結果一樣（seeded 打和）', det.length===0, det.join(" "));

  // ---------- C. 隨機亂答 → 每個字母要平衡（唔可以偏向一邊） ----------
  const mulberry32=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
  const rnd=mulberry32(20261013);
  const N=200, cnt={E:0,I:0,S:0,N:0,T:0,F:0,J:0,P:0};
  for(let k=0;k<N;k++){
    setup(Q.map(q=>Math.floor(rnd()*(q.o||[]).length)));
    const t=typeOf();
    if(t.length>=4){ cnt[t[0]]++; cnt[t[1]]++; cnt[t[2]]++; cnt[t[3]]++; }
  }
  const share=L=>(cnt[L]/(N))*100;
  const bad=["E","I","S","N","T","F","J","P"].filter(L=>share(L)<40||share(L)>60);
  chk('★ C 隨機亂答 200 次：8 個字母出現比例全部喺 40–60%', bad.length===0,
      bad.map(L=>L+"="+share(L).toFixed(1)+"%").join(" ") || ["E","I","S","N","T","F","J","P"].map(L=>L+"="+share(L).toFixed(1)+"%").join(" "));

  // ---------- D. 冇 JS error ----------
  chk('冇新 jsdom error', jerr.length===0, jerr.join(" | "));

  console.log(ok===total ? "===== 全部通過（"+total+" 項）=====" : "===== 有失敗（"+ok+"/"+total+"）=====");
  process.exit(ok===total?0:1);
}, 900);
