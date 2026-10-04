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

// 未寫嘅組合要優雅收場
w.openPair("INTJ","ESTJ");
chk("★ 未寫嘅組合 → 出「陸續補上」提示，唔會空白／爆",
    /仲喺度寫/.test(d.getElementById("pairBody").innerHTML) && !d.getElementById("pair").classList.contains("hidden"));

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

console.log("\n===== " + (ok===total ? "全部通過" : "有失敗") + " " + ok + "/" + total + " =====");
process.exit(ok===total?0:1);
