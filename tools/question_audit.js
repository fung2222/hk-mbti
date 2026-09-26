const fs = require("fs");
const src = fs.readFileSync(process.argv[2] || "/opt/data/repos/hk-mbti/index.html", "utf8");

function grab(name){
  const i = src.indexOf("window." + name);
  const a = src.indexOf("[", i), o = src.indexOf("{", i);
  let start = (a >= 0 && (o < 0 || a < o)) ? a : o;
  let d = 0, q = null, j = start;
  for(; j < src.length; j++){
    const c = src[j];
    if(q){ if(c === q && src[j-1] !== "\\") q = null; continue; }
    if(c === '"' || c === "'" || c === "`") q = c;
    else if(c === "[" || c === "{") d++;
    else if(c === "]" || c === "}"){ d--; if(!d) break; }
  }
  return eval("(" + src.slice(start, j+1) + ")");
}

const Q = grab("QUESTIONS");
const ALTS = grab("Q_ALTS");
const AX = { "E/I":["E","I"], "S/N":["S","N"], "T/F":["T","F"], "J/P":["J","P"], "T/A":["T","A"] };
const axisOf = d => { const h = String(d).split(" - ")[0].replace(/\s/g,""); return AX[h] ? h : ("?" + h); };

const out = { counts:{}, struct:[], scoring:[], grammar:[], lens:[], dup:[], altIssues:[] };
Q.forEach((q,i) => {
  const ax = axisOf(q.d); out.counts[ax] = (out.counts[ax]||0)+1;
  const [p1,p2] = AX[ax] || ["?","?"];
  const n = q.o.length; if(n !== 4) out.struct.push(`#${i+1} 選項數 ${n}`);
  let c1=0,c2=0,maxScore=0;
  const texts = q.o.map(o=>String(o.t));
  const scores = q.o.map(o=>{ const x=+(o.v[p1]||0), y=+(o.v[p2]||0); if(x>y)c1++; else if(y>x)c2++; maxScore=Math.max(maxScore,x,y); return x+"/"+y; });
  const s1 = q.o.reduce((t,o)=>t+ +(o.v[p1]||0),0), s2 = q.o.reduce((t,o)=>t+ +(o.v[p2]||0),0);
  if(c1 !== c2) out.struct.push(`#${i+1} [${ax}] 邊數 ${c1}:${c2}`);
  if(Math.abs(s1-s2) > 1) out.scoring.push(`#${i+1} [${ax}] 兩極總分 ${s1}:${s2}`);
  if(maxScore > 2) out.scoring.push(`#${i+1} 有 ${maxScore} 分選項`);
  const seen = {}; texts.forEach(t => { seen[t] = (seen[t]||0)+1; });
  Object.keys(seen).forEach(t => { if(seen[t] > 1) out.dup.push(`#${i+1} 重複選項「${t.slice(0,14)}」`); });
  const ss = {}; scores.forEach(s => ss[s]=(ss[s]||0)+1);
  Object.keys(ss).forEach(s => { if(ss[s] > 2) out.dup.push(`#${i+1} 同分選項 ${s} ×${ss[s]}`); });
  const L = texts.map(t=>t.length);
  const spread = Math.max(...L) - Math.min(...L);
  if(spread >= 14) out.lens.push(`#${i+1} 長短差 ${spread}（${Math.min(...L)}–${Math.max(...L)}）`);
  if(Math.max(...L) > 24) out.lens.push(`#${i+1} 超長 ${Math.max(...L)} 字`);
  const all = [q.t].concat(texts).join(" ");
  if(/[这为说还没个样时机东车们对错时间]/.test(all) && /[\u4e00-\u9fff]/.test(all)) {
    // 簡體字抽樣檢查（只針對常用簡體特徵字）
    const simp = ["这","为","说","还","没","个","样","时","东","车","们","对","错","经","与","体","后","发"];
    const hits = simp.filter(c => all.includes(c));
    if(hits.length) out.grammar.push(`#${i+1} 可能簡體：${hits.join("")}`);
  }
  if(!/？$/.test(String(q.t).trim())) out.grammar.push(`#${i+1} 問題冇「？」結尾`);
  if(/\s{2,}/.test(all)) out.grammar.push(`#${i+1} 連續空格`);
  if(/[\uff0c\uff01\uff1f]{2,}/.test(all)) out.grammar.push(`#${i+1} 重複標點`);
  const halfPunct = (all.match(/[a-zA-Z0-9][,.!?;:]/g)||[]); // 英文內標點正常，唔算
  if(/\S[，。！？]\S/.test(all) === false && false) {}
  const cnJoin = all.match(/[\u4e00-\u9fff][A-Za-z]|[A-Za-z][\u4e00-\u9fff]/g) || [];
  if(cnJoin.length) out.grammar.push(`#${i+1} 中英緊貼冇空格：${cnJoin.slice(0,2).join(" ")}`);
  // 否定詞用錯（2026-09-26 Roy 報「唔安」→ 應為「不安」）：
  // 書面雙字詞素唔可以用「唔」否定，要用「不」。加呢條之前六項審計係全綠但走漏咗 ✗
  const badNeg = (all.match(/唔安(?!樂)|唔滿(?!意)|唔足(?!夠)|唔穩(?!定)|唔確(?!定)/) || [])[0];
  if(badNeg) out.grammar.push(`#${i+1} 否定詞用錯（「唔」+ 書面詞素）：${badNeg}`);
});

// Q_ALTS 檢查
const qByD = {}; Q.forEach((q,i) => { const kk = q.k || q.d; (qByD[kk] = qByD[kk] || []).push(i); });
// d key 撞名 = Q_ALTS 撞變體（2026-09-26 Roy 撞到：IG 旅行題拎咗「心入面不安」嘅變體，題同選項對唔上）
const dDup = {}; Q.forEach(q => { dDup[q.d] = (dDup[q.d]||0)+1; });
Object.keys(dDup).forEach(k => { if(dDup[k] > 1){
  // 每題 alt 查 k || d：同一個 d 下面最多只可以有 1 題冇 k（嗰題用 d 嘅 alt pool），
  // 有 2 題或以上冇 k 就一定會撞變體
  const noK = Q.filter(q => q.d === k && !q.k).length;
  if(noK >= 2) out.altIssues.push(`d key「${k}」有 ${dDup[k]} 題共用，其中 ${noK} 題冇獨立 k → Q_ALTS 變體會撞`);
} });
let altCount = 0, altDupText = {};
Object.keys(ALTS).forEach(k => {
  const ax = axisOf(k);
  if(!AX[ax]) out.altIssues.push(`key「${k}」唔屬任何軸`);
  const prim = qByD[k];
  if(!prim) out.altIssues.push(`key「${k}」搵唔到對應題目`);
  const arr = ALTS[k];
  arr.forEach((t, j) => {
    altCount++;
    const s = String(t).trim();
    if(!/？$/.test(s)) out.altIssues.push(`${k}[${j+1}] 冇「？」結尾`);
    if(s.length < 8) out.altIssues.push(`${k}[${j+1}] 太短（${s.length}）`);
    const badNegAlt = (s.match(/唔安(?!樂)|唔滿(?!意)|唔足(?!夠)|唔穩(?!定)|唔確(?!定)/) || [])[0];
    if(badNegAlt) out.altIssues.push(`${k}[${j+1}] 否定詞用錯（「唔」+ 書面詞素）：${badNegAlt}`);
    if(s.length > 34) out.altIssues.push(`${k}[${j+1}] 太長（${s.length}）`);
    altDupText[s] = (altDupText[s]||0)+1;
    if(prim){
      const pq = String(Q[prim[0]].t).trim();
      // 同主問題共享 ≥2 個字（2-gram）就當同場景
      const grams = x => { const r = new Set(); for(let i=0;i<x.length-1;i++) r.add(x.slice(i,i+2)); return r; };
      const A = grams(s), B = grams(pq);
      let share = 0; A.forEach(g => { if(B.has(g)) share++; });
      const ratio = share / Math.max(1, Math.min(A.size, B.size));
      if(share < 2) out.altIssues.push(`${k}[${j+1}] 同主問題幾乎冇共同字（share=${share}）：「${s}」vs「${pq}」`);
      else if(ratio < 0.08) out.altIssues.push(`${k}[${j+1}] 共同字偏少（${(ratio*100).toFixed(1)}%）：${s}`);
    }
  });
});
Object.keys(altDupText).forEach(t => { if(altDupText[t] > 1) out.altIssues.push(`重複 alt 文字 ×${altDupText[t]}：「${t}」`); });

out.counts.total = Q.length;
out.counts.alts = altCount;
out.counts.altKeys = Object.keys(ALTS).length;
["struct","scoring","grammar","lens","dup","altIssues"].forEach(k => { if(!out[k].length) out[k] = ["（0）"]; });
["struct","scoring","grammar"].forEach(k => { out[k] = out[k].slice(0, 12); });
["lens","dup"].forEach(k => { out[k] = out[k].slice(0, 15); });
out.altIssues = out.altIssues.slice(0, 20);
console.log(JSON.stringify(out, null, 1));
