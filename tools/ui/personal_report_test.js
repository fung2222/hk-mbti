/* 完整版 D 模組：個人化報告（入口＝結果頁）回歸測試 — Roy 2026-10-04
   檢查：未解鎖唔漏數字、已解鎖出齊 3 相似型＋3 盲點＋5 軸、deterministic、閘只用 getTier() */
const fs=require("fs"), path=require("path");
const {JSDOM}=require("jsdom");
const REPO=path.resolve(__dirname,"../..");
const RAW=fs.readFileSync(path.join(REPO,"index.html"),"utf8");
const HTML=RAW.replace(/<script src="(https?:)?\/\/[^"]*"><\/script>/g,"")
               .replace(/<script src="([^"]+\.js)"><\/script>/g,(m,f)=>fs.existsSync(path.join(REPO,f))?"<script>\n"+fs.readFileSync(path.join(REPO,f),"utf8")+"\n</script>":"");
let ok=0,total=0;
function chk(n,c,x){ total++; if(c)ok++; console.log((c?"✓":"✗")+" "+n+(c?"":"   <- "+(x===undefined?"":x))); }

// ───────── 一、靜態結構 ─────────
const rsec = RAW.slice(RAW.indexOf('<section id="result"'), RAW.indexOf('<section id="result"')+7000);
chk("★ 結果頁有 #personalReport 容器", /id="personalReport"/.test(rsec));
chk("★ D 卡位置喺 #compatibility **之前**（最先見到「你」嘅數據）",
    rsec.indexOf('id="personalReport"')>0 && rsec.indexOf('id="personalReport"') < rsec.indexOf('id="compatibility"'),
    "pr="+rsec.indexOf('id="personalReport"')+" comp="+rsec.indexOf('id="compatibility"'));
chk("★ CSS 有 D 模組樣式（.pr-note／.pr-sim／.pr-axis）", /\.pr-note\{/.test(RAW) && /\.pr-sim\{/.test(RAW) && /\.pr-axis\{/.test(RAW));
chk("★ 黑夜層只加色（#dark-layer 內有 .pr- 顏色規則，含 #A79E92）",
    /#dark-layer[\s\S]{0,4000}\.pr-note\{color:#A79E92\}/.test(RAW) || /\.pr-sim-d,\.pr-note\{color:#A79E92\}/.test(RAW));
chk("★ 新 code 零 Math.random（deterministic）", !/Math\.random/.test(RAW.slice(RAW.indexOf("window.personalReport = function"), RAW.indexOf("window.renderResult = function(r){"))));
chk("★ 新 code 零 emoji", !/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u.test(RAW.slice(RAW.indexOf("window.PR_AXES"), RAW.indexOf("window.renderResult = function(r){"))));
chk("★ 新文案唔提「買斷／付費／訂閱」", !/買斷|付費|訂閱/.test(RAW.slice(RAW.indexOf("window.PR_AXES"), RAW.indexOf("window.renderResult = function(r){"))));

// ───────── 二、真跑（jsdom） ─────────
const dom=new JSDOM(HTML,{runScripts:"dangerously",pretendToBeVisual:true,url:"https://example.com/"});
const w=dom.window, d=w.document;
const R={mbti:"INTJ-T", pct:{EI:[40,60], SN:[35,65], TF:[70,30], JP:[80,20], TA:[62,38]}, closeAxes:[],
         score:{E:5,I:7,S:4,N:8,T:7,F:3,J:9,P:2,T2:6,A2:4}, version:"life", totalQ:60};

// 未解鎖
w.localStorage.removeItem(w.TIER_KEY);
w.renderResult(JSON.parse(JSON.stringify(R)));
let box=d.getElementById("personalReport");
const locked=box.innerHTML;
chk("★ 未解鎖：出咗 D 卡片", locked.length>0);
chk("★ 未解鎖：有標題「完整版 · 你嘅個人化報告」", /完整版 · 你嘅個人化報告/.test(locked));
chk("★ 未解鎖：有「解鎖完整版」掣（onclick=unlockFull()）", /onclick="unlockFull\(\)"[^>]*>解鎖完整版</.test(locked));
chk("★ 未解鎖：洩漏檢查 —— 唔准出現任何百分比／型號／盲點",
    !/%/.test(locked) && !/INTJ|INTP|INFJ/.test(locked) && !/盲點：/.test(locked), locked.replace(/\s+/g," ").slice(0,120));

// 已解鎖
w.localStorage.setItem(w.TIER_KEY,"full");
w.renderResult(JSON.parse(JSON.stringify(R)));
box=d.getElementById("personalReport");
const full1=box.innerHTML;
chk("★ 已解鎖：閘＝getTier()==='full' 生效（唔再出解鎖掣）", !/解鎖完整版/.test(full1));
const sims=[...full1.matchAll(/class="pr-sim-c">([A-Z]{4})</g)].map(m=>m[1]);
chk("★ 已解鎖：出 3 個相似型", sims.length===3, sims.join(","));
chk("★ 已解鎖：第 1 個＝你嘅結果（INTJ）＋標明「你嘅結果」", sims[0]==="INTJ" && /你嘅結果/.test(full1));
const notes=[...full1.matchAll(/class="pr-note">([^<]+)</g)].map(m=>m[1]);
chk("★ 已解鎖：5 條軸解釋 + 3 條盲點 = 8 段文字（3 盲點段含「注意」/「一半一半」）",
    notes.length>=8, notes.length);
chk("★ 已解鎖：盲點數量 = 3（獨立段落）", (full1.match(/你嘅 3 個盲點/g)||[]).length===1);
chk("★ 已解鎖：5 條軸都出齊（E／S／T／J／T 標籤 ＋ %）", (full1.match(/\d+%/g)||[]).length>=10, (full1.match(/\d+%/g)||[]).length);
chk("★ 已解鎖：軸百分比同免費版 r.pct 一致（唔自創數字）",
    /40%/.test(full1) && /60%/.test(full1) && /35%/.test(full1) && /65%/.test(full1), "EI 40/60 + SN 35/65");

// deterministic：同一份答案跑兩次，輸出必須完全一樣
const p1=JSON.stringify(w.personalReport(JSON.parse(JSON.stringify(R))));
const p2=JSON.stringify(w.personalReport(JSON.parse(JSON.stringify(R))));
chk("★ deterministic：同一份答案 → 完全一樣", p1===p2);
w.renderResult(JSON.parse(JSON.stringify(R)));
chk("★ deterministic：重複 render 輸出 byte 一樣", d.getElementById("personalReport").innerHTML===full1);
const p3=JSON.stringify(w.personalReport({mbti:"ENFP-A",pct:{EI:[72,28],SN:[30,70],TF:[38,62],JP:[25,75],TA:[45,55]},closeAxes:["TA"]}));
chk("★ 換一份答案 → 結果跟住變（真個人化）", p3!==p1);

// 相似型「差 N 個字母」正確
const d2=w.personalReport(JSON.parse(JSON.stringify(R)));
d2.similar.slice(1).forEach(function(o){
  const dn=(o.code.split("").filter((c,i)=>c!==R.mbti.charAt(i))).length;
  chk("★ "+o.code+" 顯示「差 "+o.diff.length+" 個字母」同實際一致", o.diff.length===dn, "diff="+o.diff.length+" 實="+dn);
});

// 其他結果頁元素冇被撞爛
w.renderResult(JSON.parse(JSON.stringify(R)));
chk("★ 冇撞爛結果頁原有元素（分享卡／三掣／傾向程度）",
    !!d.getElementById("shareCardImg") && /downloadCard\(\)/.test(d.body.innerHTML) && /你嘅傾向程度/.test(d.body.innerHTML));
chk("★ 結果頁「看完整分析」＋「立即開始」仲在",
    /goTypeFromResult\(\)/.test(d.body.innerHTML) && /goPickVersion\(\)">立即開始</.test(d.body.innerHTML));

// ───────── 三、迴歸：做完測試 → 入紀錄睇 → 出返嚟，D 卡唔可以消失（Roy 2026-10-04 報）─────────
chk("★ saveResult 真係有存 pct／closeAxes／score",
    RAW.includes("record.pct = _sc.pct") && RAW.includes("record.closeAxes = _sc.closeAxes") && RAW.includes("record.score = _sc.score"));
chk("★ 開舊紀錄會帶返 pct／closeAxes",
    RAW.includes("pct: rec.pct || null") && RAW.includes("closeAxes: rec.closeAxes || []"));
chk("★ renderPersonalReport 冇數據唔會盲清空（有同型 fallback）",
    RAW.includes("const same = ls && r && String(ls.mbti"));

// 真跑一次完整流程
w.localStorage.clear();
w.localStorage.setItem(w.TIER_KEY, "full");
w.renderResult(JSON.parse(JSON.stringify(R)));
w.lastResult = R.mbti;
w.saveResult();
const hist = JSON.parse(w.localStorage.getItem("hkmbti_history") || "[]");
chk("★ 真跑：紀錄真係存到 pct（同 r.pct 完全一樣）",
    hist.length === 1 && JSON.stringify(hist[0].pct) === JSON.stringify(R.pct),
    JSON.stringify(hist[0] || {}).slice(0, 150));
const beforeD = d.getElementById("personalReport").innerHTML;
const beforePct = d.getElementById("personalityDetail").innerHTML;
w.viewHistoryResult("0");          // 用戶：入咗去睇嗰條紀錄，再出返嚟
const afterD = d.getElementById("personalReport").innerHTML;
const afterPct = d.getElementById("personalityDetail").innerHTML;
chk("★ 真跑：出入紀錄之後 D 卡仲在（唔再消失）", afterD.length > 0 && /pr-sim-c/.test(afterD), "長度=" + afterD.length);
chk("★ 真跑：D 卡內容同之前一模一樣（3 個相似型＋數字）", afterD === beforeD, "before=" + beforeD.length + "B after=" + afterD.length + "B");
chk("★ 真跑：傾向程度 % 都返嚟（同一個 root cause）", /你嘅傾向程度/.test(afterPct) && /65%/.test(afterPct));
chk("★ 真跑：仲係結果頁（冇被踢走）", /id="result"/.test(d.body.innerHTML) && !d.getElementById("result").classList.contains("hidden"));

console.log("\n===== " + (ok===total ? "全部通過" : "有失敗") + " " + ok + "/" + total + " =====");
process.exit(ok===total?0:1);
