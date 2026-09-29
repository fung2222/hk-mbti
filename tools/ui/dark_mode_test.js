// 守門：主題（日頭 / 黑夜）
//   ① 6 頁都有 dark layer（html.dk 主導）+ <head> 最前面有防閃 theme script
//   ② 鐵律：dark layer 只准改顏色（唔准 display / 尺寸 / 位置 / 動畫）
//   ③ 對比度：深底上嘅字色全部 ≥ 4.5:1（WCAG AA）
//   ④ 16 型色牌、分享卡 canvas 唔准被 dark layer 郁
//   ⑤ 真跑：主頁主題掣撳落去真係切換 + 記入 localStorage
const fs = require('fs'), path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const REPO = path.resolve(__dirname, '../..');
let ok = 0, total = 0;
function chk(n, c, x) { total++; if (c) ok++; console.log((c ? '✓' : '✗') + ' ' + n + (c ? '' : '   <- ' + (x === undefined ? '' : x))); }
const PAGES = ['index.html', 'record.html', 'stats.html', 'tee.html', 'privacy.html', 'offline.html'];
const read = f => fs.readFileSync(path.join(REPO, f), 'utf8');
const strip = css => css.replace(/\/\*[\s\S]*?\*\//g, '');

function lum(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
  const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
const cr = (a, b) => { const la = lum(a), lb = lum(b); return ((Math.max(la, lb) + .05) / (Math.min(la, lb) + .05)); };

const FORBIDDEN = /(^|[^-])(display|font-size|font-weight|font-family|line-height|letter-spacing|width|height|padding|margin|gap|position|inset|top|left|right|bottom|transform|transition|animation|aspect-ratio|z-index|overflow|visibility|flex)\s*:/;

function stubCanvas(w) {
  const ctx = new Proxy({}, {
    get(k) { if (k === "canvas") return { width: 720, height: 1280 }; if (k === "measureText") return () => ({ width: 10 }); if (/Gradient/.test(String(k))) return () => ({ addColorStop() { } }); return () => { }; }, set() { return true; }
  });
  w.HTMLCanvasElement.prototype.getContext = () => ctx;
  w.HTMLCanvasElement.prototype.toDataURL = () => "data:image/jpeg;base64,x";
  w.Image = class { set src(v) { setTimeout(() => this.onload && this.onload(), 0); } };
}

(async () => {
  const dark = {};
  for (const f of PAGES) {
    const s = read(f);
    const m = s.match(/<style id="dark-layer">([\s\S]*?)<\/style>/);
    dark[f] = m ? m[1] : '';
    chk(f + ' 有 dark layer', !!m);
    if (!m) continue;
    chk(f + ' dark layer 由 html.dk 主導', /html\.dk\{/.test(m[1]) && !/prefers-color-scheme/.test(m[1]));
    chk(f + ' 有 color-scheme:dark（令表單／滾動條跟埋）', /color-scheme:\s*dark/.test(m[1]));
    // 防閃：theme script 要喺 <head> 最前面（第一個 <style> 之前）就先set好 class
    const head = s.slice(0, s.indexOf('<style'));
    chk(f + ' head 內有防閃 theme script', /hkmbti_theme/.test(head) && /classList\.toggle\("dk"/.test(head));
  }

  // ② 只准改顏色
  for (const f of PAGES) {
    const css = strip(dark[f]);
    if (!css.trim()) continue;
    const rules = css.match(/[^{}]+\{[^{}]*\}/g) || [];
    const bad = [];
    for (const r of rules) {
      const body = r.slice(r.indexOf('{') + 1, r.lastIndexOf('}'));
      for (const decl of body.split(';')) {
        const prop = decl.split(':')[0];
        if (!prop.trim()) continue;
        if (FORBIDDEN.test(prop.trim() + ':')) bad.push(r.split('{')[0].trim() + ' → ' + prop.trim());
      }
    }
    chk(f + ' dark layer 只改顏色（冇排版／尺寸／動畫）', bad.length === 0, bad.slice(0, 3).join(' | '));
  }

  // ③ 對比度：抽出 dark layer 真正用過嘅字色去計（唔靠硬編碼清單）
  const BG = ['#12161C', '#181E26', '#1B2129', '#1F262F'];
  const fgSet = new Set();
  for (const f of PAGES) for (const m of strip(dark[f]).matchAll(/color\s*:\s*(#[0-9a-fA-F]{6})/g)) fgSet.add(m[1].toLowerCase());
  const FGS = [...fgSet].filter(h => lum(h) > 0.25); // 深字（金底上用）另外計
  const fails = [];
  for (const bg of BG) for (const fg of FGS) {
    const r = cr(bg, fg);
    if (r < 4.5) fails.push(bg + ' vs ' + fg + ' = ' + r.toFixed(2));
  }
  chk('深底上嘅 ' + FGS.length + ' 個字色全部 ≥ 4.5:1（WCAG AA）', fails.length === 0, fails.slice(0, 4).join(' | '));

  // ④ 品牌資產唔准郁（先剝註釋）
  for (const f of PAGES) {
    const css = strip(dark[f]);
    if (!css.trim()) continue;
    chk(f + ' dark layer 冇郁 16 型色牌', !/hub-type-card|hub-type-grid/.test(css));
    chk(f + ' dark layer 冇郁分享卡 canvas', !/canvas|cardImg|shareCard/.test(css));
  }

  // 金底按鈕上嘅字要夠對比
  for (const f of PAGES) {
    const css = strip(dark[f]);
    if (!css.trim()) continue;
    const rules = css.match(/[^{}]*\{[^{}]*background:\s*(?:var\(--gold\)|#D9B26A)[^{}]*\}/g) || [];
    const bad = [];
    for (const r of rules) {
      const c = (r.match(/color\s*:\s*(#[0-9a-fA-F]{6})/) || [])[1];
      if (c && cr('#D9B26A', c) < 4.5) bad.push(r.slice(0, 60) + ' = ' + cr('#D9B26A', c).toFixed(2));
    }
    chk(f + ' 金底按鈕字色夠對比（≥4.5:1）', bad.length === 0, bad.join(' | '));
  }

  // ⑤ 真跑：主頁主題掣（撳落去真係切換 + 記住）
  const src = read('index.html');
  const html = src.replace(/<script src="(https?:)?\/\/[^"]*"><\/script>/g, '')
    .replace(/<script src="([^"]+\.js)"><\/script>/g, (m, f) => fs.existsSync(path.join(REPO, f))
      ? '<script>' + String.fromCharCode(10) + fs.readFileSync(path.join(REPO, f), 'utf8') + String.fromCharCode(10) + '</script>' : '');
  const vc = new VirtualConsole(); vc.on('jsdomError', () => { });
  const dom = new JSDOM(html, {
    runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    url: 'https://fung2222.github.io/hk-mbti/', beforeParse(w) { w.alert = () => { }; w.confirm = () => false; stubCanvas(w); }
  });
  await new Promise(r => setTimeout(r, 1400));
  const w = dom.window, d = w.document;
  const btn = d.getElementById('themeBtn');
  chk('主頁右上（選單隔離）有主題掣', !!btn && !!btn.closest('.home-top-actions'));
  if (btn) {
    chk('掣用線條 SVG icon（唔係 emoji）', /<svg/.test(btn.innerHTML));
    const before = d.documentElement.classList.contains('dk');
    btn.click();
    const after = d.documentElement.classList.contains('dk');
    chk('撳一下真係切換主題', before !== after);
    let stored = null; try { stored = w.localStorage.getItem('hkmbti_theme'); } catch (e) { }
    chk('揀過會記入 localStorage', stored === (after ? 'dark' : 'light'), 'stored=' + stored);
    btn.click();
    chk('再撳會切換返（來回都得）', d.documentElement.classList.contains('dk') === before);
  }
  w.close();

  console.log('');
  console.log('===== ' + (ok === total ? '全部通過' : '有失敗') + '（' + ok + '/' + total + '） =====');
  process.exit(ok === total ? 0 : 1);
})();
