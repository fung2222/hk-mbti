#!/usr/bin/env node
// extract_bank.js — 由 index.html 抽出題庫，輸出純 JSON 到 stdout
// 用法：node tools/extract_bank.js [index.html 路徑]
// 有咗佢，Python（例如 tools/gen_voice.py）就唔需要自己 parse JS object literal。
const fs = require("fs");
const src = fs.readFileSync(process.argv[2] || "/opt/data/repos/hk-mbti/index.html", "utf8");

function grab(name){
  const i = src.indexOf("window." + name);
  if(i < 0) throw new Error("搵唔到 window." + name);
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
  return eval("(" + src.slice(start, j + 1) + ")");
}

const out = { questions: grab("QUESTIONS") };
try { out.alts = grab("Q_ALTS"); } catch(e){ out.alts = {}; }
process.stdout.write(JSON.stringify(out));
