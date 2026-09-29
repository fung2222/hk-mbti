// 守門：4 個「網頁感」問題（Roy 2026-09-29 要求）
//   ① 斷網唔再出 Chrome 恐龍頁 → sw.js fallback offline.html
//   ② 全 app 唔可選字、冇藍閃、唔下拉重新載入（app 感）
//   ③ 長按唔彈瀏覽器「複製／搜尋」選單（輸入框同圖例外）
//   ④ 冇 target="_blank" 跳出 app
const fs = require('fs'), path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const REPO = path.resolve(__dirname, '../..');
let ok = 0, total = 0;
function chk(n, c, x) { total++; if (c) ok++; console.log((c ? '✓' : '✗') + ' ' + n + (c ? '' : '   <- ' + (x === undefined ? '' : x))); }
const read = f => fs.readFileSync(path.join(REPO, f), 'utf8');

const LOCKED = ['index.html', 'record.html', 'stats.html', 'tee.html', 'privacy.html']; // 要鎖選字 + 攔長按
const NO_PULL = ['record.html', 'stats.html', 'tee.html'];   // index 刻意唔鎖 overscroll（下拉要還原狀態）
const SEL = 'input,textarea,[contenteditable],img';          // 例外：輸入框同圖
const NOBLANK = LOCKED.concat(['offline.html']);

function stubCanvas(w) {
  const ctx = new Proxy({}, {
    get(k) { if (k === "canvas") return { width: 720, height: 1280 }; if (k === "measureText") return () => ({ width: 10 }); if (/Gradient/.test(String(k))) return () => ({ addColorStop() { } }); return () => { }; }, set() { return true; }
  });
  w.HTMLCanvasElement.prototype.getContext = () => ctx;
  w.HTMLCanvasElement.prototype.toDataURL = () => "data:image/jpeg;base64,x";
  w.Image = class { set src(v) { setTimeout(() => this.onload && this.onload(), 0); } };
}
function open(file) {
  const src = read(file);
  const html = src.replace(/<script src="(https?:)?\/\/[^"]*"><\/script>/g, '')
    .replace(/<script src="([^"]+\.js)"><\/script>/g, (m, f) => fs.existsSync(path.join(REPO, f))
      ? '<script>' + String.fromCharCode(10) + fs.readFileSync(path.join(REPO, f), 'utf8') + String.fromCharCode(10) + '</script>' : '');
  const vc = new VirtualConsole();
  vc.on('jsdomError', () => { });
  const dom = new JSDOM(html, {
    runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    url: 'https://fung2222.github.io/hk-mbti/' + file,
    beforeParse(w) { w.alert = () => { }; w.confirm = () => false; stubCanvas(w); }
  });
  return dom;
}

(async () => {
  // ---------- ① offline fallback ----------
  const off = read('offline.html');
  chk('offline.html 存在', off.length > 200);
  chk('offline.html 冇任何外部資源（斷網都要開得）', !/https?:\/\//.test(off.replace(/xmlns="[^"]*"/g, '')));
  chk('offline.html 有重新載入掣（reloadPage 有定義）', /function\s+reloadPage\s*\(/.test(off) && /onclick="reloadPage\(\)"/.test(off));

  const swRaw = read('sw.js');
  chk('sw.js precache 清單有 offline.html', /"\/hk-mbti\/offline\.html"/.test(swRaw));

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
  async function swGet(url) { let p; H.fetch({ request: navReq(url), respondWith: x => { p = x; } }); return await p; }
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

  // ---------- ②③ 靜態：全 app 一致 ----------
  for (const f of LOCKED) {
    const s = read(f);
    chk(f + ' 冇藍色 flash（tap-highlight 透明）', /-webkit-tap-highlight-color:transparent/.test(s));
    chk(f + ' 唔可以選字（user-select:none）', /user-select:none/.test(s));
    chk(f + ' 有 contextmenu 攔截 + 圖／輸入框例外', s.includes('addEventListener("contextmenu"') && s.includes('"' + SEL + '"'));
    chk(f + ' 輸入框仍然可以選字（user-select:text）', /input,textarea,\[contenteditable\]\{[^}]*user-select:text/.test(s));
  }
  for (const f of NO_PULL) {
    chk(f + ' 唔會下拉重新載入（overscroll-behavior-y:contain）', /overscroll-behavior-y:contain/.test(read(f)));
  }

  // ---------- ④ 冇外開 ----------
  for (const f of NOBLANK) {
    chk(f + ' 冇 target="_blank"（唔會跳出 app）', !/target="_blank"/.test(read(f)));
  }

  // ---------- 真跑：長按真係攔到 / 例外真係放行 ----------
  const CASES = [
    ['record.html', []],
    ['index.html', [['input', '#profileName']]],
    ['tee.html', []]
  ];
  for (const [file, extra] of CASES) {
    const dom = open(file);
    await new Promise(res => setTimeout(res, 1400));
    const w = dom.window, d = w.document;
    const fire = (el) => { const e = new w.Event('contextmenu', { bubbles: true, cancelable: true }); el.dispatchEvent(e); return e; };
    chk('真跑 ' + file + '：長按畫面 → 瀏覽器選單被攔住', fire(d.body).defaultPrevented === true);
    const img = d.createElement('img'); img.src = 'x.png'; d.body.appendChild(img);
    chk('真跑 ' + file + '：長按圖 → 唔攔（可以儲存／分享）', fire(img).defaultPrevented === false);
    for (const [label, sel] of extra) {
      const el = d.querySelector(sel);
      if (!el) { chk('真跑 ' + file + '：' + label + ' 存在', false, sel); continue; }
      chk('真跑 ' + file + '：長按 ' + label + ' → 唔攔（可以選字貼上）', fire(el).defaultPrevented === false);
    }
    w.close();
  }

  console.log('');
  console.log('===== ' + (ok === total ? '全部通過' : '有失敗') + '（' + ok + '/' + total + '） =====');
  process.exit(ok === total ? 0 : 1);
})();
