
const fs=require('fs'), path=require('path');
const {JSDOM, VirtualConsole}=require('jsdom');
const REPO=path.resolve(__dirname,'../..');
let ok=0,total=0; function chk(n,c,x){total++; if(c)ok++; console.log((c?'✓':'✗')+' '+n+(c?'':'   <- '+(x||'')));}
function load(file, hash, seed){
  let html=fs.readFileSync(path.join(REPO,file),'utf8');
  html=html.replace(/<script src="(https?:)?\/\/[^"]*"><\/script>/g,'')
           .replace(/<script src="([^"]+\.js)"><\/script>/g,(m,f)=>fs.existsSync(path.join(REPO,f))?'<script>\n'+fs.readFileSync(path.join(REPO,f),'utf8')+'\n</script>':'');
  const vc=new VirtualConsole(); const errs=[]; vc.on('jsdomError',e=>{const m=String(e.message||e); if(!/scrollTo|Not implemented/.test(m)) errs.push(m.slice(0,120));});
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://fung2222.github.io/hk-mbti/'+(hash||''),virtualConsole:vc,
    beforeParse(w){ (seed||[]).forEach(([k,v])=>{ try{ w.localStorage.setItem(k,v); }catch(e){} }); }});
  return {w:dom.window,d:dom.window.document,errs,src:fs.readFileSync(path.join(REPO,file),'utf8')};
}
const rec=(i,id)=>({id:id||('rec'+i+'-'+(Date.now()-i*1000)), mbti:'INFP-A', timestamp:Date.now()-i*600000, name:'測試', version:'life'});

console.log('===== record.html 垃圾桶：撳一次即彈 =====');
{
  const store=JSON.stringify([rec(0,'aaa'), rec(1,'bbb')]);
  const {w,d,errs,src}=load('record.html','record.html?x=1',[['hkmbti_history',store],['hkmbti_last_result',JSON.stringify(rec(0,'aaa'))]]);
  setTimeout(()=>{
    const hid=()=>d.getElementById('appDialog').classList.contains('hidden');
    const btn=d.querySelector('.act-del');
    chk('記錄頁有垃圾桶掣', !!btn);
    const svg=btn && btn.querySelector('svg');
    chk('垃圾桶裡面有 icon（svg）', !!svg);
    const delBody=(src.match(/async function delRec\(i\)\{[\s\S]*?\n\}/)||[''])[0];
    chk('delRec 入面已經冇「再撳一次」/armed/event.target', !/再撳一次|armed|event\.target|_delArmTimer/.test(delBody), delBody.slice(0,60));
    if(svg){
      const tapIcon=()=>svg.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));
      tapIcon();   // ← 撳正個 icon（以前會冇反應 ✗）
      setTimeout(()=>{
        chk('撳一次 icon → 立即彈視窗', !hid());
        chk('彈窗標題 =「刪除這筆紀錄？」', d.getElementById('adTitle').textContent==='刪除這筆紀錄？');
        chk('icon 冇被改字（唔會出「再撳一次」）', (svg.textContent||'').indexOf('再撳')<0);
        d.getElementById('adCancel').onclick();
        setTimeout(()=>{
          chk('撳「取消」→ 紀錄照舊 2 筆', JSON.parse(w.localStorage.getItem('hkmbti_history')).length===2);
          tapIcon();
          setTimeout(()=>{
            chk('再撳一次 icon → 又即刻彈（唔使撳兩次）', !hid());
            d.getElementById('adOk').onclick();
            setTimeout(()=>{
              const left=JSON.parse(w.localStorage.getItem('hkmbti_history')||'[]');
              chk('撳「刪除」→ 真係刪咗 1 筆', left.length===1, 'left='+left.length);
              console.log('   record jsdom 錯誤:', errs.length? errs.slice(0,2).join(' | '):'冇');

              console.log('\n===== index.html 記錄卡垃圾桶：撳一次即彈 =====');
              const i2=load('index.html','',[['hkmbti_history',store],['hkmbti_last_result',JSON.stringify(rec(0,'aaa'))]]);
              setTimeout(()=>{
                const w2=i2.w, d2=i2.d;
                const hid2=()=>d2.getElementById('appDialog').classList.contains('hidden');
                const armBody=(i2.src.match(/window\.armDeleteHistory = function\(idx\)\{[\s\S]*?\n\};/)||[''])[0];
                chk('armDeleteHistory 已經冇「再撳」邏輯', !/dataset\.armed|event\.target|innerText = " 再撳"/.test(armBody), armBody.slice(0,80));
                chk('armDeleteHistory 仍然有定義（onclick 唔會死）', typeof w2.armDeleteHistory==='function');
                w2.armDeleteHistory(0);
                setTimeout(()=>{
                  chk('撳一次 → 立即彈視窗（唔使撳兩次）', !hid2());
                  chk('彈窗有「第 1 筆」提示', /第 1 筆/.test(d2.getElementById('adBody').textContent));
                  d2.getElementById('adCancel').onclick();
                  setTimeout(()=>{
                    chk('撳「取消」收埋', hid2());
                    console.log('   index jsdom 錯誤:', i2.errs.length? i2.errs.slice(0,2).join(' | '):'冇');
                    console.log('\n===== '+(ok===total?'全部通過':'有失敗')+'（'+ok+'/'+total+'） =====');
                    process.exit(ok===total?0:1);
                  },60);
                },80);
              },900);
            },80);
          },80);
        },80);
      },80);
    } else { console.log('（冇 svg，跳過）'); process.exit(1); }
  },900);
}
