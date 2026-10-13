#!/usr/bin/env node
// extract_bank.js — 由 index.html 抽出題庫，輸出純 JSON 到 stdout
// 用法：node tools/extract_bank.js [index.html 路徑]
// 有咗佢，Python（例如 tools/gen_voice.py）就唔需要自己 parse JS object literal。
const fs = require("fs");
const src = fs.readFileSync(process.argv[2] || "/opt/data/repos/hk-mbti/index.html", "utf8");

function grab(name){
  // 2026-10-13 修：只認「賦值定義」（window.X = ），唔可以認第一個提及 ——
  // 其他地方引用 window.QUESTIONS 會令 grab 由嗰度 parse，題庫靜靜讀成 0 條（question_audit 照樣報綠 = 假綠）。
  let i = -1, _from = 0;
  while((_from = src.indexOf("window." + name, _from)) >= 0){
    const _need = ("window." + name).length;
    let _k = _from + _need;
    while(_k < src.length && /\s/.test(src[_k])) _k++;
    if(src[_k] === "="){ i = _from; break; }
    _from += _need;
  }
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
