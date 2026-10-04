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
chk("★ D 卡唔准落喺「與你的朋友配對」區入面（Roy 2026-10-04 實報個 bug）",
rsec.indexOf('id="personalReport"')>0 && rsec.indexOf('id="personalReport"') < rsec.indexOf('與你的朋友配對</div>')
&& rsec.indexOf('與你的朋友配對</div>') < rsec.indexOf('id="compatibility"'),
"pr="+rsec.indexOf('id="personalReport"')+" 配對標題="+rsec.indexOf('與你的朋友配對</div>')+" comp="+rsec.indexOf('id="compatibility"'));
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
chk("★ 免費版：標題係「你嘅個人化報告」（冇「完整版」字眼）", /你嘅個人化報告/.test(locked) && !/完整版/.test(locked));
chk("★ 免費版：已經冇「解鎖完整版」掣（2026-10-04 開放免費）", !/解鎖完整版/.test(locked) && !/unlockFull\(\)/.test(locked));
chk("★ 免費版：直接出齊內容（3 相似型 ＋ 3 盲點），唔再鎖", (locked.match(/pr-sim-c/g)||[]).length===3 && (locked.match(/pr-note/g)||[]).length===3);

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
chk("★ 已解鎖：D 卡有 3 條盲點段（5 條軸已改為免費，唔喺呢度）", notes.length===3, notes.length);
chk("★ 已解鎖：盲點數量 = 3（獨立段落）", (full1.match(/你嘅 3 個盲點/g)||[]).length===1);
chk("★ 已解鎖：D 卡唔再出軸 %（已移去免費卡）", !/你 5 條軸各自代表咩/.test(full1));
chk("★ 免費卡軸 % 同 r.pct 一致（唔自創數字）",
    /40%/.test(d.getElementById("personalityDetail").innerHTML) && /65%/.test(d.getElementById("personalityDetail").innerHTML));

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


// ───────── 四、舊紀錄（修復前冇 pct）：同型頂住、唔同型唔准亂套 ─────────
w.localStorage.clear();
w.localStorage.setItem(w.TIER_KEY, "full");
w.renderResult(JSON.parse(JSON.stringify(R)));            // 令 _lastScoreObj = 今次（INTJ）
w.localStorage.setItem("hkmbti_history", JSON.stringify([{id:"old1", mbti:"INTJ-T", timestamp:Date.now(), version:"life"}]));
w.viewHistoryResult("0");
const pOld = d.getElementById("personalityDetail").innerHTML;
chk("★ 舊紀錄（冇 pct）＋同型 → 「傾向程度」用最後一次分數頂住", /你嘅傾向程度/.test(pOld) && /40%/.test(pOld) && /65%/.test(pOld));
chk("★ 舊紀錄（冇 pct）＋同型 → D 卡都出返", /pr-sim-c/.test(d.getElementById("personalReport").innerHTML));
chk("★ 舊紀錄（冇 pct）＋同型 → 唔會出「修復前舊紀錄」說明", !/修復前嘅舊紀錄/.test(pOld));

w.localStorage.setItem("hkmbti_history", JSON.stringify([{id:"old2", mbti:"ENFP-A", timestamp:Date.now(), version:"life"}]));
w.viewHistoryResult("0");
const pOther = d.getElementById("personalityDetail").innerHTML;
const dOther = d.getElementById("personalReport").innerHTML;
chk("★ 舊紀錄（冇 pct）＋唔同型 → 唔准亂套 %（冇「你嘅傾向程度」）", !/你嘅傾向程度/.test(pOther));
chk("★ 舊紀錄（冇 pct）＋唔同型 → 出「修復前舊紀錄」說明句", /修復前嘅舊紀錄/.test(pOther));
chk("★ 舊紀錄（冇 pct）＋唔同型 → D 卡唔會殘留上一個型嘅內容", !/pr-sim-c/.test(dOther), dOther.slice(0, 80));


// ───────── 五、重開 app（記憶體清空）：靠 localStorage 都要頂得住 ─────────
chk("★ 有持久化最近分數（hkmbti_last_score）＋ lastScoreObj() helper",
    RAW.includes("hkmbti_last_score") && RAW.includes("window.lastScoreObj = function"));
chk("★ 用舊紀錄分數時有標明「同型參考」（唔冒充嗰次紀錄嘅數字）",
    RAW.includes("同型參考：以下係你最近一次同型測試嘅維度分數"));
w.localStorage.clear();
w.localStorage.setItem(w.TIER_KEY, "full");
w.renderResult(JSON.parse(JSON.stringify(R)));
w.lastResult = R.mbti;
w.saveResult();                                        // 產生 hkmbti_last_score
w._lastScoreObj = null;                                // 模擬「完全閂 app 再開」：記憶體清空
w.localStorage.setItem("hkmbti_history", JSON.stringify([{id:"old3", mbti:"INTJ-T", timestamp:Date.now(), version:"life"}]));
w.viewHistoryResult("0");
const pR = d.getElementById("personalityDetail").innerHTML;
chk("★ 重開 app 後開舊紀錄 → 靠 localStorage 都出返「傾向程度」", /你嘅傾向程度/.test(pR) && /40%/.test(pR));
chk("★ 重開 app 後 → 有「同型參考」註腳（唔係靜靜當係嗰次）", /同型參考/.test(pR));
chk("★ 重開 app 後 → D 卡都有返", /pr-sim-c/.test(d.getElementById("personalReport").innerHTML));


// ───────── 六、2026-10-04 定位：維度 % 同「呢條軸代表咩」一律免費 ─────────
w.localStorage.clear();
w.renderResult(JSON.parse(JSON.stringify(R)));     // 免費版（未解鎖）
const pdFree = d.getElementById("personalityDetail").innerHTML;
chk("★ 免費版：5 條軸解釋全部出齊（唔止百分比）",
    /能量主要向內/.test(pdFree) && /你習慣跳去/.test(pdFree) && /邊個做法最合理/.test(pdFree) && /你鍾意有計劃/.test(pdFree) && /情緒接收強/.test(pdFree));
chk("★ 冇「全部免費開放」呢句宣傳（Roy：唔要）", !/全部免費開放/.test(pdFree) && !RAW.includes("全部免費開放"));
chk("★ 免費版都有齊個人化報告（已開放免費）", /pr-sim-c/.test(d.getElementById("personalReport").innerHTML));
w.localStorage.setItem(w.TIER_KEY, "full");
w.renderResult(JSON.parse(JSON.stringify(R)));
const dFull = d.getElementById("personalReport").innerHTML;
chk("★ 完整版 D 卡：唔再重複 5 條軸（已經免費）", !/pr-axis/.test(dFull));
chk("★ D 卡內容＝最似 3 型 ＋ 3 盲點",
    (dFull.match(/pr-sim-c/g) || []).length === 3 && (dFull.match(/pr-note/g) || []).length === 3);
w.localStorage.removeItem(w.TIER_KEY);
w.renderResult(JSON.parse(JSON.stringify(R)));
chk("★ 收費點仍然係 9 章深入分析（冇被拆走）", RAW.includes('i > 0 && window.getTier() !== "full"'));


// ───────── 七、S/N 等「接近中間」提示要放喺「你嘅傾向程度」卡（Roy 2026-10-04 報放錯位置）─────────
w.localStorage.clear();
w.renderResult({mbti:"INTJ-T", pct:{EI:[40,60], SN:[51,49], TF:[70,30], JP:[80,20], TA:[62,38]}, closeAxes:["S/N"], score:{}, version:"life", totalQ:60});
const pdPos = d.getElementById("personalityDetail").innerHTML;
chk("★ 「軸接近中間」提示真係出咗", /軸接近中間/.test(pdPos));
chk("★ 提示放喺「你嘅傾向程度」卡（即喺「性格刻度」之前）",
    pdPos.indexOf("軸接近中間") > 0 && pdPos.indexOf("軸接近中間") < pdPos.indexOf("性格刻度"),
    "note=" + pdPos.indexOf("軸接近中間") + " 刻度=" + pdPos.indexOf("性格刻度"));
chk("★ 提示喺 5 條軸下面（唔會插喺軸上面）",
    pdPos.indexOf("軸接近中間") > pdPos.indexOf("T 自信") && pdPos.indexOf("軸接近中間") < pdPos.indexOf("計分方法同限制"));
chk("★ 性格刻度嗰組唔再出現提示", pdPos.indexOf("性格刻度") > 0 && pdPos.slice(pdPos.indexOf("性格刻度")).indexOf("軸接近中間") === -1);

console.log("\n===== " + (ok===total ? "全部通過" : "有失敗") + " " + ok + "/" + total + " =====");
process.exit(ok===total?0:1);
