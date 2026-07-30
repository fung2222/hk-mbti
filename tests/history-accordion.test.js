// Test: history accordion must collapse by default and expand on toggle
const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync('index.html', 'utf8');

// History list collapsed by default
assert(/id="historyList"\s+class="space-y-2 hidden"/.test(html), 'historyList must be hidden by default');

// Toggle button present
assert(/id="historyToggle"/.test(html), 'historyToggle button must exist');

// toggleHistory function defined
assert(/window\.toggleHistory\s*=/.test(html), 'toggleHistory function must be defined');

// Extract loadHistory function body (greedy until the closing `};` followed by blank line)
const idx = html.indexOf('window.loadHistory = function()');
assert(idx > 0, 'loadHistory must exist');
// Take 2000 chars after the start, enough to cover the row template
const inner = html.slice(idx, idx + 2500);

// Each row template must include these tokens
assert(/\$\{who\}/.test(inner), 'each row must show who');
assert(/\$\{code\}/.test(inner), 'each row must show MBTI code');
assert(/\$\{ver\}版/.test(inner), 'each row must show version');
assert(/\$\{formatTimeAgo/.test(inner), 'each row must show timestamp');
assert(/viewHistoryResult/.test(inner), 'each row must have 查看 button');
assert(/armDeleteHistory/.test(inner), 'each row must have 刪除 button');

// Chevron must rotate on toggle
assert(/chev.*rotate/.test(html), 'chevron rotation must be wired');

console.log('PASS: history accordion structure verified');