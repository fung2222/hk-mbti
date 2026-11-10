
// context_flow_test.js — v2.1.0 學生／在職情境分流回歸測試（jsdom）
// 守嘅嘢：
//   1. buildDeck 喺 student context 會將 Q_CONTEXT 題目換成學生版文字
//   2. worker context 只換有 worker 版嘅題（港鐵／早起）；both/skip/未揀 = 一字不改
//   3. 分數向量完全唔變（情境只改文字）
//   4. 進度存取（saveProgress/loadProgress）連變體文字原封不動 roundtrip；
//      舊格式進度（冇 context 概念）照樣讀到
//   5. openProfile 會還原上次揀嘅身份；wizStart 會寫入 profile
const fs=require('fs'), path=require('path');
const {JSDOM, VirtualConsole}=require('jsdom');
const REPO=path.resolve(__dirname,'../..');
let ok=0,total=0; function chk(n,c,x){total++; if(c)ok++; console.log((c?'✓':'✗')+' '+n+(c?'':'   <- '+(x||'')));}
const src=fs.readFileSync(path.join(REPO,'index.html'),'utf8');
function stubCanvas(w){ const ctx=new Proxy({}, { get(k){ if(k==='canvas') return {width:720,height:1280}; if(k==='measureText') return ()=>({width:10}); if(/Gradient/.test(String(k))) return ()=>({addColorStop(){}}); return ()=>{}; }, set(){return true;} });
  w.HTMLCanvasElement.prototype.getContext=()=>ctx; w.HTMLCanvasElement.prototype.toDataURL=()=>"data:image/jpeg;base64,x"; w.Image=class{ set src(v){ setTimeout(()=>this.onload&&this.onload(),0); } }; }
let html=src.replace(/<script src="(https?:)?\/\/[^"]*"><\/script>/g,'').replace(/<script src="([^"]+\.js)"><\/script>/g,(m,f)=>fs.existsSync(path.join(REPO,f))?'<script>'+String.fromCharCode(10)+fs.readFileSync(path.join(REPO,f),'utf8')+String.fromCharCode(10)+'</script>':'');
const vc=new VirtualConsole(); vc.on('jsdomError',()=>{});
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://fung2222.github.io/hk-mbti/',virtualConsole:vc,
  beforeParse(w){ w.alert=()=>{}; w.confirm=()=>false; stubCanvas(w); }});
setTimeout(()=>{
  const w=dom.window, d=w.document;
  const CTX=w.Q_CONTEXT||{};
  const ctxKeys=Object.keys(CTX);
  const baseByD={}; w.QUESTIONS.forEach(q=>{ baseByD[q.d]=q; });
  const vecSig=(q)=>q.o.map(o=>JSON.stringify(o.v)).sort().join('|');

  chk('Q_CONTEXT 有 14 條題目設定', ctxKeys.length===14, 'keys='+ctxKeys.length);
  chk('每個 Q_CONTEXT key 都係真題目（q.k || q.d）',
    ctxKeys.every(k=>w.QUESTIONS.some(q=>(q.k||q.d)===k)), '');

  // 1+2+3：buildDeck 實路徑驗證（life=每軸抽 12 題，抽多幾副牌確保 14 條 key 全部出現過）
  function runDeck(ctx){
    w.state.qContext=ctx;
    const seen={};
    for(let i=0;i<60 && Object.keys(seen).length<ctxKeys.length;i++){
      const deck=w.buildDeck('life');
      deck.forEach(q=>{
        if(!CTX[q.d]) return;
        if(seen[q.d]) return;
        seen[q.d]={t:q.t, vec:vecSig(q)};
      });
    }
    return seen;
  }
  const st=runDeck('student');
  chk('student：60 副牌入面 14 條 key 全部出現過', Object.keys(st).length===ctxKeys.length, 'seen='+Object.keys(st).length);
  chk('student：出現過嘅題全部用學生版題目字',
    Object.keys(st).every(k=>CTX[k].student && st[k].t===CTX[k].student.t),
    JSON.stringify(Object.keys(st).filter(k=>st[k].t!==(CTX[k].student&&CTX[k].student.t))));
  chk('student：分數向量同原題完全一致（一字冇改動過向量）',
    Object.keys(st).every(k=>st[k].vec===vecSig(baseByD[k])));

  const wk=runDeck('worker');
  chk('worker：只有港鐵／早起兩條 key 有 worker 版',
    JSON.stringify(ctxKeys.filter(k=>CTX[k].worker))==='["E/I - 港鐵","J/P - 早起"]',
    JSON.stringify(ctxKeys.filter(k=>CTX[k].worker)));
  const wkSeen=Object.keys(wk);
  chk('worker：有 worker 版嘅題全部用返工版題目字',
    wkSeen.filter(k=>CTX[k].worker).every(k=>wk[k].t===CTX[k].worker.t),
    JSON.stringify(wkSeen.filter(k=>CTX[k].worker && wk[k].t!==CTX[k].worker.t)));
  chk('worker：無 worker 版嘅題一字未改',
    wkSeen.filter(k=>!CTX[k].worker).every(k=>wk[k].t===baseByD[k].t || (w.Q_ALTS[k]||[]).includes(wk[k].t)),
    JSON.stringify(wkSeen.filter(k=>!CTX[k].worker && wk[k].t!==baseByD[k].t && !(w.Q_ALTS[k]||[]).includes(wk[k].t))));
  chk('worker：分數向量同原題完全一致',
    wkSeen.every(k=>wk[k].vec===vecSig(baseByD[k])));

  ['both','skip',''].forEach(ctx=>{
    const r=runDeck(ctx);
    const keys=Object.keys(r);
    const changed=keys.filter(k=>r[k].t!==baseByD[k].t && !(w.Q_ALTS[k]||[]).includes(r[k].t));
    chk('context「'+(ctx||'(未揀)')+'」：Q_CONTEXT 題目全部用預設文字', changed.length===0, JSON.stringify(changed));
  });

  // student 選項文字替換（揀工 4 個選項 + 開會 2 個）
  w.state.qContext='student';
  let optOk=false, optSeen=false;
  for(let i=0;i<40 && !optSeen;i++){
    const deck=w.buildDeck('life');
    const q=deck.find(x=>x.d==='T/F - 揀工');
    if(q){ optSeen=true; optOk=vecSig(q)===vecSig(baseByD['T/F - 揀工']); }
  }
  chk('student：揀工題喺牌入面出現過，且向量同原題一致', optSeen && optOk, 'seen='+optSeen);

  // 4：進度 roundtrip（變體文字要跟 deck 原封不動存入 localStorage）
  w.state.qContext='student';
  const deck=w.buildDeck('life');
  w.state.version='life'; w.state.deck=deck; w.state.idx=2;
  w.state.answers=deck.map(()=>0); w.state.startedAt=Date.now();
  w.saveProgress();
  const p=w.loadProgress();
  chk('saveProgress → loadProgress roundtrip 到 deck', p && JSON.stringify(p.deck)===JSON.stringify(deck));
  chk('進度 JSON 冇新增欄位（格式同 v2.0.2 完全相容）',
    p && Object.keys(p).sort().join(',')==='answers,deck,idx,savedAt,startedAt,version', Object.keys(p||{}).sort().join(','));
  // 舊格式進度（冇 context 概念）照樣讀到
  const old={version:'life',idx:1,answers:deck.map(()=>1),deck:deck,startedAt:Date.now(),savedAt:Date.now()};
  w.localStorage.setItem('hkmbti_test_progress', JSON.stringify(old));
  chk('v2.0.2 格式進度照樣讀到（舊玩家續做唔會彈）', !!w.loadProgress());

  // 5：profile 還原 + wizStart 寫入
  w.localStorage.setItem('hkmbti_profile', JSON.stringify({name:'Roy',nickname:'大學生',gender:'男',qContext:'student'}));
  w.openProfile('life');
  chk('openProfile 會還原上次嘅身份（student）', w.state.qContext==='student', w.state.qContext);
  chk('還原後「學生」掣著燈', d.querySelector('.ctx-btn[data-ctx="student"]').className.indexOf('on')>=0);
  w.pickContext('worker');
  chk('pickContext(worker) 更新 state', w.state.qContext==='worker', w.state.qContext);
  w.wizStart();
  let saved=null; try{ saved=JSON.parse(w.localStorage.getItem('hkmbti_profile')); }catch(e){}
  chk('wizStart 將身份寫入 hkmbti_profile', saved && saved.qContext==='worker', JSON.stringify(saved));

  console.log('');
  console.log('===== '+(ok===total?'全部通過':'有失敗')+'（'+ok+'/'+total+'） =====');
  process.exit(ok===total?0:1);
}, 1200);
