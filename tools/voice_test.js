#!/usr/bin/env node
/**
 * voice_test.js — 朗讀（audio + fallback）離線測試
 *
 * 因為 host 冇瀏覽器（見 apps profile：唔可以開 headless browser），
 * 呢個 script 用 stub 模擬 DOM／audio／speechSynthesis，真係行 index.html 裏面
 * 抽出嚟嘅朗讀邏輯，而唔係只做 grep。
 *
 * 用法：node tools/voice_test.js
 * 離開碼：0 = 全部過；1 = 有問題（會列出）
 *
 * 驗嘅嘢：
 *   1. voice-map.js 覆蓋率：每條題目、每個 Q_ALTS 變體、每個選項都有音檔 key
 *   2. 每個 map 指向嘅檔真係存在喺 repo，而且 > 1KB
 *   3. speakQuestionSet 讀嘅次序：題目 → A → B → C → D，src 正確
 *   4. 缺 key 時跌返 speechSynthesis（唔會靜）
 *   5. stopQuestionVoice 會清空 queue 同停 audio
 *   6. VOICE_ON 唔係開嘅時候，完全唔會播
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const REPO = path.resolve(__dirname, "..");
const fail = [];
const ok = [];

// ---------- 題庫（同 buildDeck 一樣嘅變體邏輯）----------
function grab(src, name){
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
  return eval("(" + src.slice(start, j + 1) + ")");
}

const html = fs.readFileSync(path.join(REPO, "index.html"), "utf8");
const QUESTIONS = grab(html, "QUESTIONS");
const Q_ALTS = grab(html, "Q_ALTS");

// ---------- 由 index.html 抽出朗讀邏輯，喺 vm 裏面行 ----------
const startTag = "// ---- 朗讀（v2 聲）";
const bi = html.indexOf(startTag);
const bj = html.indexOf("window.syncVoiceBtn = function(){", bi);
if(bi < 0 || bj < 0) { console.error("✗ 搵唔到 index.html 裏面嘅朗讀 block"); process.exit(1); }
const block = html.slice(bi, bj);

function makeAudio(){
  const a = {
    src: "", paused: true, listeners: {}, attrs: {},
    addEventListener(t, fn){ (a.listeners[t] = a.listeners[t] || []).push(fn); },
    setAttribute(k, v){ a.attrs[k] = v; },
    play(){ a.paused = false; a.played.push(a.src); return Promise.resolve(); },
    pause(){ a.paused = true; a.pausedCount++; },
    fire(t){ (a.listeners[t] || []).forEach(fn => fn()); },
    played: [], pausedCount: 0,
  };
  return a;
}
let audio = null;
const utterances = [];
const sandbox = {
  console,
  document: { createElement(){ audio = makeAudio(); return audio; }, body: { appendChild(){} } },
  SpeechSynthesisUtterance: function(t){ this.text = t; },
  speechSynthesis: {
    cancel(){ sandbox._cancelled++; },
    speak(u){ utterances.push(u.text); if(u.onend) u.onend(); },
  },
  pickYueVoice: () => null,
  fetch: () => Promise.resolve(),
  _cancelled: 0,
  $: () => null,
  state: { deck: null, idx: 0 },
};
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(block, sandbox);
vm.runInContext(fs.readFileSync(path.join(REPO, "voice-map.js"), "utf8"), sandbox);

const Q_AUDIO = sandbox.Q_AUDIO || {};
const O_AUDIO = sandbox.O_AUDIO || {};
const L_AUDIO = sandbox.L_AUDIO || {};

// ---------- 1. 覆蓋率 ----------
let needQ = 0, missQ = [], needO = 0, missO = [];
QUESTIONS.forEach(q => {
  const pool = [q.t].concat(Q_ALTS[q.k || q.d] || []);
  pool.forEach(t => { needQ++; if(!Q_AUDIO[t]) missQ.push(t); });
  q.o.forEach(o => { needO++; if(!O_AUDIO[o.t]) missO.push(o.t); });
});
if(missQ.length === 0) ok.push(`題目覆蓋 ${needQ}/${needQ}（含 Q_ALTS 變體）`);
else fail.push(`題目音檔缺 ${missQ.length} 條，例如「${missQ[0]}」`);
if(missO.length === 0) ok.push(`選項覆蓋 ${needO}/${needO}`);
else fail.push(`選項音檔缺 ${missO.length} 條，例如「${missO[0]}」`);
const missL = ["A","B","C","D"].filter(l => !L_AUDIO[l]);
if(missL.length === 0) ok.push("字母音檔齊 A/B/C/D");
else fail.push(`字母音檔缺 ${missL.join(",")}`);

// ---------- 2. 檔案存在 + 大細 ----------
let files = 0, bad = [];
Object.keys(Q_AUDIO).forEach(k => {
  const p = path.join(REPO, Q_AUDIO[k]);
  files++;
  if(!fs.existsSync(p)) bad.push(Q_AUDIO[k]);
  else if(fs.statSync(p).size < 1024) bad.push(Q_AUDIO[k] + "（太細）");
});
Object.keys(O_AUDIO).forEach(k => {
  const p = path.join(REPO, O_AUDIO[k]);
  files++;
  if(!fs.existsSync(p)) bad.push(O_AUDIO[k]);
  else if(fs.statSync(p).size < 1024) bad.push(O_AUDIO[k] + "（太細）");
});
Object.keys(L_AUDIO).forEach(k => {
  const p = path.join(REPO, L_AUDIO[k]);
  files++;
  if(!fs.existsSync(p)) bad.push(L_AUDIO[k]);
  else if(fs.statSync(p).size < 200) bad.push(L_AUDIO[k] + "（太細）");
});
if(bad.length === 0) ok.push(`map 指向嘅 ${files} 個音檔全部存在且 > 1KB`);
else fail.push(`${bad.length} 個音檔有問題，例如 ${bad[0]}`);

// ---------- 3. 播放次序 ----------
function playAll(q){
  sandbox.window.VOICE_ON = true;
  vm.runInContext("window.VOICE_QUEUE = [];", sandbox);
  sandbox.speakQuestionSet(q);
  const n = (q.t ? 1 : 0) + q.o.length * 2;
  const seq = [audio.src];
  for(let i = 0; i < n - 1; i++){ audio.fire("ended"); seq.push(audio.src); }
  return seq;
}
function expectSeq(q){
  return [Q_AUDIO[q.t]].concat(q.o.reduce((acc, o) => acc.concat([L_AUDIO[o.l], O_AUDIO[o.t]]), []));
}

const q0 = QUESTIONS[0];
let got = playAll(q0);
let expect = expectSeq(q0);
if(JSON.stringify(got) === JSON.stringify(expect)) ok.push(`次序正確：題目 + 4×(字母+選項)，共 ${got.length} 條`);
else fail.push(`播放次序唔對：\n    expect ${JSON.stringify(expect)}\n    got    ${JSON.stringify(got)}`);

// 🔴 迴歸測試（2026-09-26 Roy 報「B 讀咗 C」）：buildDeck 會打亂選項再重派 A/B/C/D，
// 字母一定要跟「重派之後」嘅 o.l，唔可以係題庫原本嘅字母。
const relabelled = {
  t: q0.t,
  o: q0.o.slice().reverse().map((o, i) => ({ l: String.fromCharCode(65 + i), t: o.t })),
};
got = playAll(relabelled);
expect = expectSeq(relabelled);
if(JSON.stringify(got) === JSON.stringify(expect)){
  ok.push("選項打亂 + 重派字母之後，字母依然對得住（B/C 交叉迴歸測試）");
}else{
  fail.push(`重派字母之後字母唔對（就係 Roy 撞到嘅 bug）：\n    expect ${JSON.stringify(expect)}\n    got    ${JSON.stringify(got)}`);
}
if(sandbox.VOICE_QUEUE.length !== 0) fail.push("播完之後 queue 未清空");
else ok.push("播完之後 queue 自動清空");

// ---------- 4. 缺 key → fallback ----------
sandbox.window.VOICE_ON = true;
utterances.length = 0;
sandbox.speakQuestionSet({ t: "呢條題目一定冇音檔嘅", o: [] });
if(utterances.length === 1 && utterances[0] === "呢條題目一定冇音檔嘅")
  ok.push("冇音檔嘅文字會 fallback 落 speechSynthesis");
else fail.push(`fallback 冇觸發（utterances=${JSON.stringify(utterances)}）`);

// ---------- 5. stop 清 queue + 停 audio ----------
sandbox.window.VOICE_ON = true;
sandbox.speakQuestionSet(q0);
sandbox.stopQuestionVoice();
if(sandbox.VOICE_QUEUE.length === 0 && audio.paused && sandbox._cancelled > 0)
  ok.push("stopQuestionVoice 清空 queue、停 audio、取消 speechSynthesis");
else fail.push("stopQuestionVoice 冇完全停低");

// ---------- 6. VOICE_ON = false 唔應該播 ----------
sandbox.window.VOICE_ON = false;
utterances.length = 0;
audio.played.length = 0;
sandbox.speakQuestionSet(q0);
if(utterances.length === 0 && audio.played.length === 0) ok.push("朗讀關：完全唔會播");
else fail.push("朗讀關但仍然播咗嘢");

// ---------- 報告 ----------
console.log("===== 朗讀離線測試 =====");
ok.forEach(o => console.log("  ✓", o));
fail.forEach(f => console.log("  ✗", f));
console.log("===== %s =====", fail.length ? `${fail.length} 項有問題` : `全部通過（${ok.length} 項）`);
process.exit(fail.length ? 1 : 0);
