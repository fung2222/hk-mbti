/* 返回導覽回歸測試（Roy 2026-10-02 全站審計）
   鐵律：① 所有左上角「返回」掣 = 返上一頁（唔准跳指定頁）
        ② 手機返回鍵 = 返上一頁 + 還原嗰頁嘅捲動位置
        ③ 下拉重新整理全站開放，只鎖測試中
   ⚠️ jsdom 嘅 history.back() 係非同步：每個情境一定要 await 等 popstate，
      唔可以撳完即刻讀值（會讀到舊值，睇落似 bug）。
   ⚠️ jsdom 嘅 window.scrollY 唔會跟 scrollTo()：要自己 defineProperty 蓋成可寫。 */
const fs=require("fs"), path=require("path");
const {JSDOM, VirtualConsole}=require("jsdom");
const REPO=path.resolve(__dirname,"../..");
const HTML=(function(){
  let html=fs.readFileSync(path.join(REPO,"index.html"),"utf8");
  return html.replace(/<script src="(https?:)?\/\/[^"]*"><\/script>/g,"")
             .replace(/<script src="([^"]+\.js)"><\/script>/g,(m,f)=>fs.existsSync(path.join(REPO,f))?"<script>\n"+fs.readFileSync(path.join(REPO,f),"utf8")+"\n</script>":"");
})();
const SRC=HTML;
let ok=0,total=0;
function chk(n,c,x){ total++; if(c)ok++; console.log((c?"✓":"✗")+" "+n+(c?"":"   <- "+(x||""))); }
const wait=ms=>new Promise(r=>setTimeout(r,ms));

// ───────── 一、靜態檢查 ─────────
const backs=[...SRC.matchAll(/class="page-back"[^>]*onclick="([^"]+)"/g)].map(m=>m[1]);
chk("★ 全部 "+backs.length+" 個左上角「返回」掣都係 goBack()", backs.length>=14 && backs.every(x=>x==="goBack()"), backs.join(" , "));
chk("★ 冇任何「返回」掣跳去指定頁（冇 show(...)／goHome()／backToXxx 硬編碼）",
    !/class="page-back"[^>]*onclick="(?!goBack\(\))/.test(SRC));
chk("★ 章節頁底部「目錄」掣保留 backToDeepToc()（標明用途，唔屬「返回」掣）",
    /class="deep-nav-btn is-mid" id="deepToc" onclick="backToDeepToc\(\)">目錄</.test(SRC));
chk("★ openDeepChapterFromType 唔可以經 #deep 中間頁（phantom history 元兇）",
    (function(){
      const i=SRC.indexOf("window.openDeepChapterFromType = function");
      if(i<0) return false;
      const end=SRC.indexOf("\n};", i);            // 只睇呢個 function 嘅 body（唔好掃到隔籬 openDeepFor）
      const seg=SRC.slice(i, end);
      return !/openDeepType\s*\(/.test(seg.replace(/\/\/[^\n]*/g,"")) && /window\._deepType = t/.test(seg);
    })());
chk("★ goBack() 唔會硬跳指定頁：show(\"home\") 只可以做最後兜底",
    (function(){ const i=SRC.indexOf("window.goBack = function"); const seg=SRC.slice(i, SRC.indexOf("\n};", i)); return !/show\("(result|hub|deep|method|type|about|letter|dims|privacy|upgrade)"\)/.test(seg); })());
chk("★ goBack() 有自己堆疊兜底（下拉重整之後 _histDepth 歸零都用得）",
    (function(){ const i=SRC.indexOf("window.goBack = function"); const seg=SRC.slice(i, SRC.indexOf("\n};", i)); return /window\._navPop\(\)/.test(seg) && /window\.restoreNav\(prev\)/.test(seg); })());
chk("★ _navSnap 有記捲動位置 sy", /sy: \(function\(\)\{ try\{ return window\.scrollY/.test(SRC));
chk("★ _navSnap 有記百科場景詳情 hubScene", /hubScene: window\._hubSceneKey \|\| null/.test(SRC));
chk("★ 離開嗰頁嘅快照喺捲返頂之前捕捉（唔係就永遠記錄 0）",
    (function(){ const i=SRC.indexOf("window.show = function"); const seg=SRC.slice(i,i+900); const pSeg=seg.indexOf("_leftSnap.sy ="); const pTop=seg.indexOf("window.scrollTo(0,0)"); return pSeg>0 && (pTop<0 || pSeg<pTop); })());
chk("★ 堆疊 push 同 history push 係同一步（popstate 每次 pop 一筆才唔會走位）",
    (function(){ const i=SRC.indexOf('if(_leftSnap) window._navPush(_leftSnap);'); return i>0 && SRC.slice(i,i+120).indexOf('_histWrite("push")')>0; })());
chk("★ popstate 會還原上一頁嘅捲動位置", /const y = \(popped && typeof popped\.sy === "number"\)/.test(SRC) && /window\._pendingScrollY = y/.test(SRC));
chk("★ 堆疊 persist 落 sessionStorage（重新整理之後仍然知上一頁）",
    /hkmbti_nav_stack/.test(SRC) && /window\._navPersist = function/.test(SRC));
chk("★ 開機由 sessionStorage 載入堆疊", /JSON\.parse\(sessionStorage\.getItem\("hkmbti_nav_stack"\)/.test(SRC));
chk("★ restoreNav 會還原百科場景詳情（唔係淨係返列表）",
    /prev\.hubScene/.test(SRC) && /window\.openHubScene\(prev\.hubScene\)/.test(SRC));

// ───────── 下拉重新整理審計 ─────────
const sub=["record.html","stats.html","tee.html","privacy.html","offline.html"];
const styleBlocks=[...SRC.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m=>m[1]).join("\n");
const lockY=[...styleBlocks.matchAll(/[^\n{}]*\{[^}]*overscroll-behavior-y:\s*(contain|none)[^}]*\}/g)].map(m=>m[0].replace(/\s+/g,""));
chk("★ index.html 只有 body.in-test 鎖 overscroll-y（其餘全開）",
    lockY.length>=1 && lockY.every(r=>/^body\.in-test\{/.test(r)), lockY.join(" ｜ ")||"(冇任何鎖)");
chk("★ 橫向 16 型 reel 只鎖 x、y 保持 auto（唔會阻下拉重新整理）",
    /\.home-type-reel\{[^}]*overscroll-behavior-x:contain[^}]*overscroll-behavior-y:auto/.test(styleBlocks.replace(/\s+/g,"")));
chk("★ 唔會全域鎖 html／body 嘅 overscroll", !/^html\s*\{[^}]*overscroll/.test(SRC.replace(/\s+/g,"")) && !/^body\s*\{[^}]*overscroll/.test(SRC.replace(/\s+/g,"")));
chk("★ overscroll 只喺「測試中」才鎖（js 動態 toggle）", /overscrollBehaviorY = \(id === "test"\) \? "contain" : ""/.test(SRC));
chk("★ 5 個 sub-page 完全冇 overscroll 鎖（下拉重新整理開放）",
    sub.every(f=>!/overscroll/.test(fs.readFileSync(path.join(REPO,f),"utf8"))), sub.filter(f=>/overscroll/.test(fs.readFileSync(path.join(REPO,f),"utf8"))).join(","));

// ───────── 二、行為測試（每個情境獨立 JSDOM，真等 popstate）─────────
function makeDom(){
  const vc=new VirtualConsole(); const errs=[]; vc.on("jsdomError",e=>errs.push(e.message));
  const dom=new JSDOM(HTML,{runScripts:"dangerously",pretendToBeVisual:true,url:"https://fung2222.github.io/hk-mbti/",virtualConsole:vc});
  const w=dom.window;
  w._sy=0;
  Object.defineProperty(w,"scrollY",{get(){return w._sy||0;},configurable:true});
  Object.defineProperty(w,"pageYOffset",{get(){return w._sy||0;},configurable:true});
  w.scrollTo=function(a,b){ w._sy=(typeof b==="number"?b:(typeof a==="number"?a:0))||0; };
  return {dom,w,errs};
}
async function scen(fn){
  const {dom,w}=makeDom();
  await wait(420);
  let r;
  try{ r = await fn(w,w.document); }finally{ dom.window.close(); }
  return r;
}
async function clickBack(w,d,sel){ d.querySelectorAll(sel)[0].click(); await wait(150); }

(async function(){
  // A：人格頁深入分析 tab → 章節 → 返回（期望返人格頁）
  chk("★ A 人格頁 深入分析 tab → 撳章節 → 撳「返回」→ 返人格頁（唔係跳目錄）",
    await scen(async(w,d)=>{
      w.show("home"); w.show("hub"); w.openType("ENFP"); w.setTypeTab("deep",true);
      const dep0=w._histDepth;
      w.openDeepChapterFromType(0,"ENFP");
      const dep1=w._histDepth;
      await clickBack(w,d,"#deepChapter .page-back");
      return dep1===dep0+1 && w._showing==="type";
    }));
  chk("★ A2 開章節只入 1 層 history（冇 phantom 章節目錄層）",
    await scen(async(w)=>{
      w.show("home"); w.show("hub"); w.openType("ENFP");
      const a=w._histDepth; w.openDeepChapterFromType(0,"ENFP");
      return (w._histDepth-a)===1;
    }));
  // B：16 型目錄 → 該型 9 章目錄 → 章節 → 返回
  chk("★ B deep 16型 → 9章目錄 → 章節 → 撳「返回」→ 返 9 章目錄",
    await scen(async(w,d)=>{
      w.show("home"); w.openDeepType("INTJ"); w.openDeepChapter(0);
      await clickBack(w,d,"#deepChapter .page-back");
      return w._showing==="deep";
    }));
  // C：下拉重新整理（_histDepth 歸零）之後撳返回
  chk("★ C 下拉重整後（history 冇上一頁）撳「返回」→ 仍然係上一頁，唔係指定頁",
    await scen(async(w,d)=>{
      w.show("home"); w.show("hub"); w.openType("ENFP"); w.setTypeTab("deep",true);
      w.openDeepChapterFromType(0,"ENFP");
      w._histDepth=0;
      await clickBack(w,d,"#deepChapter .page-back");
      return w._showing==="type";
    }));
  // D：計分方法
  chk("★ D 百科 → 計分方法 → 撳「返回」→ 返百科",
    await scen(async(w,d)=>{ w.show("home"); w.show("hub"); w.openMethod(); await clickBack(w,d,"#method .page-back"); return w._showing==="hub"; }));
  // E：相處文章
  chk("★ E 百科 → 相處文章 → 撳「返回」→ 返百科",
    await scen(async(w,d)=>{ w.show("home"); w.show("hub"); w.openSocialArticle("WhatsAppGroup","ENFP"); await clickBack(w,d,"#socialArticle .page-back"); return w._showing==="hub"; }));
  // F：撳返回掣要還原捲動位置
  chk("★ F 撳「返回」掣 → 還原上一頁嘅捲動位置",
    await scen(async(w)=>{
      w.show("home"); w.show("hub"); w.scrollTo(0,777);
      w.show("type"); await wait(60);
      w.goBack(); await wait(220);
      return w._showing==="hub" && w._sy===777;
    }));
  // G：手機返回鍵（popstate）都要還原位置
  chk("★ G 手機返回鍵（popstate）→ 都還原上一頁嘅捲動位置",
    await scen(async(w)=>{
      w.show("home"); w.show("hub"); w.scrollTo(0,512);
      w.show("dims"); await wait(60);
      w.history.back(); await wait(220);
      return w._showing==="hub" && w._sy===512;
    }));
  // H：百科場景詳情 → 文章 → 返回（要返到詳情，唔係列表）
  chk("★ H 百科場景詳情 → 文章 → 撳「返回」→ 返到場景詳情（子視圖都還原）",
    await scen(async(w,d)=>{
      w.show("home"); w.openHub(); w.setHubMode("scene");
      w.openHubScene("WhatsAppGroup");
      w.openHubSceneArticle("WhatsAppGroup","ENFP");
      await clickBack(w,d,"#socialArticle .page-back");
      const det=d.getElementById("hubSceneDetail");
      return w._showing==="hub" && !det.classList.contains("hidden") && det.innerHTML.indexOf("WhatsApp")>=0;
    }));
  // I：人格頁場景 tab → 文章 → 返回（要返人格頁＋場景 tab）
  chk("★ I 人格頁場景 tab → 撳文章 → 撳「返回」→ 返人格頁（場景 tab）",
    await scen(async(w,d)=>{
      w.show("home"); w.show("hub"); w.openType("ENFP"); w.setTypeTab("scene",true);
      w.openSocialArticle("WhatsAppGroup","ENFP");
      await clickBack(w,d,"#socialArticle .page-back");
      return w._showing==="type" && d.getElementById("typeTabScene") && !d.getElementById("typeTabScene").classList.contains("hidden");
    }));

  console.log("===== "+(ok===total?"全部通過":"有失敗")+"（"+ok+"/"+total+"）=====");
  process.exit(ok===total?0:1);
})();
