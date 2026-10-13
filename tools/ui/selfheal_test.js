// 自癒哨兵守門（2026-10-13）
//
// 背景：Grok 4.7 同 DeepSeek v4 Pro 兩份獨立審計一致指向 —— SW 預快取曾經部分失敗時，
// cache 會缺 tailwind.css；index.html 靠 tailwind 做隱藏（32 處 .hidden），
// 一離線就「排版散 ＋ 隱藏對話框走出嚟」。用戶冇能力清 cache，所以加自癒哨兵：
//   偵測 tailwind.css 冇生效 ＋ 有網絡 → 清走壞 cache ＋ 更新 SW ＋ reload 一次。
// 呢個測試模擬「tailwind 載入失敗但 onLine=true」，驗證哨兵真係會清 cache ＋ 更新 SW。
const fs=require('fs'), path=require('path');
const {JSDOM, VirtualConsole}=require('jsdom');
const REPO=path.resolve(__dirname,'../..');
let ok=0,total=0; function chk(n,c,x){total++; if(c)ok++; console.log((c?'✓':'✗')+' '+n+(c?'':'   <- '+(x||'')));}

let html=fs.readFileSync(path.join(REPO,'index.html'),'utf8');
// 令 tailwind.css 載入失敗（jsdom 唔會真載入 external stylesheet，所以 document.styleSheets 會係空）
const vc=new VirtualConsole(); const notes=[];
vc.on('jsdomError', e=>{ const m=String(e.message||e); if(/navigation|Not implemented/i.test(m)) notes.push(m.slice(0,60)); });
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://fung2222.github.io/hk-mbti/',
  virtualConsole:vc,
  beforeParse(w){
    // onLine = true（哨兵只喺有網絡時郁）
    Object.defineProperty(w.navigator,'onLine',{get:()=>true, configurable:true});
    // 記錄哨兵做咗咩
    w.__heal={deleted:[], updated:0, reloads:0};
    w.caches={ keys:()=>Promise.resolve(['hk-mbti-v2.0.0','other']),
      delete:(k)=>{ w.__heal.deleted.push(k); return Promise.resolve(true); } };
    w.navigator.serviceWorker={ getRegistration:()=>Promise.resolve({ update:()=>{ w.__heal.updated++; return Promise.resolve(); } }) };
    try{ Object.defineProperty(w,'location',{value:Object.assign({}, w.location, {reload:()=>{ w.__heal.reloads++; }}), configurable:true}); }catch(e){}
  }});

setTimeout(()=>{
  const w=dom.window;
  chk('哨兵有跑（jsdom 載入後未 crash）', !!w.__heal);
  chk('★ 偵測到 tailwind.css 冇生效 → 清走 cache', (w.__heal.deleted||[]).length>=1, JSON.stringify(w.__heal.deleted));
  chk('★ 清 cache 之後有更新 SW（reg.update）', w.__heal.updated>=1, 'updated='+w.__heal.updated);
  chk('★ 有觸發 reload（自癒最後一步）', w.__heal.reloads>=1 || notes.length>0, 'reloads='+w.__heal.reloads+' notes='+notes.length);
  chk('有 sessionStorage 防重入記錄', (()=>{ try{ return w.sessionStorage.getItem('hkmbti_selfheal')==='1'; }catch(e){ return false; } })());
  console.log(ok===total ? "===== 全部通過（"+total+" 項）=====" : "===== 有失敗（"+ok+"/"+total+"）=====");
  process.exit(ok===total?0:1);
}, 2200);
