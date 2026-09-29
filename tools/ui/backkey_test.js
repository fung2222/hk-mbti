
const fs=require('fs'), path=require('path');
const {JSDOM, VirtualConsole}=require('jsdom');
const REPO=path.resolve(__dirname,'../..');
let html=fs.readFileSync(path.join(REPO,'index.html'),'utf8');
html=html.replace(/<script src="(https?:)?\/\/[^"]*"><\/script>/g,'')
         .replace(/<script src="([^"]+\.js)"><\/script>/g,(m,f)=>fs.existsSync(path.join(REPO,f))?'<script>\n'+fs.readFileSync(path.join(REPO,f),'utf8')+'\n</script>':'');
const vc=new VirtualConsole(); const errs=[]; vc.on('jsdomError',e=>errs.push(e.message));
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://fung2222.github.io/hk-mbti/',virtualConsole:vc});
const w=dom.window, d=w.document;
let ok=0,total=0; function chk(n,c,x){total++; if(c)ok++; console.log((c?'✓':'✗')+' '+n+(c?'':'   <- '+(x||'')));}
const ov=()=>d.getElementById('appDialog'), hid=()=>ov().classList.contains('hidden');
let wentHome=false; w.goHome=function(){wentHome=true;}; w.clearVersionUI=function(){};
const testHidden=()=>d.getElementById('test').classList.contains('hidden');

// ===== 建立接近真實嘅歷史：[home, test]，並且 spy 住 pushState / replaceState =====
if(typeof w.show==='function'){ w.show('test'); } else { w._showing='test'; d.getElementById('test').classList.remove('hidden'); }
w.history.replaceState({hk:true,id:'home'},'');
w.history.pushState({hk:true,id:'test'},'');
const lenBefore = w.history.length;
let pushes=0, replaces=0;
const _push=w.history.pushState.bind(w.history), _repl=w.history.replaceState.bind(w.history);
w.history.pushState=function(){ pushes++; return _push.apply(null,arguments); };
w.history.replaceState=function(){ replaces++; return _repl.apply(null,arguments); };

// 真 · 撳 Android 返回鍵（真 back()：jsdom 會行 history 並 fire popstate；唔得就 fallback 手動 dispatch）
function pressBack(){
  const p = new Promise(res=>{
    let done=false;
    const onPop=()=>{ if(done) return; done=true; setTimeout(res,60); };
    w.addEventListener('popstate', onPop);
    try{ w.history.back(); }catch(e){}
    setTimeout(()=>{ if(!done){ w.removeEventListener('popstate', onPop); w.dispatchEvent(new w.PopStateEvent('popstate',{state:w.history.state})); setTimeout(res,60);} },250);
  });
  return p;
}

(async ()=>{
  for(let i=1;i<=4;i++){
    const before = pushes;
    await pressBack();
    chk(`第 ${i} 次撳返回鍵 → 冇退出 app`, wentHome===false);
    chk(`第 ${i} 次撳返回鍵 → 仍然留喺測試畫面`, testHidden()===false && w._showing==='test');
    chk(`第 ${i} 次撳返回鍵 → 有還原歷史（pushState 有跑）`, pushes>before, `pushes=${pushes}`);
    chk(`第 ${i} 次撳返回鍵 → 彈窗仍然在（唔會冇咗）`, !hid());
    chk(`第 ${i} 次撳返回鍵 → 歷史仍然標記住 test`, w.history.state && w.history.state.id==='test', JSON.stringify(w.history.state));
  }
  chk('連續撳 4 次之後歷史長度冇縮短（唔會耗盡）', w.history.length>=lenBefore, `${lenBefore} -> ${w.history.length}`);
  chk('冇用 replaceState 做還原（要用 pushState）', replaces===0, `replaceState 被呼叫 ${replaces} 次`);
  console.log('--- 最後揀掣 ---');
  d.getElementById('adCancel').onclick();
  setTimeout(()=>{
    chk('撳「繼續測試」→ 留喺測試畫面', testHidden()===false && hid() && wentHome===false);
    pressBack().then(()=>{
      d.getElementById('adOk').onclick();
      setTimeout(()=>{
        chk('撳「離開」→ 真係離開（goHome 有跑）', wentHome===true && hid());
        console.log('   pushes='+pushes+' replaces='+replaces+' history.length='+w.history.length);
        console.log('   jsdom 錯誤:', errs.filter(e=>!/scrollTo/.test(e)).length? errs.filter(e=>!/scrollTo/.test(e)).slice(0,2).join(' | ') : '冇（scrollTo 無關）');
        console.log('===== '+(ok===total?'全部通過':'有失敗')+'（'+ok+'/'+total+'） =====');
        process.exit(ok===total?0:1);
      },80);
    });
  },80);
})();
