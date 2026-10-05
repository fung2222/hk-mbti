
// 全流程：主頁 → 版本卡 → wizard → 正式開始，記錄所有彈窗
const fs=require('fs'), path=require('path');
const {JSDOM, VirtualConsole}=require('jsdom');
const REPO=path.resolve(__dirname,'../..');
const src=fs.readFileSync(path.join(REPO,'index.html'),'utf8');
function stubCanvas(w){ const ctx=new Proxy({}, { get(k){ if(k==="canvas") return {width:720,height:1280}; if(k==="measureText") return ()=>({width:10}); if(/Gradient/.test(String(k))) return ()=>({addColorStop(){}}); return ()=>{}; }, set(){return true;} });
  w.HTMLCanvasElement.prototype.getContext=()=>ctx; w.HTMLCanvasElement.prototype.toDataURL=()=>"data:image/jpeg;base64,x"; w.Image=class{ set src(v){ setTimeout(()=>this.onload&&this.onload(),0); } }; }
let html=src.replace(/<script src="(https?:)?\/\/[^"]*"><\/script>/g,'').replace(/<script src="([^"]+\.js)"><\/script>/g,(m,f)=>fs.existsSync(path.join(REPO,f))?'<script>'+String.fromCharCode(10)+fs.readFileSync(path.join(REPO,f),'utf8')+String.fromCharCode(10)+'</script>':'');
const vc=new VirtualConsole(); const jerr=[]; vc.on('jsdomError',e=>{const m=String(e.message||e); if(!/scrollIntoView|scrollTo|Not implemented/.test(m)) jerr.push(m.slice(0,100));});
const dialogs=[];
const SEED = process.argv[2]==='warm';
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://fung2222.github.io/hk-mbti/',virtualConsole:vc,
  beforeParse(w){ w.alert=()=>{}; w.confirm=()=>false; stubCanvas(w);
    try{ Object.defineProperty(w,'appDialog',{configurable:true,get(){return (o)=>{ dialogs.push('DIALOG| '+(o.title||'')+(o.body?' / '+o.body:'')); return Promise.resolve(true); }},set(){}}); }catch(e){}
    try{ Object.defineProperty(w,'appNotice',{configurable:true,get(){return (t,b)=>{ dialogs.push('NOTICE| '+[t,b].filter(Boolean).join(' / ')); return Promise.resolve(true); };},set(){}}); }catch(e){}
    if(SEED){ try{ w.localStorage.setItem('hkmbti_history', JSON.stringify([{mbti:'INFP-A',nickname:'舊',name:'舊',gender:'男',date:Date.now(),answers:[1,2,3,4,5,6,7,8]} ])); }catch(e){} }
  }});
setTimeout(()=>{
  const w=dom.window, d=w.document;
  const click=(el)=>el && el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));
  const stepNow=()=>[1,2,3,4].filter(n=>!d.getElementById('wizStep'+n).classList.contains('hidden')).join()||'none';
  console.log('狀態：'+(SEED?'有舊紀錄/進度':'全新（冇紀錄）'));
  const card=d.querySelector('.ver-btn[data-ver="life"]');
  console.log('1) 撳「生活版」卡: '+(card?card.getAttribute('onclick'):'冇卡'));
  click(card);
  console.log('   → 現時畫面: show=' + [...d.querySelectorAll('section')].filter(s=>!s.classList.contains('hidden')).map(s=>s.id).join(',') + ' | wizard 第 '+stepNow()+' 步 | 彈窗:'+JSON.stringify(dialogs));
  dialogs.length=0;
  w.renderNickGrid(); click(d.querySelector('#nickGrid button'));
  click(d.querySelector('#wizStep2 .btn-gold'));
  click(d.getElementById('genderF'));
  click(d.querySelector('#wizStep3 .btn-gold'));
  console.log('2) 揀完稱呼/性別 → wizard 第 '+stepNow()+' 步 | 彈窗:'+JSON.stringify(dialogs));
  dialogs.length=0;
  const startBtn=d.querySelector('#wizStep4 .btn-gold');
  console.log('3) 第 4 步掣: '+(startBtn?startBtn.getAttribute('onclick'):'冇'));
  click(startBtn);
  console.log('   → 撳「正式開始」後嘅彈窗: '+JSON.stringify(dialogs));
  console.log('   → countdown overlay 有冇彈: '+!d.getElementById('countdownOverlay').classList.contains('hidden'));
  console.log('   → 問卷畫面: '+[...d.querySelectorAll('section')].filter(s=>!s.classList.contains('hidden')).map(s=>s.id).join(','));
  console.log('   → state: name='+w.state.displayName+' nick='+w.state.nickname+' gender='+w.state.gender+' version='+w.state.version);
  console.log('   → JS 錯誤: '+(jerr.length?JSON.stringify(jerr.slice(0,3)):'冇'));
  process.exit(jerr.length?1:0);   // 2026-10-05：有 JS 錯誤就 exit 1
}, 1400);
