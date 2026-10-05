
const fs=require('fs'), path=require('path');
const {JSDOM, VirtualConsole}=require('jsdom');
const REPO=path.resolve(__dirname,'../..');
function stubCanvas(w){
  const ctx=new Proxy({}, { get(k){ if(k==="canvas") return {width:720,height:1280}; if(k==="measureText") return ()=>({width:10}); if(/Gradient/.test(String(k))) return ()=>({addColorStop(){}}); return ()=>{}; }, set(){return true;} });
  w.HTMLCanvasElement.prototype.getContext=()=>ctx;
  w.HTMLCanvasElement.prototype.toDataURL=()=>"data:image/jpeg;base64,x";
  w.Image=class{ set src(v){ setTimeout(()=>this.onload&&this.onload(),0); } };
}
function audit(file){
  let html=fs.readFileSync(path.join(REPO,file),'utf8');
  html=html.replace(/<script src="(https?:)?\/\/[^"]*"><\/script>/g,'')
           .replace(/<script src="([^"]+\.js)"><\/script>/g,(m,f)=>fs.existsSync(path.join(REPO,f))?'<script>\n'+fs.readFileSync(path.join(REPO,f),'utf8')+'\n</script>':'');
  const errs=[];
  const vc=new VirtualConsole();
  vc.on('jsdomError',e=>{const m=String(e.message||e); if(!/scrollTo|scrollIntoView|createObjectURL|Not implemented|Could not load|css/i.test(m)) errs.push('load: '+m.slice(0,110));});
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://fung2222.github.io/hk-mbti/'+(file==='index.html'?'':'record.html?x=1'),virtualConsole:vc,
    beforeParse(w){
      w.alert=()=>{}; w.confirm=()=>false;
      stubCanvas(w);
      try{ Object.defineProperty(w,'appDialog',{configurable:true,get(){return()=>Promise.resolve(false);},set(){}}); }catch(e){}
      try{ Object.defineProperty(w,'appNotice',{configurable:true,get(){return()=>{};},set(){}}); }catch(e){}
      try{
        const store=[0,1,2].map(i=>({id:'rec'+i+'-'+(Date.now()-i*1000),mbti:'INFP-A',timestamp:Date.now()-i*600000,name:'測試',version:'life'}));
        w.localStorage.setItem('hkmbti_history',JSON.stringify(store));
        w.localStorage.setItem('hkmbti_last_result',JSON.stringify(store[0]));
        w.localStorage.setItem('hkmbti_type_counts',JSON.stringify({INFP:2}));
        w.localStorage.setItem('hkmbti_progress',JSON.stringify({version:'life',idx:3,answers:[1,null,2],startedAt:Date.now(),deck:[{},{},{},{},{}]}));
        w.sessionStorage.setItem('hkmbti_last_section','home');
      }catch(e){}
    }});
  return new Promise(res=>setTimeout(()=>{
    const w=dom.window, d=w.document;
    const nodes=[...d.querySelectorAll('[onclick]')];
    const bar=[];
    nodes.forEach((el,i)=>{
      const code=el.getAttribute('onclick');
      try{
        el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));
      }catch(e){ bar.push(`#${i} [${code.slice(0,42)}] → ${String(e.message||e).slice(0,90)}`); }
    });
    res({file, count:nodes.length, errs, bar, w, d});
  }, 1200));
}
(async()=>{
  let bad=0;
  for(const f of ['index.html','record.html','stats.html','tee.html','privacy.html']){
    const r=await audit(f);
    if(r.errs.length||r.bar.length) bad++;
    console.log(`\n===== ${f}：撳咗 ${r.count} 粒掣 =====`);
    console.log('  載入錯誤:', r.errs.length? r.errs.slice(0,3).join(' | ') : '冇');
    console.log('  撳掣拋錯:', r.bar.length? '' : '冇 ✓');
    r.bar.slice(0,12).forEach(x=>console.log('    ✗ '+x));
    if(r.bar.length>12) console.log(`    …仲有 ${r.bar.length-12} 個`);
  }
  process.exit(bad?1:0);   // 2026-10-05：有拋錯／載入錯誤就 exit 1，唔再無條件當成功
})();
