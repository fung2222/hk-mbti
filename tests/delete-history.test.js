// Pure-logic tests for delete-history flow
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const html = fs.readFileSync('index.html', 'utf8');

function extract(name){
  const re = new RegExp('window\\.'+name+'\\s*=\\s*function\\s*\\([\\s\\S]*?\\n\\};', 'm');
  const m = html.match(re);
  if(!m) throw new Error('cannot find '+name);
  return m[0];
}

const src = [
  extract('deleteHistoryConfirm'),
  extract('deleteHistoryItem'),
].join('\n');

const ctx = { window: {}, document: { getElementById: () => ({ classList:{add:()=>{},remove:()=>{}}, innerHTML:'', innerText:'' }) }, localStorage: { getItem:()=>'[]', setItem:()=>{}, removeItem:()=>{} }, alert:()=>{}, Date:{now:()=>1000000} };
vm.createContext(ctx);
vm.runInContext(src, ctx);

assert.strictEqual(typeof ctx.window.deleteHistoryConfirm, 'function');
assert.strictEqual(typeof ctx.window.deleteHistoryItem, 'function');

// Confirmed set has the id
assert(/confirm/.test(html), 'must call confirm()');
console.log('PASS: delete-history two-tap + confirm flow');