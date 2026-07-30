// Test: history accordion — single-row style, only one item open at a time
const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync('index.html', 'utf8');

// Find loadHistory function start
const start = html.indexOf('window.loadHistory = function()');
assert(start > 0, 'loadHistory must exist');
const inner = html.slice(start, start + 3000);

// Each row must use the simple row style (no nested card box)
assert(/data-history-row="\${i}"/.test(inner), 'each row must use data-history-row attribute');

// Open state control
assert(/data-open/.test(inner), 'each row must track open state');

// openOne only-one-open helper must exist
assert(/window\._openHistoryOnly/.test(html) || /historyOnly|openHistoryRow/.test(html),
  'only-one-open helper must exist');

// Row template must contain who, code, ver, formatTimeAgo, view, del
assert(/\$\{who\}/.test(inner), 'must show who');
assert(/\$\{code\}/.test(inner), 'must show code');
assert(/\$\{ver\}版/.test(inner), 'must show version');
assert(/\$\{formatTimeAgo/.test(inner), 'must show timestamp');
assert(/viewHistoryResult/.test(inner), 'must have 查看 button');
assert(/armDeleteHistory/.test(inner), 'must have 刪除 button');

// No box-inside-box heavy border (the original `bg-white/85 rounded-xl p-3 border` must be gone)
assert(!/bg-white\/85 rounded-xl p-3 border border-gold/.test(inner), 'must drop heavy card style');

console.log('PASS: history accordion single-row only-one-open');