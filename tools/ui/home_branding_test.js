/* 首頁品牌層級回歸測試（2026-11-10）
   手機頂欄只留 logo；中間 MBTI 係唯一主標題，避免兩個大字互相搶焦點。 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const REPO = path.resolve(__dirname, '../..');
const raw = fs.readFileSync(path.join(REPO, 'index.html'), 'utf8');
const dom = new JSDOM(raw);
const d = dom.window.document;
let ok = 0, total = 0;
function chk(name, condition, detail = '') {
  total++;
  if (condition) ok++;
  console.log((condition ? '✓ ' : '✗ ') + name + (condition ? '' : ' <- ' + detail));
}

const home = d.querySelector('#home');
const link = d.querySelector('#homeLogoLink');
const title = d.querySelector('.home-hero-mbti');
const logo = link && link.querySelector('img');

chk('首頁同 logo 連結存在', !!(home && link && logo));
chk('logo 連結有完整無障礙名稱', link && link.getAttribute('aria-label') === '港式 MBTI 主頁');
chk('頂欄冇重複顯示「港式 MBTI」文字', link && link.textContent.trim() === '', link && link.textContent.trim());
chk('頂欄文字唔再係另一個 H1', link && !link.querySelector('h1'));
chk('logo 圖片交俾連結命名，避免讀屏重複', logo && logo.getAttribute('alt') === '');
chk('中間大 MBTI 係真正 H1', title && title.tagName === 'H1', title && title.tagName);
chk('中間 H1 保留完整產品無障礙名稱', title && title.getAttribute('aria-label') === '港式 MBTI');
chk('中間可見標題仍然係 MBTI', title && title.textContent.trim() === 'MBTI');
chk('主頁只有一個 H1', home && home.querySelectorAll('h1').length === 1, home && home.querySelectorAll('h1').length);
chk('舊 .home-hero h1 字級 override 已移除', !raw.includes('.home-hero h1{'));
chk('logo 連結保留 44px 觸控範圍', /#homeLogoLink\{padding:4px;margin:-4px/.test(raw));
chk('logo 連結有清晰鍵盤焦點', /#homeLogoLink:focus-visible\{outline:3px solid var\(--gold\)/.test(raw));
chk('桌面導覽保留正常品牌名', d.querySelector('.dt-nav-brand span') && d.querySelector('.dt-nav-brand span').textContent.trim() === '港式 MBTI');

console.log(`\n===== ${ok === total ? '全部通過' : '有失敗'} ${ok}/${total} =====`);
process.exit(ok === total ? 0 : 1);
