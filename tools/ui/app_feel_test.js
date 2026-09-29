// 守門：4 個「網頁感」問題（Roy 2026-09-29 要求）
//   ① 斷網唔再出 Chrome 恐龍頁 → sw.js fallback offline.html
//   ② record / stats / tee 有 app 感防護（唔可選字、冇藍閃、唔下拉重新載入）
//   ③ 長按唔彈瀏覽器「複製／搜尋」選單（輸入框例外）
//   ④ 冇 target="_blank" 跳出 app
const fs = require('fs'), path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const REPO = path.resolve(__dirname, '../..');
let ok = 0, total = 0;
function chk(n, c, x) { total++; if (c) ok++; console.log((c ? '✓' : '✗') + ' ' + n + (c ? '' : '   <- ' + (x === undefined ? '' : x))); }
const read = f => fs.readFileSync(path.join(REPO, f), 'utf8');
const PAGES = ['record.html', 'stats.html', 'tee.html'];

(async () => {
  // ---------- ① offline fallback ----------
  const off = read('offline.html');
  chk('offline.html 存在', off.length > 200);
  chk('offline.html 冇任何外部資源（斷網都要開得）', !/https?:\/\//.test(off.replace(/xmlns="[^"]*"/g, '')));
  chk('offline.html 有重新載入掣（reloadPage 有定義）', /function\s+reloadPage\s*\(/.test(off) && /onclick="reloadPage\(\)"/.test(off));

  const swRaw = read('sw.js');
  chk('sw.js precache 清單有 offline.html', /"\/hk-mbti\/offline\.html"/.test(swRaw));

  // 真跑 sw.js（mock self / caches / fetch）
  const H = {}, cacheStore = new Map();
  global.self = { addEventListener: (t, fn) => { H[t] = fn; }, skipWaiting() { }, clients: { claim() { } }, location: { origin: 'https://fung2222.github.io' } };
  global.caches = {
    open: async () => ({ addAll: async () => { }, put: async () => { } }),
    keys: async () => [], delete: async () => { },
    match: async (r) => {
      const k = typeof r === 'string' ? r : r.url;
      return cacheStore.get(k) || cacheStore.get(k.replace('https://fung2222.github.io', ''));
    }
  };
  global.fetch = async () => { throw new Error('offline'); };
  new Function('self', 'caches', 'fetch', 'Response', 'URL', swRaw)(global.self, global.caches, global.fetch, Response, URL);

  const navReq = (u) => ({ method: 'GET', url: u, mode: 'navigate', headers: { get: () => 'text/html' } });
  async function swGet(url) {
    let p; H.fetch({ request: navReq(url), respondWith: x => { p = x; } });
    return await p;
  }
  cacheStore.clear();
  cacheStore.set('/hk-mbti/offline.html', new Response('<h1>而家連唔到網絡</h1>', { status: 200 }));
  let r = await swGet('https://fung2222.github.io/hk-mbti/');
  chk('斷網開首頁 → 出 offline 頁（唔再白屏／恐龍頁）', /連唔到網絡/.test(await r.text()), r && r.status);

  cacheStore.clear();
  cacheStore.set('/hk-mbti/record.html', new Response('<h1>我的紀錄</h1>', { status: 200 }));
  r = await swGet('https://fung2222.github.io/hk-mbti/record.html');
  chk('斷網但 cache 有嗰頁 → 照出嗰頁', /我的紀錄/.test(await r.text()));

  cacheStore.clear();
  r = await swGet('https://fung2222.github.io/hk-mbti/');
  chk('cache 全空 → 503 有文字提示（唔係空白）', r.status === 503 && /連唔到網絡/.test(await r.text()));

  // ---------- ②③ app 感防護 ----------
  for (const f of PAGES) {
    const s = read(f);
    chk(f + ' 冇藍色 flash（tap-highlight 透明）', /-webkit-tap-highlight-color:transparent/.test(s));
    chk(f + ' 唔可以選字（user-select:none）', /user-select:none/.test(s));
    chk(f + ' 唔會下拉重新載入（overscroll-behavior-y:contain）', /overscroll-behavior-y:contain/.test(s));
    chk(f + ' 有 contextmenu 攔截', /addEventListener\("contextmenu"/.test(s));
  }

  // ---------- ④ 冇外開 ----------
  for (const f of ['index.html', 'privacy.html', 'offline.html'].concat(PAGES)) {
    chk(f + ' 冇 target="_blank"（唔會跳出 app）', !/target="_blank"/.test(read(f)));
  }

  // ---------- ③ 真跑：撳落去有冇真攔到 ----------
  const vc = new VirtualConsole();
  vc.on('jsdomError', () => { });
  const dom = new JSDOM(read('record.html'), {
    runScripts: 'dangerously', pretendToBeVisual: true,
    url: 'https://fung2222.github.io/hk-mbti/record.html', virtualConsole: vc
  });
  await new Promise(res => setTimeout(res, 300));
  const w = dom.window, d = w.document;
  const fire = (el) => { const e = new w.Event('contextmenu', { bubbles: true, cancelable: true }); el.dispatchEvent(e); return e; };
  const onBody = fire(d.body);
  chk('真跑：長按畫面 → 瀏覽器選單被攔住', onBody.defaultPrevented === true);
  const inp = d.createElement('input'); d.body.appendChild(inp);
  const onInput = fire(inp);
  chk('真跑：長按輸入框 → 唔攔（仍然可以貼上／選字）', onInput.defaultPrevented === false);

  console.log('');
  console.log('===== ' + (ok === total ? '全部通過' : '有失敗') + '（' + ok + '/' + total + '） =====');
  process.exit(ok === total ? 0 : 1);
})();
