/* 結果頁微調回歸測試（Roy 2026-10-02 七項）
   ① 刪性格百科入口 ② 人格+完成時間文字喺分享卡上面 ③ 三掣配色
   ④ 結果頁強／弱項 icon ⑤ 配對列表型別 icon ⑥「立即開始」
   ⑦ 強弱項 icon 分配：同一型同一欄唔准重複 */
const fs=require("fs"), path=require("path");
const {JSDOM}=require("jsdom");
const REPO=path.resolve(__dirname,"../..");
const HTML=(function(){
  let html=fs.readFileSync(path.join(REPO,"index.html"),"utf8");
  return html.replace(/<script src="(https?:)?\/\/[^"]*"><\/script>/g,"")
             .replace(/<script src="([^"]+\.js)"><\/script>/g,(m,f)=>fs.existsSync(path.join(REPO,f))?"<script>\n"+fs.readFileSync(path.join(REPO,f),"utf8")+"\n</script>":"");
})();
const SRC=HTML;
let ok=0,total=0;
function chk(n,c,x){ total++; if(c)ok++; console.log((c?"✓":"✗")+" "+n+(c?"":"   <- "+(x||""))); }

// ───────── 一、靜態 ─────────
const rsec = SRC.slice(SRC.indexOf('<section id="result"'), SRC.indexOf('<section id="result"')+6000);
chk("★ ① 結果頁冇「性格百科」入口（冇 openHub()）", !/openHub\(\)/.test(rsec));
chk("★ ① 「看完整分析」入口保留", /goTypeFromResult\(\)/.test(rsec));
const iTa=rsec.indexOf('id="resultTaInline"'), iCard=rsec.indexOf('id="shareCardImg"'), iBtn=rsec.indexOf("downloadCard()");
chk("★ ② 次序＝人格／完成時間文字 → 分享卡 → 三掣",
    iTa>0 && iCard>iTa && iBtn>iCard, "ta="+iTa+" card="+iCard+" btn="+iBtn);
chk("★ ② 完成時間喺文字嗰組（卡片上面）", rsec.indexOf('id="finishTime"') < iCard);
const btn=[...rsec.matchAll(/onclick="(downloadCard|shareResult|shareLinkOnly)\(\)" class="([^"]+)"/g)].map(m=>m[2]);
chk("★ ③ 三粒掣**統一**同一個柔和風格 .share-btn（Roy 2026-10-02：三層次配色睇落怪）",
    btn.length===3 && btn.every(b=>/share-btn/.test(b)), btn.join(" | "));
chk("★ ③ 三粒掣唔再係金實心／白框混搭", !/btn-gold/.test(btn.join(" ")));
chk("★ ⑥ 底部掣改咗「立即開始」", /goPickVersion\(\)">立即開始</.test(rsec));
chk("★ ⑥ 冇殘留「再測一次」掣", !/>再測一次</.test(rsec));

// ───────── 二、真跑 renderResult ─────────
const dom=new JSDOM(HTML,{runScripts:"dangerously",pretendToBeVisual:true,url:"https://example.com/"});
const w=dom.window, d=w.document;
w.renderResult({mbti:"INFJ-T",pct:{EI:[62,38],SN:[71,29],TF:[44,56],JP:[58,42],TA:[35,65]},closeAxes:[]});
chk("★ ② 文字行顯示「INFJ · 敏感型」", d.getElementById("resultTaInline").innerText==="INFJ · 敏感型", d.getElementById("resultTaInline").innerText);
w.renderResult({mbti:"INFJ-A",pct:{EI:[62,38],SN:[71,29],TF:[44,56],JP:[58,42],TA:[70,30]},closeAxes:[]});
chk("★ ② -A 版顯示「INFJ · 自信型」", d.getElementById("resultTaInline").innerText==="INFJ · 自信型", d.getElementById("resultTaInline").innerText);
w.renderResult({mbti:"INFJ-T",pct:{EI:[62,38],SN:[71,29],TF:[44,56],JP:[58,42],TA:[35,65]},closeAxes:[]});
const pd=d.getElementById("personalityDetail");
const icos=pd.querySelectorAll("svg.pros-ico");
chk("★ ④ 結果頁強／弱項有 icon（≥8 個）", icos.length>=8, "得 "+icos.length);
chk("★ ④ icon 真係有圖形（唔係空 svg）", [...icos].every(s=>s.querySelectorAll("path,circle").length>0));
chk("★ ④ 冇殘留裸「＋／－」標記", pd.querySelectorAll(".pros-mark").length===0 && !/class="pros-item"><span class="pros-mark"/.test(pd.innerHTML));
chk("★ ④ 強項欄用 is-str、弱項欄用 is-wk（icon 先有正確顏色）",
    pd.querySelectorAll(".pros-box.is-str").length===1 && pd.querySelectorAll(".pros-box.is-wk").length===1);
const cmp=d.getElementById("compatibility");
const rows=[...cmp.querySelectorAll("div.flex-1")];            // 每行配對（唔可以撈百分比 div）
const icoRows=[...cmp.querySelectorAll(".cmp-ico")];
chk("★ ⑤ 配對列表每行都有型別 icon（"+rows.length+" 行）",
    rows.length>0 && rows.length===icoRows.length && rows.every(r=>r.querySelector(".cmp-ico svg")),
    "行數="+rows.length+" icon 數="+icoRows.length);
chk("★ ⑤ 型別 code 喺 icon 後面（唔係冇咗 code）",
    rows.every(r=>/^[EI][NS][TF][JP] · /.test(r.querySelector("div.font-bold span:last-child").textContent)));
chk("★ ⑤ icon 用返該型色卡主色（inline color）",
    icoRows.length>0 && icoRows.every(s=>/(^#[0-9A-Fa-f]{6}$)|(^rgb\()/.test(s.style.color||"")), icoRows.map(s=>s.style.color).slice(0,3).join(","));

// ───────── 三、icon 分配（真讀 data.js）─────────
const w2={}; (new Function("window", fs.readFileSync(path.join(REPO,"data.js"),"utf8")))(w2);
const F=w2.TYPES_FULL;
const vm=require("vm");
const ctx={window:{},console}; vm.createContext(ctx);
const _i=SRC.indexOf("window.PROS_ICO = {");
const _j=SRC.indexOf("window.prosIconHtml", _i);   // ⚠️ 一定要由 _i 之後搵（前面有使用點）
if(_j<0) throw new Error("搵唔到 prosIconHtml 定義");
vm.runInContext("(function(){"+SRC.slice(_i,_j)+"})()", ctx);
const ICO=ctx.window.PROS_ICO, MAP=ctx.window.PROS_WORD_ICO;
chk("★ ⑦ 12 個家族都有 svg path", Object.keys(ICO).length===12 && Object.values(ICO).every(p=>/<(path|circle)/.test(p)), Object.keys(ICO).join(","));
const allWords=[...new Set(Object.values(F).flatMap(f=>[...(f.strength||[]),...(f.weakness||[])]))];
const noMap=allWords.filter(x=>!MAP[x] && !MAP[x.replace(/\s+/g,"")]);
chk("★ ⑦ 每個性格詞都有對應 icon（唔會跌落 fallback）", noMap.length===0, noMap.join("／"));
let dup=[];
Object.keys(F).forEach(k=>{ ["strength","weakness"].forEach(f=>{ const ws=F[k][f]||[]; const fs2=ws.map(x=>MAP[x]||MAP[x.replace(/\s+/g,"")]); if(new Set(fs2).size!==fs2.length) dup.push(k+"/"+f+":"+ws.map((x,i)=>x+"="+fs2[i]).join(" ")); }); });
chk("★ ⑦ 同一型同一欄 5 個 icon 完全唔重複（Roy 要求）", dup.length===0, dup.join(" ; "));
const dist={}; allWords.forEach(x=>{ const f=MAP[x]||MAP[x.replace(/\s+/g,"")]; dist[f]=(dist[f]||0)+1; });
const vs=Object.values(dist);
chk("★ ⑦ 分佈平均（最多－最少 ≤ 12）", Math.max(...vs)-Math.min(...vs)<=12, "分佈 "+JSON.stringify(dist));

// ───────── 五、最底 CTA 發光燈泡（Roy 2026-10-02 #6）─────────
(function(){
  const hits = [SRC.indexOf('<p class="softbox-sub">想確認自己 MBTI 人格？</p>')];
  const nTx = (SRC.match(/想確認自己 MBTI 人格？/g) || []).length;
  chk("★ ⑥ 8 個「想確認自己 MBTI 人格？」CTA 全部都有發光燈泡喺上面",
      nTx >= 8 && (SRC.match(/<span class="cta-bulb">/g) || []).length === nTx,
      "文案 " + nTx + " 處 / 燈泡 " + ((SRC.match(/<span class="cta-bulb">/g) || []).length) + " 個");
  chk("★ ⑥ 燈泡喺文案**之前**（上面）",
      /class="cta-bulb">[\s\S]{0,700}?<\/span>\s*<p class="softbox-sub">想確認自己 MBTI 人格？<\/p>/.test(SRC));
  chk("★ ⑥ 燈泡有顏色（var(--gold)，dark 自動跟）",
      /\.cta-bulb\{[^}]*color:var\(--gold\)/.test(SRC));
  chk("★ ⑥ 燈泡有「發光」效果（drop-shadow glow，唔係硬邊）",
      /\.cta-bulb\{[^}]*filter:drop-shadow\([^)]*\)/.test(SRC));
  chk("★ ⑥ 燈泡置中（margin auto）＋同文字有距離",
      /\.cta-bulb\{[^}]*margin:0 auto [0-9]+px/.test(SRC));
  chk("★ ⑥ 燈泡畫嘅係燈泡＋光線（有 8 條 path：泡身／燈頭／頸／光線）",
      (function(){ const m=/<span class="cta-bulb"><svg[\s\S]*?<\/svg><\/span>/.exec(SRC); return !!m && (m[0].match(/<path/g)||[]).length >= 8; })());
  // ⚠️ 唔可以喺度重複 preflight 嘅全站 emoji 檢查：✓ ✗（U+2713/2717）本身喺 2600–27BF 範圍內、
//    但係全站**准許**嘅符號 → 寧願只驗燈泡嗰段 markup 冇 emoji（全站檢查交返 preflight，已係硬失敗）。
chk("★ ⑥ 燈泡係 SVG 畫嘅（唔用 emoji 字元）",
    (function(){ const m=/<span class="cta-bulb">([\s\S]*?)<\/span>/.exec(SRC);
      return !!m && /^<svg /.test(m[1].trim()) && !/[\u{1F000}-\u{1FAFF}]/u.test(m[1]); })());
  // 只准出現喺 CTA（唔可以亂咁加去其他卡）
  chk("★ ⑥ 燈泡只出現喺 CTA softbox 卡入面", (function(){
    const idxs = [...SRC.matchAll(/<span class="cta-bulb">/g)].map(m=>m.index);
    return idxs.every(i => SRC.slice(Math.max(0,i-200), i+300).includes("softbox"));
  })());
})();
const dom2=new JSDOM(HTML,{runScripts:"dangerously",pretendToBeVisual:true,url:"https://example.com/"});
const w2d=dom2.window, d2=dom2.window.document;
w2d.openType("INTJ","hub");
try{ w2d.setTypeTab("rel", true); }catch(e){}
const cmpHtml = d2.getElementById("typeCompat") ? d2.getElementById("typeCompat").innerHTML : "";
const cmpIcos = d2.querySelectorAll("#typeCompat .cmp-ico svg");
const cmpRows = d2.querySelectorAll("#typeCompat .flex-1");
chk("★ ⑤ 關係 tab「同邊種人最夾？」每行英文前面有型別 icon（"+cmpRows.length+" 行）",
    cmpRows.length > 0 && cmpIcos.length === cmpRows.length, "行=" + cmpRows.length + " icon=" + cmpIcos.length);
chk("★ ⑤ 關係 tab icon 用返該型色卡主色",
    [...cmpIcos].every(s => /(^#[0-9A-Fa-f]{6}$)|(^rgb\()/.test((s.closest(".cmp-ico")||{}).style ? s.closest(".cmp-ico").style.color : "")),
    [...d2.querySelectorAll("#typeCompat .cmp-ico")].map(s=>s.style.color).slice(0,3).join(","));

// ───────── 四、dark 規則位置 ─────────
const dk=SRC.slice(SRC.indexOf('id="dark-layer"'), SRC.indexOf('id="dark-layer"')+22000);
chk("★ ③ dark：share-btn 規則喺 #dark-layer 內（唔准落主 style）",
    /html\.dk \.share-btn\{/.test(dk));
// ⚠️ 主 style 本身有歷史遺留嘅 html.dk 規則（唔係今次改動）→ 只驗我新加嘅兩個 class 有冇落 #dark-layer
chk("★ ③ .share-btn 冇喺主 style 出現 dark 版",
    !/html\.dk \.share-btn\{/.test(SRC.slice(0, SRC.indexOf('id="dark-layer"'))));

console.log("\n===== 結果頁測試 "+ok+"/"+total+" =====");
process.exit(ok===total?0:1);
