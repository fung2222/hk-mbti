
/* 人格分頁 4 個 tab 測試（Roy 2026-10-02 方案 B：性格／關係／場景／深入）
   驗證：色卡喺分頁掣上面、4 個 tab 切換、每個 tab 有真內容、
         免費用戶第 2-9 章把關、完整版唔標「完整版」、
         舊 #typeScenes／#typeMore 入口兼容、dark 規則喺 #dark-layer 且只改顏色。 */
const fs=require("fs"), path=require("path");
const {JSDOM, VirtualConsole}=require("jsdom");
const REPO=path.resolve(__dirname,"../..");
let ok=0,total=0;
function chk(n,c,x){total++; if(c)ok++; console.log((c?"✓":"✗")+" "+n+(c?"":"   <- "+(x===undefined?"":x)));}
const src=fs.readFileSync(path.join(REPO,"index.html"),"utf8");
function stubCanvas(w){ const ctx=new Proxy({},{ get(k){ if(k==="canvas") return {width:720,height:1280}; if(k==="measureText") return ()=>({width:10}); if(/Gradient/.test(String(k))) return ()=>({addColorStop(){}}); return ()=>{}; }, set(){return true;} });
  w.HTMLCanvasElement.prototype.getContext=()=>ctx; w.HTMLCanvasElement.prototype.toDataURL=()=>"data:image/jpeg;base64,x";
  w.Image=class{ set src(v){ setTimeout(()=>this.onload&&this.onload(),0); } }; }
const html=src.replace(/<script src="(https?:)?\/\/[^"]*"><\/script>/g,"").replace(/<script src="([^"]+\.js)"><\/script>/g,(m,f)=>fs.existsSync(path.join(REPO,f))?"<script>"+String.fromCharCode(10)+fs.readFileSync(path.join(REPO,f),"utf8")+String.fromCharCode(10)+"</script>":"");
const vc=new VirtualConsole(); const jerr=[];
vc.on("jsdomError",e=>{const m=String(e.message||e); if(!/scrollIntoView|scrollTo|Not implemented|Could not load/i.test(m)) jerr.push(m.slice(0,90));});

// ── 靜態 ──
chk("★ 分頁掣係 .hub-mode-switch（跟百科「由人格睇／由場景睇」同一款）", /class="hub-mode-switch type-tab-switch" id="typeTabSwitch"/.test(src));
chk("★ 色卡 #typeHero 喺分頁掣上面（文章頂、人格卡片下）", (function(){ const h=src.indexOf('id="typeHero"'), t=src.indexOf('id="typeTabSwitch"'); return h>0 && t>h; })());
chk("★ 4 個掣次序 = 性格 → 關係 → 場景 → 深入分析", (function(){
  const i=src.indexOf('id="typeTabSwitch"'); const seg=src.slice(i, src.indexOf("</div>", i));
  return (seg.match(/data-tab="(\w+)"/g)||[]).map(x=>x.slice(10,-1)).join(",") === "basic,rel,scene,deep";
})());
chk("★ 第 4 個掣已改名「深入分析」（唔再係「深入」）", /data-tab="deep"[^>]*>[\s\S]{0,200}深入分析<\/button>/.test(src) && !/data-tab="deep"[^>]*>深入<\/button>/.test(src));
chk("★ 「深入分析」掣有星星 SVG icon（實心 path）", (function(){
  const i=src.indexOf("setTypeTab('deep')"); if(i<0) return false;   // 錨喺 HTML 掣，唔好撞到 CSS 嘅 [data-tab="deep"]
  const seg=src.slice(Math.max(0,i-300), i+260);
  return /<svg class="tab-star"/.test(seg) && /<path d="M12 3\.1/.test(seg) && /viewBox="0 0 24 24"/.test(seg);
})());
chk("★ 星星係金色 fill，用 SVG 唔係 ★／emoji 字元", /\.type-tab-switch \.tab-star\{[^}]*fill:#C8A24C/.test(src) && !/[\u2605\u2606]/.test(src));
chk("★ 深入分析目錄底部 3 個掣水平一行（返全部 16 型／立即測試／16型統計）", (function(){
  const i=src.indexOf('class="deep-foot-row"'); if(i<0) return false;
  const seg=src.slice(i, i+480);
  return /deepBackToTypes\(\)/.test(seg) && /goPickVersion\(\)/.test(seg) && /stats\.html/.test(seg) && (seg.match(/deep-foot-btn/g)||[]).length>=3;
})());
chk("★ 3 個掣係 flex 一行（唔會疊起）", /\.deep-foot-row\{display:flex/.test(src) && /\.deep-foot-btn\{flex:1 1 0/.test(src));
chk("★ 3 個掣有 dark 規則（只改顏色）", /html\.dk \.deep-foot-btn\{background:var\(--dk-card\)/.test(src));
chk("★ tab 掣唔會斷行：「深入分析」自身攞夠位，窄機 320px 都放得落", (function(){
  // 由 CSS 抽出實際數字（改字級／padding 會即刻反映）——jsdom 冇 layout，所以用算術守門
  const m=/\.type-tab-switch \.hub-mode-btn\{([^}]*)\}/.exec(src); if(!m) return false;
  const r=m[1];
  const fs = parseFloat((/font-size:([\d.]+)px/.exec(r)||[])[1]);
  const padH = parseFloat((/padding:\d+px ([\d.]+)px/.exec(r)||[])[1]);
  const dm=/\.type-tab-switch \.hub-mode-btn\[data-tab="deep"\]\{([^}]*)\}/.exec(src); if(!dm) return false;
  const dPadH = parseFloat((/padding:\d+px ([\d.]+)px/.exec(dm[1])||[])[1]);
  const starW = parseFloat((/\.type-tab-switch \.tab-star\{[^}]*?width:([\d.]+)px/.exec(src)||[])[1]);
  const starM = parseFloat((/\.type-tab-switch \.tab-star\{[^}]*?margin-right:([\d.]+)px/.exec(src)||[])[1]);
  if(!fs||!padH||!dPadH||!starW||!starM) return false;
  const deepNeed = 4*fs + starW + starM + 2*dPadH;   // 「深入分析」4 個中文字 + 星 + padding
  const btnNeed  = 2*fs + 2*padH;                    // 最窄嘅掣（2 個字）
  const avail320 = 320 - 32 - 24 - 8 - 18;           // #app padding16×2 / 容器margin12×2 / 容器padding4×2 / gap6×3
  const fits = deepNeed + 3*btnNeed <= avail320;
  return /white-space:nowrap/.test(r) && /flex:0 0 auto/.test(dm[1]) && /flex:1 1 auto/.test(r) && fits;
})(), (function(){
  const dm=/\.type-tab-switch \.hub-mode-btn\[data-tab="deep"\]\{([^}]*)\}/.exec(src);
  const r=/\.type-tab-switch \.hub-mode-btn\{([^}]*)\}/.exec(src);
  return 'deep='+(dm?dm[1]:'?')+' | base='+(r?r[1]:'?');
})());
chk("★ tab 掣垂直居中（唔會有一粒凸出容器）", /\.type-tab-switch\{align-items:center\}/.test(src));
chk("★ 強項／弱項 icon 同文字水平對齊（垂直置中，唔准靠 margin 硬推）", (function(){
  const ic=/\.pros-ico\{([^}]*)\}/.exec(src); if(!ic) return false;
  const box=/\.pros-box \.pros-item\{([^}]*)\}/.exec(src); if(!box) return false;
  const base=/\.pros-item\{([^}]*)\}/.exec(src)||[,""];
  const fs=parseFloat((/font-size:([\d.]+)px/.exec(base[1])||[])[1]);
  const lh=parseFloat((/line-height:([\d.]+)/.exec(base[1])||[])[1]);
  const ih=parseFloat((/height:([\d.]+)px/.exec(ic[1])||[])[1]);
  if(!fs||!lh||!ih) return false;
  return /align-items:center/.test(box[1])          // icon 中心 = 文字行中心
      && !/margin/.test(ic[1])                      // ❌ 唔准用 margin-top 硬推（之前高 6px 嘅來源）
      && ih <= fs*lh;                               // icon 唔可以高過行高，否則置中都冇意義
})(), (function(){ const ic=/\.pros-ico\{([^}]*)\}/.exec(src)||[,""]; const box=/\.pros-box \.pros-item\{([^}]*)\}/.exec(src)||[,""]; return 'ico='+ic[1]+' | box='+box[1]; })());
chk("★ 4 個面板都喺 #type 入面", ["typeTabBasic","typeTabRel","typeTabScene","typeTabDeep"].every(id=>new RegExp('id="'+id+'"').test(src)));
chk("★ 默認只顯示「性格」面板（其餘 3 個 hidden）", /id="typeTabBasic">/.test(src) && /id="typeTabRel" class="hidden"/.test(src) && /id="typeTabScene" class="hidden"/.test(src) && /id="typeTabDeep" class="hidden"/.test(src));
chk("★ 舊 #typeScenes 獨立分頁已拆走", !/<section id="typeScenes"/.test(src) && !/id="typeScenesList"/.test(src) && !/window\.renderTypeScenes = function/.test(src));
chk("★ 舊 #typeMore 入口卡已拆走", !/id="typeMore"/.test(src) && !/window\.renderTypeMore = function/.test(src));
chk("★ openTypeScenes 函數仍存在（#typeScenes 深層連結靠佢；文章頁底嗰粒掣已按 Roy 要求刪走）",
    /window\.openTypeScenes = function/.test(src) && /"#typeScenes": "openTypeScenes"/.test(src)
    && !/openTypeScenes\(window\._lastArticleType\)/.test(src));
chk("★ 舊 show() 清單冇再列出 typeScenes", !/"dims","typeScenes"/.test(src) && !/"typeScenes","letter"/.test(src));
chk("★ CSS：關係卡兩欄 grid + 左邊色條（--rc）", /\.type-rel-grid\{display:grid;grid-template-columns:1fr 1fr/.test(src) && /\.type-rel-card\{[^}]*border-left:3px solid var\(--rc\)/.test(src));
chk("★ CSS：關係卡內文字級跟「卡片解釋字」標準（.85rem / #6b6560）", /\.type-rel-item\{font-size:\.85rem;color:#6b6560/.test(src));
chk("★ dark 規則喺 #dark-layer 內（唔可以落主 <style>）", (function(){
  const i=src.indexOf('id="dark-layer"'), j=src.indexOf("</style>", i), seg=src.slice(i,j);
  return i>0 && /html\.dk \.type-rel-card\{/.test(seg) && /html\.dk \.type-rel-item\{/.test(seg);
})());
chk("★ dark 規則只改顏色（冇 display／尺寸／位置／動畫）", (function(){
  const i=src.indexOf('id="dark-layer"'), j=src.indexOf("</style>", i), seg=src.slice(i,j);
  const rules=(seg.match(/html\.dk [^{}]*\{[^}]*\}/g)||[]).filter(r=>/type-rel/.test(r));
  return rules.length>0 && rules.every(r=>!/display|width|height|margin|padding|font-size|position|transform|animation|transition|top:|left:/.test(r.split("{")[1]||""));
})(), "");

// ── jsdom ──
const dom=new JSDOM(html,{runScripts:"dangerously",pretendToBeVisual:true,url:"https://fung2222.github.io/hk-mbti/",virtualConsole:vc,
  beforeParse(w){ w.alert=()=>{}; w.confirm=()=>true; stubCanvas(w);
    try{ Object.defineProperty(w,"appDialog",{configurable:true,get(){return ()=>Promise.resolve(true);},set(){}}); }catch(e){}
    try{ Object.defineProperty(w,"appNotice",{configurable:true,get(){return ()=>Promise.resolve(true);},set(){}}); }catch(e){} }});
setTimeout(async ()=>{
  const w=dom.window, d=w.document;
  const $=s=>d.querySelector(s), vis=id=>{const el=d.getElementById(id); return el && !el.classList.contains("hidden");};
  const btn=t=>$('#typeTabSwitch .hub-mode-btn[data-tab="'+t+'"]');
  const onTab=()=>(d.querySelectorAll("#typeTabSwitch .hub-mode-btn.is-on")[0]||{}).dataset;

  // ---------- 免費用戶 ----------
  w.openType("INTJ","hub");
  chk("★ 開型 → 停喺 #type", vis("type"), w._showing);
  chk("★ 默認 tab = 性格（只有佢顯示）", vis("typeTabBasic") && !vis("typeTabRel") && !vis("typeTabScene") && !vis("typeTabDeep"));
  chk("★ 色卡有 4 字母 + 中文名 + slogan", $("#typeBig").textContent==="INTJ" && $("#typeName").textContent.length>0 && /「/.test($("#typeSlogan").textContent));
  chk("★ 性格 tab 用返未用過嘅資料：desc", $("#typeDesc").textContent.length>10, $("#typeDesc").textContent.slice(0,24));
  chk("★ 性格 tab 有 tags 徽章（4 個）", d.querySelectorAll("#typeTags .scenario-badge").length===4, d.querySelectorAll("#typeTags .scenario-badge").length);
  chk("★ 性格 tab 有性格刻度（3 條 bar，用返 score 資料）", d.querySelectorAll("#typeScore .stat-bar .stat-fill").length===3, d.querySelectorAll("#typeScore .stat-bar").length);
  chk("★ 性格 tab 有強項／弱項兩欄", d.querySelectorAll("#typeProsCons .grid-cols-2 > div").length===2 && d.querySelectorAll("#typeProsCons .pros-item").length>=8);
chk("★ 強項／弱項每一項都有自己嘅 icon（冇裸 ＋／－）", (function(){
  const items=[...d.querySelectorAll("#typeProsCons .pros-item")];
  return items.length>=8 && items.every(el=>{ const sv=el.querySelector("svg.pros-ico"); return sv && sv.querySelectorAll("path,circle").length>0; }) && d.querySelectorAll("#typeProsCons .pros-mark").length===0;
})(), d.querySelectorAll("#typeProsCons .pros-item").length+" 項");
chk("★ 強項 icon 同弱項 icon 分色（強金／弱灰）", (function(){
  const st=d.querySelectorAll("#typeProsCons .pros-box.is-str .pros-ico").length;
  const wk=d.querySelectorAll("#typeProsCons .pros-box.is-wk .pros-ico").length;
  return st>=4 && wk>=4 && /\.pros-box\.is-str \.pros-ico\{stroke:#9A8149\}/.test(src) && /\.pros-box\.is-wk \.pros-ico\{stroke:#8A837A\}/.test(src);
})());
chk("★ 99 個性格詞全部有對應 icon（唔靠 fallback）", (function(){
  const F=w.TYPES_FULL||{}, M=w.PROS_WORD_ICO||{}; const a=new Set();
  Object.keys(F).forEach(c=>{ (F[c].strength||[]).forEach(x=>a.add(x)); (F[c].weakness||[]).forEach(x=>a.add(x)); });
  const uniq=[...a];
  return uniq.length>=90 && uniq.every(x=>M[x]||M[String(x).replace(/\s+/g,"")]);
})(), (function(){ const F=w.TYPES_FULL||{}, M=w.PROS_WORD_ICO||{}; const a=new Set(); Object.keys(F).forEach(c=>{(F[c].strength||[]).forEach(x=>a.add(x));(F[c].weakness||[]).forEach(x=>a.add(x));}); const m=[...a].filter(x=>!M[x]&&!M[String(x).replace(/\s+/g,"")]); return m.length?m.join("／"):"全部有"; })());
chk("★ icon 唔係一個公仔走天涯（16 型用到 >=6 個語意家族）", (function(){
  const F=w.TYPES_FULL||{}, M=w.PROS_WORD_ICO||{}; const fams=new Set();
  Object.keys(F).forEach(c=>{ (F[c].strength||[]).concat(F[c].weakness||[]).forEach(x=>{ fams.add(M[x]||M[String(x).replace(/\s+/g,"")]); }); });
  return fams.size>=6 && !fams.has(undefined);
})());
  chk("★ 性格 tab 保留「完整性格分析」長文", d.querySelectorAll("#typeFull p, #typeFull div").length>0 && $("#typeFull").innerHTML.length>200, $("#typeFull").innerHTML.length);
  chk("★ 性格刻度 bar 闊度跟分數（每個 bar = 分數 × 10%）", (function(){
  const rows=[...d.querySelectorAll("#typeScore .stat-bar")];
  const nums=[...d.querySelectorAll("#typeScore .font-bold.text-ink")].map(x=>parseInt(x.textContent,10));
  if(rows.length!==3 || nums.some(isNaN)) return false;
  return rows.every((r,i)=>{ const m=(r.innerHTML.match(/width:(\d+)%/)||[])[1]; return Number(m)===nums[i]*10; });
})(), $("#typeScore").textContent.replace(/\s+/g," ").slice(0,60));

  // 切去關係
  btn("rel").click();
  chk("★ 撳「關係」→ 關係面板顯示、性格隱藏", vis("typeTabRel") && !vis("typeTabBasic"));
  chk("★ is-on 只有一個（關係）", d.querySelectorAll("#typeTabSwitch .hub-mode-btn.is-on").length===1 && onTab().tab==="rel", JSON.stringify(onTab()));
  chk("★ 關係 tab 有 4 張卡（職場／愛情／友情／衝突）", d.querySelectorAll("#typeRelCards .type-rel-card").length===4, d.querySelectorAll("#typeRelCards .type-rel-card").length);
  chk("★ 關係卡有 icon（線條 stroke 風格）", d.querySelectorAll("#typeRelCards .type-rel-ico").length===4);
  chk("★ 關係卡文字唔再係一行逗號（逐項列出）", d.querySelectorAll("#typeRelCards .type-rel-item").length>=15, d.querySelectorAll("#typeRelCards .type-rel-item").length);
  chk("★ 關係 tab 有相容性（2 個型 + 穩定 %）", d.querySelectorAll("#typeCompat > div").length===2 && /% 夾/.test($("#typeCompat").textContent));
  chk("★ 相容 % 係穩定值（唔用 Math.random）", !/Math\.random/.test(src.slice(src.indexOf("window.renderTypeTabs = function"), src.indexOf("window.openDeepChapterFromType = function"))));
  const _p1=$("#typeCompat").textContent.match(/(\d+)% 夾/)[1];
  w.openType("INTJ","hub"); btn("rel").click();
  chk("★ 相容 % 重開之後一樣", $("#typeCompat").textContent.match(/(\d+)% 夾/)[1]===_p1, _p1+" vs "+$("#typeCompat").textContent.match(/(\d+)% 夾/)[1]);

  // 場景
  btn("scene").click();
  chk("★ 撳「場景」→ 場景 tab 顯示", vis("typeTabScene") && !vis("typeTabBasic"));
  const rows=d.querySelectorAll("#typeSceneList .scene-go-row");
  chk("★ 場景 tab 有 10 張卡（相處 7 + 拍拖 3）", rows.length===10, rows.length);
  chk("★ 場景卡有 icon", d.querySelectorAll("#typeSceneList .scene-go-icon, #typeSceneList .scene-go-ico svg").length===10, d.querySelectorAll("#typeSceneList .scene-go-ico svg").length);
  chk("★ 場景卡撳落去直接開情境文章（唔再經獨立分頁）", /open(Social|Romance)Article\(/.test(rows[0].getAttribute("onclick")), rows[0].getAttribute("onclick"));
  chk("★ 場景 tab 分咗「同人相處」「拍拖關係」兩組", /同人相處/.test($("#typeSceneList").textContent) && /拍拖關係/.test($("#typeSceneList").textContent));

  // 深入（免費用戶）
  btn("deep").click();
  chk("★ 撳「深入」→ 深入 tab 顯示", vis("typeTabDeep") && !vis("typeTabBasic"));
  chk("★ 深入 tab 有 9 章", d.querySelectorAll("#typeDeepBox .deep-item").length===9, d.querySelectorAll("#typeDeepBox .deep-item").length);
  chk("★ 免費：第 1 章標「免費」", d.querySelectorAll("#typeDeepBox .deep-tag.is-free").length===1);
  chk("★ 免費：第 2-9 章標「完整版」（8 個）", d.querySelectorAll("#typeDeepBox .deep-tag:not(.is-free)").length===8, d.querySelectorAll("#typeDeepBox .deep-tag:not(.is-free)").length);
  chk("★ 免費：tab 內有解鎖掣", /openUpgrade\(\)/.test($("#typeDeepBox").innerHTML));
  chk("★ 章節標題同 #deep 目錄一致（9 個固定標題）", (function(){
    const t=[...d.querySelectorAll("#typeDeepBox .deep-item")].map(x=>x.textContent);
    return ["你真正想要嘅嘢","你睇唔到嘅 3 個盲點","壓力爆煲時，你會變成點","3 個可以即刻做嘅改變","職場上嘅你","愛情裡嘅你","友情裡嘅你","唔好同你講嘅 3 句","香港情境對照"].every((x,i)=>t[i].includes(x));
  })());

  // 免費用戶撳章節
  d.querySelectorAll("#typeDeepBox .deep-item")[1].click();
  chk("★ 免費撳第 2 章 → 彈升級頁（把關唔放鬆）", vis("upgrade") || w._showing==="upgrade", w._showing);
  w.openType("INTJ","hub"); btn("deep").click();
  d.querySelectorAll("#typeDeepBox .deep-item")[0].click();
  chk("★ 免費撳第 1 章 → 入到章節頁", w._showing==="deepChapter", w._showing);
  chk("★ 章節頁有真內容", $("#deepChapterBody").innerHTML.length>200, $("#deepChapterBody").innerHTML.length);
  chk("★ 章節頁 head 標「免費試睇」", /免費試睇/.test($("#deepChapterHead").textContent), $("#deepChapterHead").textContent);

  // tab 記憶
  w.openType("INTJ","hub"); btn("scene").click();
  chk("★ tab 狀態記入 sessionStorage", w.sessionStorage.getItem("hkmbti_type_tab")==="scene", w.sessionStorage.getItem("hkmbti_type_tab"));
  w.openType("INTJ","hub");
  chk("★ 重開同一型仍然停喺記住嘅 tab（唔會跳返性格）", vis("typeTabScene") && !vis("typeTabBasic"), w._typeTab);

  // 舊入口兼容
  w.openTypeScenes("ENFP");
  chk("★ 舊入口 openTypeScenes(ENFP) → 人格頁 + 場景 tab", vis("type") && vis("typeTabScene") && w._lastType==="ENFP", w._showing+"/"+w._lastType+"/"+w._typeTab);
  chk("★ 場景 tab 內容跟型別（ENFP 都有 10 個）", d.querySelectorAll("#typeSceneList .scene-go-row").length===10);

  // 16 型全部 render 得出 4 個 tab
  const CODES=["INTJ","INTP","ENTJ","ENTP","INFJ","INFP","ENFJ","ENFP","ISTJ","ISFJ","ESTJ","ESFJ","ISTP","ISFP","ESTP","ESFP"];
  let bad=[];
  for(const c of CODES){
    try{
      w.openType(c,"hub");
      const nb=d.querySelectorAll("#typeTags .scenario-badge").length;
      const ns=d.querySelectorAll("#typeScore .stat-fill").length;
      const nrc=d.querySelectorAll("#typeRelCards .type-rel-card").length;
      const nd=d.querySelectorAll("#typeDeepBox .deep-item").length;
      if(!(nb===4 && ns===3 && nrc===4 && nd===9)) bad.push(c+"(t"+nb+"/s"+ns+"/r"+nrc+"/d"+nd+")");
    }catch(e){ bad.push(c+" throw:"+e.message); }
  }
  chk("★ 16 型 × 4 tab 全部 render 得出（4 tags／3 刻度／4 關係卡／9 章）", bad.length===0, bad.join(" "));

  // ---------- 人格頁左右箭咀（Roy 2026-10-02：色卡加三角箭咀快速轉型）----------
  // 注意：jsdom 嘅 innerText 寫入唔會反映去 textContent → 一定要讀 innerText（唔可以讀 textContent）
  chk("★ 色卡 #typeHero 內有左右三角箭咀（有 aria-label）", (function(){
    const h=$("#typeHero"); if(!h) return false;
    const pv=h.querySelector("#typePrev"), nx=h.querySelector("#typeNext");
    return !!pv && !!nx && /上一個類型/.test(pv.getAttribute("aria-label")||"") && /下一個類型/.test(nx.getAttribute("aria-label")||"");
  })());
  chk("★ 箭咀用 monoline SVG 三角（fill:none／stroke:currentColor，唔係 emoji）", (function(){
    return /\.type-nav svg\{[^}]*fill:none[^}]*stroke:currentColor/.test(src)
        && /<path d="M15\.4 4\.8L7\.2 12l8\.2 7\.2z"\/>/.test(src)
        && /<path d="M8\.6 4\.8L16\.8 12l-8\.2 7\.2z"\/>/.test(src);
  })());
  // ⚠️ 已知重複（2026-10-02 查實）：index.html 有 3 份一模一樣嘅 16 型次序 ——
  //    `window.DEEP_ORDER`（深入分析，L5563 左右）、`renderDeepList` 內聯一份（L6036 左右）、
  //    同今次新增嘅 `window.TYPE_ORDER`（百科格／主頁跑馬燈／人格頁箭咀）。
  //    今次刻意唔整合（最小改動；而且 TYPE_ORDER 定義喺 DEEP_ORDER 之後，直接引用會 undefined）。
  //    → 將來如果要改次序，**三處都要改**；要整合就要先將 TYPE_ORDER 搬去 script 最前。
  chk("★ 16 型次序：新 window.TYPE_ORDER 存在，百科格／主頁跑馬燈／箭咀共用同一來源",
      /window\.TYPE_ORDER = \["INTJ","INTP"/.test(src) && /const order = window\.TYPE_ORDER;/.test(src)
      && /const order = window\.TYPE_ORDER \|\| \[\]/.test(src));
  chk("★ 已知重複次序嘅數量＝3（DEEP_ORDER／內聯／TYPE_ORDER）—— 改次序時要三處齊改",
      (src.match(/\["INTJ","INTP","ENTJ","ENTP","INFJ"/g)||[]).length === 3,
      String((src.match(/\["INTJ","INTP","ENTJ","ENTP","INFJ"/g)||[]).length));
  chk("★ typeStep 有定義、而且係全站 use 同一個 source of truth",
      /window\.typeStep = function\(dir\)/.test(src) && /const order = window\.TYPE_ORDER \|\| \[\]/.test(src));

  w.openType("INTJ","hub"); await new Promise(r=>setTimeout(r,60));
  const BIG=()=>$("#typeBig").innerText, NM=()=>$("#typeName").innerText;
  chk("★ 起始 = INTJ / 建築師", BIG()==="INTJ" && NM()==="建築師", BIG()+"/"+NM());
  const depth0=w._histDepth||0, hlen0=w.history.length;
  $("#typeNext").click(); await new Promise(r=>setTimeout(r,90));
  chk("★ 撳右箭咀 → INTJ 變 INTP（色卡 4 字母／中文名／麵包屑全部換）",
      BIG()==="INTP" && NM()==="邏輯學家" && /性格 \/ INTP/.test($("#typeBreadcrumb").innerText),
      BIG()+"/"+NM()+"/"+$("#typeBreadcrumb").innerText);
  chk("★ 轉型後下面內容都真係換（描述唔係殘留舊型、刻度 3 條）",
      $("#typeDesc").textContent.length>20 && $("#typeScore").querySelectorAll(".stat-bar").length===3,
      $("#typeDesc").textContent.slice(0,14)+"…");
  chk("★ 色卡背景跟住型轉（用該型 palette）", /linear-gradient/.test($("#typeHero").style.background||""), $("#typeHero").style.background);
  chk("★ 轉型**唔會加 history 層**（同一頁換內容，撳返回仍然返上一頁）",
      (w._histDepth||0)===depth0 && w.history.length===hlen0, "depth "+depth0+"→"+w._histDepth+" / len "+hlen0+"→"+w.history.length);
  chk("★ 當前歷史層快照已更新做新型（replace，唔係留住舊型）", w._navSnap().type==="INTP", w._navSnap().type);
  $("#typePrev").click(); await new Promise(r=>setTimeout(r,80));
  chk("★ 撳左箭咀返得返上一個（INTP → INTJ）", BIG()==="INTJ", BIG());
  w.openType("INTJ","hub"); await new Promise(r=>setTimeout(r,40));
  $("#typePrev").click(); await new Promise(r=>setTimeout(r,80));
  chk("★ 第一型撳「上一個」會環繞去最後一型（INTJ → ESFP）", BIG()==="ESFP", BIG());
  $("#typeNext").click(); await new Promise(r=>setTimeout(r,80));
  chk("★ 最後一型撳「下一個」環繞返第一型（ESFP → INTJ）", BIG()==="INTJ", BIG());

  // 全部 16 型行一次：次序要同 TYPE_ORDER 一模一樣，中途唔准 throw
  w.openType("INTJ","hub"); await new Promise(r=>setTimeout(r,40));
  const seen=[BIG()], bad2=[];
  for(let i=0;i<15;i++){ try{ $("#typeNext").click(); await new Promise(r=>setTimeout(r,14)); seen.push(BIG()); }catch(e){ bad2.push(e.message); } }
  chk("★ 行 15 步嘅次序 = window.TYPE_ORDER 全 16 型（冇跳／冇重複／冇 throw）",
      bad2.length===0 && JSON.stringify(seen)===JSON.stringify(w.TYPE_ORDER), bad2.join("|")||seen.join(","));
  $("#typeNext").click(); await new Promise(r=>setTimeout(r,60));
  chk("★ 第 16 步環繞返起點 INTJ", BIG()==="INTJ", BIG());

  // 轉型要保留當前分頁（唔准彈返「性格」）
  w.openType("INTJ","hub"); w.setTypeTab("scene"); await new Promise(r=>setTimeout(r,60));
  $("#typeNext").click(); await new Promise(r=>setTimeout(r,120));
  chk("★ 喺「場景」分頁轉型 → 仍然留喺場景分頁（10 個場景卡仍在）",
      w._typeTab==="scene" && !$("#typeTabScene").classList.contains("hidden")
      && $("#typeSceneList").querySelectorAll(".scene-go-row").length===10,
      w._typeTab+" / "+$("#typeSceneList").querySelectorAll(".scene-go-row").length);
  w.setTypeTab("rel"); await new Promise(r=>setTimeout(r,60));
  $("#typeNext").click(); await new Promise(r=>setTimeout(r,120));
  chk("★ 喺「關係」分頁轉型 → 仍然留喺關係分頁、配對 icon 重 render",
      w._typeTab==="rel" && $("#typeCompat").querySelectorAll(".cmp-ico").length>0,
      w._typeTab+" / "+$("#typeCompat").querySelectorAll(".cmp-ico").length);
  // 來源要記住（由結果頁入 → 轉型後 _typeFrom 仍然係 result）
  w._typeFrom="result"; w.openType("INTJ","result"); await new Promise(r=>setTimeout(r,40));
  $("#typeNext").click(); await new Promise(r=>setTimeout(r,80));
  chk("★ 由結果頁入再轉型 → _typeFrom 保留（唔會被清走）", w._typeFrom==="result" && BIG()==="INTP", String(w._typeFrom)+"/"+BIG());

  // ---------- 完整版 ----------
  w.unlockFull();
  await new Promise(r=>setTimeout(r,320));
  w.openType("INTJ","hub"); btn("deep").click();
  chk("★ 完整版：深入 tab 唔再標「完整版」", d.querySelectorAll("#typeDeepBox .deep-tag").length===0, d.querySelectorAll("#typeDeepBox .deep-tag").length);
  chk("★ 完整版：冇解鎖掣", !/openUpgrade\(\)/.test($("#typeDeepBox").innerHTML));
  d.querySelectorAll("#typeDeepBox .deep-item")[4].click();
  chk("★ 完整版撳第 5 章 → 直接入到（唔彈升級）", w._showing==="deepChapter" && /完整版/.test($("#deepChapterHead").textContent), w._showing+"/"+$("#deepChapterHead").textContent);

  chk("★ 冇 jsdom 錯誤", jerr.length===0, jerr.slice(0,2).join(" | "));
  console.log("");
  console.log(fail$());
  function fail$(){ return ok===total ? "===== 全部通過（"+ok+"/"+total+"）=====" : "===== 有失敗（"+ok+"/"+total+"）====="; }
  process.exit(ok===total?0:1);
},400);
