const fs = require("fs");
const src = fs.readFileSync("/opt/data/repos/hk-mbti/index.html", "utf8");
function grab(name){
  const i = src.indexOf("window." + name);
  const a = src.indexOf("[", i), o = src.indexOf("{", i);
  let start = (a >= 0 && (o < 0 || a < o)) ? a : o;
  let d = 0, q = null, j = start;
  for(; j < src.length; j++){ const c = src[j];
    if(q){ if(c === q && src[j-1] !== "\\") q = null; continue; }
    if(c === '"' || c === "'" || c === "`") q = c;
    else if(c === "[" || c === "{") d++;
    else if(c === "]" || c === "}"){ d--; if(!d) break; } }
  return eval("(" + src.slice(start, j+1) + ")");
}
const Q = grab("QUESTIONS"), ALTS = grab("Q_ALTS");
const show = n => { const q = Q[n-1];
  console.log(`#${n} [${q.d}] 「${q.t}」`);
  q.o.forEach(o => console.log(`   ${JSON.stringify(o.v)}  ${o.t}  (${o.t.length}字)`));
  console.log(`   ALT: ${JSON.stringify(ALTS[q.d]||[])}`);
};
console.log("===== #50 冇問號 ====="); show(50);
console.log("===== #12（求救標籤 / 場景太窄）====="); show(12);
console.log("===== 長短差大 ====="); [18,38,46,100,112].forEach(show);
console.log("===== 太短嘅 alt =====");
["S/N - 溫習","S/N - 學煮餸","S/N - 揀家電","T/F - 朋友失戀","S/N - 睇戲"].forEach(k => console.log(`「${k}」主：「${Q.find(q=>q.d===k)?.t}」／ALT：${JSON.stringify(ALTS[k]||[])}`));
console.log("===== 兩極「似唔好」標記掃描（P/N/E 邊，中性化後剩返嘅）=====");
const NEG = ["唔想","唔理","當睇唔到","當唔知","求其","亂","拖","遲","扮","逃避","冷","hea","頂到","能推就推","慢慢"];
Q.forEach((q,i) => {
  const ax = String(q.d).split(" - ")[0].replace(/\s/g,"");
  const P = {"E/I":["E","I"],"S/N":["S","N"],"T/F":["T","F"],"J/P":["J","P"],"T/A":["T","A"]}[ax];
  q.o.forEach(o => { const t = String(o.t);
    if(!NEG.some(w => t.includes(w))) return;
    const x = +(o.v[P[0]]||0), y = +(o.v[P[1]]||0);
    const side = x>y ? P[0] : (y>x ? P[1] : "中性");
    if(["P","N","I","A"].includes(side) || side === "中性"){
      console.log(`#${i+1} [${ax}] ${side}  「${t}」  (${JSON.stringify(o.v)})`);
    } });
});
