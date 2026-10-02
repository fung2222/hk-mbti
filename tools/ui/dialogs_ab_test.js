
const fs=require('fs'), path=require('path');
const {JSDOM, VirtualConsole}=require('jsdom');
const REPO=path.resolve(__dirname,'../..');
let ok=0,total=0; function chk(n,c,x){total++; if(c)ok++; console.log((c?'✓':'✗')+' '+n+(c?'':'   <- '+(x||'')));}
function load(file, hash){
  let html=fs.readFileSync(path.join(REPO,file),'utf8');
  html=html.replace(/<script src="(https?:)?\/\/[^"]*"><\/script>/g,'')
           .replace(/<script src="([^"]+\.js)"><\/script>/g,(m,f)=>fs.existsSync(path.join(REPO,f))?'<script>\n'+fs.readFileSync(path.join(REPO,f),'utf8')+'\n</script>':'');
  const vc=new VirtualConsole(); const errs=[]; vc.on('jsdomError',e=>errs.push(e.message));
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://fung2222.github.io/hk-mbti/'+(hash||''),virtualConsole:vc});
  return {w:dom.window,d:dom.window.document,errs,html,src:fs.readFileSync(path.join(REPO,file),'utf8')};
}
const srcIndex=fs.readFileSync(path.join(REPO,'index.html'),'utf8');
const srcRecord=fs.readFileSync(path.join(REPO,'record.html'),'utf8');

console.log('===== index.html =====');
const {w,d,errs}=load('index.html');
const hid=()=>d.getElementById('appDialog').classList.contains('hidden');
chk('彈窗元素存在', !!d.getElementById('appDialog'));
chk('appDialog / appNotice 都有定義', typeof w.appDialog==='function' && typeof w.appNotice==='function');

// A1
let deleted=null; w.deleteHistoryItem=function(i){deleted=i;};
w.deleteHistoryConfirm(2);
setTimeout(()=>{
  chk('A1 刪除單筆 → 彈窗 + 標題', !hid() && d.getElementById('adTitle').textContent==='刪除這筆紀錄？');
  chk('A1 內容（書面語 + 第幾筆）', d.getElementById('adBody').textContent==='刪除後無法復原。（第 3 筆）', d.getElementById('adBody').textContent);
  chk('A1 掣 = 取消／刪除', d.getElementById('adCancel').textContent==='取消' && d.getElementById('adOk').textContent==='刪除');
  d.getElementById('adCancel').onclick();
  setTimeout(()=>{
    chk('A1 撳「取消」→ 冇刪', deleted===null && hid());
    w.deleteHistoryConfirm(2);
    setTimeout(()=>{ d.getElementById('adOk').onclick();
      setTimeout(()=>{ chk('A1 撳「刪除」→ 真係刪', deleted===2 && hid());
        // A2
        w.clearHistory();
        setTimeout(()=>{
          chk('A2 清除全部 → 書面語內容', !hid() && /所有測試紀錄與統計資料將一併刪除/.test(d.getElementById('adBody').textContent));
          chk('A2 掣 = 取消／全部清除', d.getElementById('adCancel').textContent==='取消' && d.getElementById('adOk').textContent==='全部清除');
          d.getElementById('adCancel').onclick();
          setTimeout(()=>{ chk('A2 撳「取消」收埋', hid());

            // A3（靜態驗證：resume 卡係動態生成）
            chk('A3 放棄進度：文案「未完成的作答進度將被刪除，無法復原。」',
                srcIndex.includes('未完成的作答進度將被刪除，無法復原。'));
            chk('A3 掣 = 保留／放棄', srcIndex.includes('cancelText: "保留"') && srcIndex.includes('okText: "放棄"'));
            chk('A3 handler 已改 async', /drop\.onclick = async \(\) => \{/.test(srcIndex));
            chk('A3 已經冇 alert/confirm 喺放棄進度路徑',
                /await appDialog\(\{ title: "放棄上次進度？"/.test(srcIndex));

            // B 組
            w.appNotice('測試標題','測試內容');
            setTimeout(()=>{
              chk('B 提示框：得返一粒掣（取消隱藏）+ 文字「知道了」', !hid() && d.getElementById('adCancel').style.display==='none' && d.getElementById('adOk').textContent==='知道了');
              chk('B 標題／內容正確', d.getElementById('adTitle').textContent==='測試標題' && d.getElementById('adBody').textContent==='測試內容');
              d.getElementById('adOk').onclick();
              setTimeout(()=>{
                chk('B 撳「知道了」收埋', hid());
                chk('B 15 個原生 alert 已經清零（index）', !/(?<![.\w])alert\s*\(/.test(srcIndex));
                chk('B 文案已經唔再有「撳」「唔」等字（檢查幾個樣本）',
                    !srcIndex.includes('請揀一個稱呼') && !srcIndex.includes('生成圖片失敗，請再試一次') && srcIndex.includes('請選擇性別'));
                chk('index：原生 confirm 已經清零（廣告 demo 殘骸已刪）', !/(?<![.\w])confirm\s*\(/.test(srcIndex));
                chk('index：舊「永久去廣告」demo 殘骸已清', !/hkmbti_no_ad|hasNoAd|purchaseNoAd|HAS_PAID_NO_AD|data-no-ad-hide|ad-unlock/.test(srcIndex));

                console.log('\n===== record.html =====');
                const r=load('record.html','record.html?x=1');
                chk('彈窗元素存在', !!r.d.getElementById('appDialog'));
                chk('appDialog / appNotice 有定義', typeof r.w.appDialog==='function' && typeof r.w.appNotice==='function');
                chk('record：alert 清零', !/(?<![.\w])alert\s*\(/.test(srcRecord));
                chk('record：原生 confirm 已經清零', (srcRecord.match(/(?<![.\w])confirm\s*\(/g)||[]).length===0);
                chk('record：舊「永久去廣告」demo 殘骸已清', !/hkmbti_no_ad|hasNoAd|purchaseNoAd|HAS_PAID_NO_AD|data-no-ad-hide|ad-unlock/.test(srcRecord));
                chk('record：delRec 已 async', /async function delRec\(/.test(srcRecord));
                chk('record：clearAllRecords 已 async', /async function clearAllRecords\(/.test(srcRecord));
                r.w.appDialog({title:'刪除這筆紀錄？',body:'刪除後無法復原。',cancelText:'取消',okText:'刪除'});
                setTimeout(()=>{
                  chk('record 彈窗開到（內容正確）', !r.d.getElementById('appDialog').classList.contains('hidden') && r.d.getElementById('adOk').textContent==='刪除');
                  r.d.getElementById('adOk').onclick();
                  setTimeout(()=>{
                    chk('record 撳掣收得埋', r.d.getElementById('appDialog').classList.contains('hidden'));
                    console.log('   index jsdom 錯誤:', errs.filter(e=>!/scrollTo/.test(e)).length? errs.filter(e=>!/scrollTo/.test(e)).slice(0,2).join(' | '):'冇');
                    console.log('   record jsdom 錯誤:', r.errs.filter(e=>!/scrollTo/.test(e)).length? r.errs.filter(e=>!/scrollTo/.test(e)).slice(0,2).join(' | '):'冇');
                    console.log('\n===== '+(ok===total?'全部通過':'有失敗')+'（'+ok+'/'+total+'） =====');
                    process.exit(ok===total?0:1);
                  },60);
                },60);
              },60);
            },60);
          },60);
        },60);
      },60);
    },60);
  },60);
},80);
