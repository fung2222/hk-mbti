// Test: history accordion — after version pick, single open, clear expanded layout
const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync('index.html', 'utf8');

// Position: history after versionList, before 港式場景
const v = html.indexOf('id="versionList"');
const uh = html.indexOf('id="userHistory"');
const scenes = html.indexOf('60 題涵蓋 3 個港式場景');
assert(v > 0 && uh > v && scenes > uh, 'history must sit below version pickers');

const start = html.indexOf('window.loadHistory = function()');
assert(start > 0, 'loadHistory must exist');
const inner = html.slice(start, start + 3500);

assert(/data-history-row="\$\{i\}"/.test(inner), 'each row must use data-history-row');
assert(/data-open/.test(inner), 'each row must track open state');
assert(/openHistoryRow/.test(html), 'openHistoryRow must exist');

const fnStart = html.indexOf('window.openHistoryRow = function');
const fnEnd = html.indexOf('window.loadHistory = function');
assert(fnStart > 0 && fnEnd > fnStart, 'openHistoryRow must come before loadHistory');
const fn = html.slice(fnStart, fnEnd);
const was = fn.indexOf('const wasOpen');
const closeAll = fn.indexOf('querySelectorAll');
assert(was > -1 && closeAll > was, 'wasOpen must be read before closing all rows');

assert(/\$\{who\}/.test(inner), 'must show who');
assert(/\$\{code\}/.test(inner), 'must show code');
assert(/\$\{ver\}/.test(inner), 'must show version');
assert(/formatTimeAgo/.test(inner), 'must show relative time');
assert(/viewHistoryResult/.test(inner), 'must have 查看 button');
assert(/armDeleteHistory/.test(inner), 'must have 刪除 button');
assert(/類型/.test(inner) && /版本/.test(inner) && /時間/.test(inner), 'expanded body must label fields');
assert(!/bg-white\/85 rounded-xl p-3 border border-gold/.test(inner), 'must drop heavy card style');

console.log('PASS: history accordion layout + toggle');
