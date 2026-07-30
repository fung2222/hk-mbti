const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/window\.getTestVersionLabel\s*=\s*function\(version, totalQ\)\s*\{[\s\S]*?\n\};/);
assert(match, '分享卡需要 getTestVersionLabel 函式');

const context = { window: {} };
vm.createContext(context);
vm.runInContext(match[0], context);

assert.strictEqual(context.window.getTestVersionLabel('life', 60), '生活版 · 60題');
assert.strictEqual(context.window.getTestVersionLabel('advanced', 30), '進階版 · 30題');
assert.strictEqual(context.window.getTestVersionLabel('bb', 10), 'BB版 · 10題');
assert.strictEqual(context.window.getTestVersionLabel(undefined, undefined), '生活版 · 60題');

assert(/ctx\.fillText\(versionLabel,\s*680,\s*headerMidY \+ 16\)/.test(html), '分享卡右上角應畫出版本（垂直置中）');
assert(/headerMidY/.test(html), 'header 要用 midY 對齊');
assert(!html.includes('長按圖片可儲存'), '結果頁唔應再有長按提示');
console.log('PASS: 分享卡 header 對齊 + 版本標籤');
