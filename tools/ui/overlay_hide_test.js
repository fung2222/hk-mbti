// 浮層隱藏守門（2026-10-13 真機驗收：離線下拉更新出現「空白彈窗、撳唔到」）
// 血例：.hidden 只喺 tailwind.css 定義 → 一旦 tailwind.css 攞唔到（離線／cache 部分失敗），
//       .ad-overlay／.cd-overlay（inline 有 display:flex）會自己現身，而掣又未綁 → 只可強制關 app。
// 守門：① 每個有 link tailwind.css 嘅頁面，自己嘅 <style> 一定要有 .hidden{display:none}
//       ② 對話框要 inline display:none（唔靠任何外部 CSS）
//       ③ 對話框嘅掣要「載入時一次綁定」，唔靠 _adResolve 都關得
const fs=require('fs'), path=require('path');
const REPO=path.resolve(__dirname,'../..');
let ok=0,total=0; function chk(n,c,x){total++; if(c)ok++; console.log((c?'✓':'✗')+' '+n+(c?'':'   <- '+(x||'')));}
const pages=fs.readdirSync(REPO).filter(f=>f.endsWith('.html'));
const withTw=pages.filter(f=>fs.readFileSync(path.join(REPO,f),'utf8').includes('tailwind.css'));
chk('有 link tailwind.css 嘅頁面 ≥ 4 個', withTw.length>=4, withTw.join(','));
const missing=withTw.filter(f=>!/\n\.hidden\{display:none\}/.test(fs.readFileSync(path.join(REPO,f),'utf8')));
chk('★ 每頁自己都有 .hidden{display:none}（唔靠外部 CSS）', missing.length===0, missing.join(','));
const dlgPages=['index.html','record.html'];
dlgPages.forEach(f=>{
  const s=fs.readFileSync(path.join(REPO,f),'utf8');
  chk('★ '+f+'：#appDialog 有 inline display:none', /id="appDialog"[^>]*style="display:none"/.test(s));
  chk('★ '+f+'：撳掣一律關得（載入時一次綁定 shut()）', /function shut\(val\)/.test(s) && /ov\.style\.display = "none"/.test(s));
  chk('★ '+f+'：舊嘅開窗才綁定已清除', !/c\.onclick = function\(\)\{ if\(window\._adResolve\)/.test(s));
});

// ---------- SW 唔准 serve 舊 HTML（2026-10-13 Grok 4.7 審計）----------
// 血例：GitHub Pages 送 cache-control: max-age=600；c.add() 會食 HTTP cache →
//  SW 更新咗但 cache 入面嘅 index.html 仍然係舊版 → 離線 serve 舊 HTML → 空白彈窗。
// 另：/hk-mbti/ 同 /hk-mbti/index.html 係兩條 key，失效時一定要兩條都試。
const swRaw=fs.readFileSync(path.join(REPO,'sw.js'),'utf8');
const swsrc=swRaw.replace(/\/\/[^\n]*/g,'');   // 去註釋，免得註釋提到舊寫法就誤報
chk('★ sw.js 唔准用 c.add()（要用 fetch({cache:"reload"}) ＋ put）', !/c\.add\(/.test(swsrc));
chk('★ sw.js install 用 cache:"reload"', /cache: "reload"/.test(swsrc.split('addEventListener("install"')[1]||''));
chk('★ sw.js HTML 導航 fetch 用 cache:"reload"', (swsrc.match(/cache: "reload"/g)||[]).length>=3, (swsrc.match(/cache: "reload"/g)||[]).length+' 處');
chk('★ sw.js cache 失效會試齊兩條 key（/hk-mbti/ 同 /hk-mbti/index.html）',
    /caches\.match\("\/hk-mbti\/index\.html"/.test(swsrc) && /caches\.match\("\/hk-mbti\/"/.test(swsrc));

// ---------- 自癒哨兵 ＋ respondWith(undefined) 洞（2026-10-13 DeepSeek v4 Pro 審計）----------
const pagesAll=fs.readdirSync(REPO).filter(f=>f.endsWith('.html') && fs.readFileSync(path.join(REPO,f),'utf8').includes('tailwind.css'));
const noHeal=pagesAll.filter(f=>!/hkmbti_selfheal/.test(fs.readFileSync(path.join(REPO,f),'utf8')));
chk('★ 每個靠 tailwind.css 嘅頁面都有自癒哨兵', noHeal.length===0, noHeal.join(','));
chk('★ 哨兵有防無限重載（sessionStorage 只試一次）', /sessionStorage\.getItem\(KEY\)/.test(fs.readFileSync(path.join(REPO,'index.html'),'utf8')));
chk('★ 哨兵離線時唔郁（等連網先自癒）', /if\(!navigator\.onLine\) return;/.test(fs.readFileSync(path.join(REPO,'index.html'),'utf8')));
chk('★ sw.js 封死 respondWith(undefined)（cache miss + 離線唔會 throw）', /Response\.error\(\)/.test(swsrc));
console.log(ok===total ? "===== 全部通過（"+total+" 項）=====" : "===== 有失敗（"+ok+"/"+total+"）=====");
process.exit(ok===total?0:1);
