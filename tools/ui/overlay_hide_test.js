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
console.log(ok===total ? "===== 全部通過（"+total+" 項）=====" : "===== 有失敗（"+ok+"/"+total+"）=====");
process.exit(ok===total?0:1);
