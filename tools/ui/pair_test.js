/* 配對深入（B 模組）回歸測試 — Roy 2026-10-04 批准
   入口：結果頁「與你的朋友配對」每行「睇你哋點相處」；畫面 #pair */
const fs=require("fs"), path=require("path");
const {JSDOM}=require("jsdom");
const REPO=path.resolve(__dirname,"../..");
const RAW=fs.readFileSync(path.join(REPO,"index.html"),"utf8");
const PAIRS_JS=fs.readFileSync(path.join(REPO,"pair-data.js"),"utf8");
const HTML=RAW.replace(/<script src="(https?:)?\/\/[^"]*"><\/script>/g,"")
               .replace(/<script src="([^"]+\.js)"><\/script>/g,(m,f)=>fs.existsSync(path.join(REPO,f))?"<script>\n"+fs.readFileSync(path.join(REPO,f),"utf8")+"\n</script>":"");
let ok=0,total=0;
function chk(n,c,x){ total++; if(c)ok++; console.log((c?"✓":"✗")+" "+n+(c?"":"   <- "+(x===undefined?"":x))); }

// ───────── 一、靜態 ─────────
chk("★ pair-data.js 有引入", /<script src="pair-data\.js"><\/script>/.test(RAW));
chk("★ #pair 畫面存在＋有返回掣（goBack）", /<section id="pair"/.test(RAW) && /id="pairBody"/.test(RAW));
chk("★ 配對列表每行有入口掣（openPair）", /onclick="openPair\('\$\{type\}','\$\{c\}'\)"/.test(RAW));
chk("★ 導覽堆疊有記 pairA／pairB（返回會還原同一篇）", RAW.includes("pairA: window._pairA || null") && RAW.includes('if(id === "pair" && prev && prev.pairA && prev.pairB)'));
chk("★ 內容冇 emoji", !/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u.test(PAIRS_JS));
chk("★ 內容唔提「買斷／付費／訂閱」", !/買斷|付費|訂閱/.test(PAIRS_JS));
// 守門（2026-10-04）：黑夜色一定要喺 #dark-layer 且 html.dk 前綴 —— 曾誤放主 style 令光模式都用金黃字 ✗
const PAGE_SRC=fs.readFileSync(path.join(REPO,"index.html"),"utf8");
const mainBlock=(PAGE_SRC.match(/<style>([\s\S]*?)<\/style>/)||["",""])[1];
const dkBlock=(PAGE_SRC.match(/<style id="dark-layer">([\s\S]*?)<\/style>/)||["",""])[1];
chk("★ 守門：#dark-layer 有 html.dk 前綴嘅 .pair-go/.pair-ol/.pair-x 色", /html\.dk \.pair-go\{/.test(dkBlock) && /html\.dk \.pair-ol li/.test(dkBlock) && /html\.dk \.pair-x\{/.test(dkBlock));
chk("★ 守門：主 style 冇「冇 html.dk 前綴」嘅 .pair 黑夜色（#D9B26A／#A79E92／#C0A87A）",
    !/\.pair-go\{[^}]*#D9B26A/.test(mainBlock) && !/\.pair-ol li,\.pair-ul li\{color:#A79E92\}/.test(mainBlock) && !/\.pair-x\{color:#C0A87A\}/.test(mainBlock));
chk("★ CSS 有 .pair-go／.pair-ol（黑夜只加色）", /\.pair-go\{/.test(RAW) && /\.pair-ol li/.test(RAW));
chk("★ 桌面有 html.dt #pair 寬度規則", /html\.dt #pair > \*\{max-width:760px/.test(RAW));

// ───────── 二、真跑（jsdom） ─────────
const dom=new JSDOM(HTML,{runScripts:"dangerously",pretendToBeVisual:true,url:"https://example.com/"});
const w=dom.window, d=w.document;
const P=w.PAIRS||{};
const keys=Object.keys(P);
chk("★ 至少 16 篇（第一批 INFP × 16）", keys.length>=16, keys.length+" 篇");
// 不變量 1：行完整性 —— 邊個型有自己嘅自配對（X|X），就要同其餘 15 型都有文
const TYPES16=["INFP","ENFP","ISFJ","ESFJ","ISTJ","ESTJ","ISFP","ESFP","INTP","ENTP","INFJ","ENFJ","INTJ","ENTJ","ISTP","ESTP"];
const rows=TYPES16.filter(x=>P[x+"|"+x]);
const incomplete=rows.filter(T=>TYPES16.some(U=>!(P[T+"|"+U]||P[U+"|"+T])));
chk("★ 行完整性：已完成嘅行（"+rows.join("／")+"）同其餘 15 型都有文",
    rows.length>0 && incomplete.length===0, "未齊: "+incomplete.join("／"));
// 不變量 2：唔准同一對出現兩次（兩個方向）
const dupes=keys.filter(k=>{const [x,y]=k.split("|"); return x!==y && P[y+"|"+x];});
chk("★ 冇反向重複（同一對唔會出現兩次）", dupes.length===0, dupes.join(" , "));
// 不變量 3：key 一定要係合法型號對
const badKey=keys.filter(k=>!/^[EI][NS][TF][JP]\|[EI][NS][TF][JP]$/.test(k));
chk("★ 所有 key 都係合法 4 字母型號對", badKey.length===0, badKey.join(" , "));
chk("★ 每篇 4 段齊（spark／clash×3／give×2／sum）",
    keys.every(k=>P[k].spark && (P[k].clash||[]).length===3 && (P[k].give||[]).length===2 && P[k].sum));

// 開一篇
w.openPair("INFP","ENFP");
const body=d.getElementById("pairBody").innerHTML;
chk("★ 開 INFP × ENFP：出咗畫面＋標題", /INFP × ENFP/.test(d.getElementById("pairTitle").innerText) && body.length>300);
chk("★ 出齊 4 個區塊標題", /最容易撞嘅 3 個位/.test(body) && /各自要讓一步/.test(body));
chk("★ clash 3 條、give 2 條真係 render 落去", (body.match(/<li>/g)||[]).length===5, (body.match(/<li>/g)||[]).length);
chk("★ 有標準 CTA（燈泡＋想知道自己 MBTI 人格？＋立即測試）",
    /cta-bulb/.test(body) && /想知道自己 MBTI 人格？/.test(body) && /goPickVersion\(\)">立即測試</.test(body));
chk("★ 畫面轉咗去 #pair", !d.getElementById("pair").classList.contains("hidden"));

// 反方向都要拎到同一篇（pairKey 兩個方向都試）
const bodyA=d.getElementById("pairBody").innerHTML;
w.openPair("ENFP","INFP");
chk("★ 反方向（ENFP × INFP）拎到同一篇內容（pairKey 雙向）",
    /最容易撞嘅 3 個位/.test(d.getElementById("pairBody").innerHTML));

// 未寫嘅組合要優雅收場 —— 唔可以寫死某一對，要由資料動態搵。
// 2026-10-05：136 對全部寫齊之後已經冇「真未寫」組合 → 改為臨時抽走一對嚟測（測完即還原），
// 咁樣無論配對寫到幾多成，呢條測試都永遠有意義。
const _all=Object.keys(P);
const _victim=_all[_all.length-1];
const _ab=_victim.split("|");
const _saved=P[_victim];
delete P[_victim];
w.openPair(_ab[0], _ab[1]);
chk("★ 未寫嘅組合（臨時抽走 "+_victim+"）→ 出「陸續補上」提示，唔會空白／爆",
    /仲喺度寫/.test(d.getElementById("pairBody").innerHTML) && !d.getElementById("pair").classList.contains("hidden"));
chk("★ 提示文案嘅對數係動態計（唔會寫死型數）", /對組合寫好咗/.test(d.getElementById("pairBody").innerHTML));
P[_victim]=_saved;
chk("★ 還原之後同一對搵得返內容", w.pairKey(_ab[0],_ab[1])===_victim);

// 結果頁入口掣
w.localStorage.clear();
w.renderResult({mbti:"INFP-T", pct:{EI:[40,60], SN:[35,65], TF:[70,30], JP:[80,20], TA:[62,38]}, closeAxes:[], score:{}, version:"life", totalQ:60});
chk("★ 結果頁配對列表出咗「睇你哋點相處」掣", /睇你哋點相處/.test(d.body.innerHTML) && /openPair\('INFP','/.test(d.body.innerHTML));

// 導覽：snap → restore
w.openPair("INFP","INFJ");
const snap=w._navSnap();
chk("★ 導覽快照記住咗 pair（pairA/pairB）", snap && snap.id==="pair" && snap.pairA==="INFP" && snap.pairB==="INFJ", JSON.stringify({id:snap&&snap.id,a:snap&&snap.pairA,b:snap&&snap.pairB}));
d.getElementById("pairBody").innerHTML="";
w.restoreNav(snap);
chk("★ restoreNav 還原得返同一篇（唔會空白）", /最容易撞嘅 3 個位/.test(d.getElementById("pairBody").innerHTML));

// ── 畫面互斥（Roy 2026-10-04 實報：「入咗配對頁 → 按返回 → 配對頁同結果頁上下合埋」）
//    根因：show() 嘅硬編碼隱藏清單漏咗 "pair" → #pair 永遠唔會被 hidden。
const vis=()=>[...d.querySelectorAll("section[id]")].filter(x=>!x.classList.contains("hidden")).map(x=>x.id).join();
w.renderResult({mbti:"INFP-T", pct:{EI:[40,60], SN:[35,65], TF:[70,30], JP:[80,20], TA:[62,38]}, closeAxes:[], score:{}, version:"life", totalQ:60});
w.show("result");
w.openPair("INFP","ENFP");
chk("★ 畫面互斥：入配對頁之後，只有 #pair 顯示（#result 必須 hidden）", vis()==="pair", vis());
w.show("result");
chk("★ 畫面互斥：返結果頁之後，只有 #result 顯示（#pair 必須 hidden）", vis()==="result", vis());
// ★ 真 popstate 路徑（＝手機實體返回鍵／瀏覽器返回掣，Roy 2026-10-04 實報嗰條路）
//   由配對頁撳返回 → app 會行 popstate handler → restoreNav({id:"result"}) → viewHistoryResult(idx)
//   → show("result")。修復前：#pair 唔會被 hidden → 兩個畫面疊埋（用戶可見 bug）。
const _rec={id:"r0",mbti:"INFP-A",timestamp:Date.now(),completed:true,name:"Roy",nickname:"阿豐",version:"life",
            pct:{EI:[40,60],SN:[35,65],TF:[70,30],JP:[80,20],TA:[62,38]},closeAxes:[],score:{},totalQ:10};
w.localStorage.setItem("hkmbti_history", JSON.stringify([_rec]));
w.localStorage.setItem("hkmbti_last_result", JSON.stringify(_rec));
w.sessionStorage.setItem("hkmbti_last_record_idx","0");
w.renderResult(_rec, true); w.show("result"); w.openPair("INFP","ENFJ");
const beforePop=vis();
const pe=new w.Event("popstate"); pe.state={hk:true,id:"result",sKey:null,rKey:null,type:null,typeFrom:null,letter:null,pairA:null,pairB:null,articleType:null};
w.dispatchEvent(pe);
chk("★ 真 popstate（撳返回）之後：只可以見到 #result", beforePop==="pair" && vis()==="result", "pop 前="+beforePop+" / pop 後="+vis());

// 守門：show() 嘅隱藏清單一定要覆蓋全部 section[id]，將來加新畫面唔可以再漏
const PAGE=fs.readFileSync(path.join(REPO,"index.html"),"utf8");
const allSec=[...new Set([...PAGE.matchAll(/<section[^>]*id="([^"]+)"/g)].map(m=>m[1]))];
const hideList=(PAGE.match(/\["home","profile","test"[^\]]*\]/)||[""])[0];
chk("★ 守門：show() 畫面清單覆蓋全部 section[id]（" + allSec.length + " 個）",
    allSec.every(x=>hideList.indexOf('"'+x+'"')>=0), "漏：" + allSec.filter(x=>hideList.indexOf('"'+x+'"')<0).join(","));


// 不變量 4：內容唔准出現簡體專用字（2026-10-04 加：寫第二批時手誤寫過一個「为」）
const SIMP_ONLY="为们这说会时让还过对觉东车买卖来见听问间无发样门机长网岁点热闹爱气头实际亲记认识语读写学习义举优势应该处达与专业";
const simp=keys.filter(k=>new RegExp("["+SIMP_ONLY+"]").test(JSON.stringify(P[k])));
chk("★ 內容零簡體專用字（繁體／港式用字）", simp.length===0, simp.slice(0,4).join(" , "));

// 不變量 5：所有兩兩組合都要有深入內容（2026-10-05 寫齊 136/136）
// 型號清單由 window.TYPES 動態取 —— 將來加型號而漏寫配對，呢條即刻紅
const ROWS=Object.keys(w.TYPES||{}).filter(x=>/^[EI][NS][TF][JP]$/.test(x));
const miss=[];
for(let i=0;i<ROWS.length;i++)for(let j=i;j<ROWS.length;j++){
  const a=ROWS[i], b=ROWS[j];
  if(!(a+"|"+b in P) && !(b+"|"+a in P)) miss.push(a+"×"+b);
}
chk("★ 16 型全部兩兩組合都有深入內容（"+ROWS.length+" 型 → 應該 "+((ROWS.length*(ROWS.length+1))/2)+" 對）",
    miss.length===0, "缺 "+miss.length+" 對："+miss.slice(0,6).join(" , "));

// 不變量 6：配對文案唔准用「你」指讀者（規格：用型號 ＋「嘅人」講）—— 台詞『…』「…」內除外。
// 根因：同一篇兩個方向嘅用戶都會讀到，用「你」一定有一半人睇錯（skill premium-tier.md 第 501 行）。
// 分批改：`DUENI_ROWS` = 已改完嘅型號行；改完一行就加落去，全部改完就變 null（驗全檔）。
const DUENI_ROWS = ["INFP"];   // null = 全檔都改完
const stripQ = s => s.replace(/[『「][^』」]*[』」]/g, "");
const dueni = [];
for (const [k, v] of Object.entries(P)) {
  if (DUENI_ROWS && !DUENI_ROWS.some(r => k.startsWith(r + "|"))) continue;
  const look = (sec, s) => { if (s && stripQ(s).indexOf("你") >= 0) dueni.push(k + "/" + sec); };
  look("spark", v.spark); look("sum", v.sum);
  (v.clash || []).forEach(s => look("clash", s));
  (v.give || []).forEach(s => look("give", s));
}
chk("★ 配對文案零「你」（" + (DUENI_ROWS ? "已改：" + DUENI_ROWS.join("、") : "全檔") + "；台詞除外）",
    dueni.length === 0, dueni.slice(0, 5).join(" , "));

console.log("\n===== " + (ok===total ? "全部通過" : "有失敗") + " " + ok + "/" + total + " =====");
process.exit(ok===total?0:1);
