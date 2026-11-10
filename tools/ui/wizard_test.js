
const fs=require('fs'), path=require('path');
const {JSDOM, VirtualConsole}=require('jsdom');
const REPO=path.resolve(__dirname,'../..');
let ok=0,total=0; function chk(n,c,x){total++; if(c)ok++; console.log((c?'✓':'✗')+' '+n+(c?'':'   <- '+(x||'')));}
const src=fs.readFileSync(path.join(REPO,'index.html'),'utf8');
function stubCanvas(w){ const ctx=new Proxy({}, { get(k){ if(k==="canvas") return {width:720,height:1280}; if(k==="measureText") return ()=>({width:10}); if(/Gradient/.test(String(k))) return ()=>({addColorStop(){}}); return ()=>{}; }, set(){return true;} });
  w.HTMLCanvasElement.prototype.getContext=()=>ctx; w.HTMLCanvasElement.prototype.toDataURL=()=>"data:image/jpeg;base64,x"; w.Image=class{ set src(v){ setTimeout(()=>this.onload&&this.onload(),0); } }; }
let html=src.replace(/<script src="(https?:)?\/\/[^"]*"><\/script>/g,'').replace(/<script src="([^"]+\.js)"><\/script>/g,(m,f)=>fs.existsSync(path.join(REPO,f))?'<script>'+String.fromCharCode(10)+fs.readFileSync(path.join(REPO,f),'utf8')+String.fromCharCode(10)+'</script>':'');
const vc=new VirtualConsole(); vc.on('jsdomError',()=>{});
const notices=[], dialogs=[];
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://fung2222.github.io/hk-mbti/',virtualConsole:vc,
  beforeParse(w){ w.alert=()=>{}; w.confirm=()=>false; stubCanvas(w);
    try{ Object.defineProperty(w,'appDialog',{configurable:true,get(){return (o)=>{ dialogs.push(Object.assign({},o)); return Promise.resolve(true); }},set(){}}); }catch(e){}
    try{ Object.defineProperty(w,'appNotice',{configurable:true,get(){return (t,b)=>{ notices.push([t,b].filter(Boolean).join(' | ')); return Promise.resolve(true); };},set(){}}); }catch(e){}
  }});
setTimeout(()=>{
  const w=dom.window, d=w.document;
  const vis=(n)=>!d.getElementById('wizStep'+n).classList.contains('hidden');
  const stepNow=()=>[1,2,3,4,5].filter(vis).join()||'none';
  const nextBtn=(n)=>d.querySelector('#wizStep'+n+' .btn-gold');
  const click=(el)=>el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));
  const reset=()=>{ notices.length=0; dialogs.length=0; };

  w.wizGo(2); w.state.nickname=''; reset();
  click(nextBtn(2));
  chk('未揀稱呼 → 有提示「請選擇一個稱呼」', notices.length===1 && /稱呼/.test(notices[0]), JSON.stringify(notices));
  chk('未揀稱呼 → 留喺第 2 步（唔會偷跳）', stepNow()==='2', stepNow());
  w.renderNickGrid();
  const nbtn=d.querySelector('#nickGrid button');
  const pickedName=nbtn.textContent.trim();
  click(nbtn);
  chk('撳稱呼掣 → 真係記住咗', w.state.nickname===pickedName, w.state.nickname+' vs '+pickedName);
  chk('稱呼掣有「已揀」樣', [...d.querySelectorAll('#nickGrid button')].filter(b=>b.className.indexOf('bg-gold')>=0).length===1);
  reset();
  click(nextBtn(2));
  chk('★ 揀咗稱呼 → 唔會再彈提示（就係原本 bug）', notices.length===0 && dialogs.length===0, JSON.stringify(notices));
  chk('★ 揀咗稱呼 → 正常跳第 3 步', stepNow()==='3', stepNow());

  w.state.gender=''; w.renderGender(); reset();
  click(nextBtn(3));
  chk('未揀性別 → 有提示「請選擇性別」', notices.length===1 && /性別/.test(notices[0]), JSON.stringify(notices));
  chk('未揀性別 → 留喺第 3 步', stepNow()==='3', stepNow());
  click(d.getElementById('genderM'));
  chk('撳「男」→ 記住 + 著燈', w.state.gender==='男' && d.getElementById('genderM').className.indexOf('on')>=0, w.state.gender);
  reset();
  click(nextBtn(3));
  chk('揀咗性別 → 唔彈 + 跳第 4 步（身份情境）', notices.length===0 && stepNow()==='4', JSON.stringify(notices)+' '+stepNow());

  // ===== 第 4 步：身份情境（v2.1.0，可略過，唔驗證）=====
  reset();
  click(nextBtn(4));
  chk('第 4 步唔揀身份 → 唔彈提示直接跳第 5 步', notices.length===0 && dialogs.length===0 && stepNow()==='5', JSON.stringify(notices)+' '+stepNow());
  w.wizGo(4);
  const ctxBtn=(c)=>d.querySelector('.ctx-btn[data-ctx="'+c+'"]');
  click(ctxBtn('student'));
  chk('撳「學生」→ state.qContext=student + 著燈 + aria-pressed', w.state.qContext==='student' && ctxBtn('student').className.indexOf('on')>=0 && ctxBtn('student').getAttribute('aria-pressed')==='true', w.state.qContext+' '+ctxBtn('student').className);
  click(ctxBtn('worker'));
  chk('轉撳「在職」→ 學生掣熄返、在職著燈', w.state.qContext==='worker' && ctxBtn('student').className.indexOf('on')<0 && ctxBtn('worker').className.indexOf('on')>=0, w.state.qContext);
  click(ctxBtn('skip'));
  chk('撳「略過」→ qContext=skip', w.state.qContext==='skip', w.state.qContext);
  const ctxCount=d.querySelectorAll('.ctx-btn').length;
  chk('身份選擇有齊 4 個掣（學生/在職/兩者/略過）', ctxCount===4, 'count='+ctxCount);
  // 觸控目標 ≥44px：jsdom 冇 layout，用 computed min-height 守（真幾何由 desktop_render_test.py 守）
  const mh=w.getComputedStyle(ctxBtn('student')).minHeight;
  chk('身份掣 min-height ≥44px', parseFloat(mh)>=44, 'min-height='+mh);

  w.wizGo(1); d.getElementById('profileName').value=''; reset();
  click(nextBtn(1));
  chk('未填姓名 → 有提示 + 留喺第 1 步', notices.length===1 && /姓名/.test(notices[0]) && stepNow()==='1', JSON.stringify(notices)+' '+stepNow());
  d.getElementById('profileName').value='Roy'; reset();
  click(nextBtn(1));
  chk('填咗姓名 → 唔彈 + 跳第 2 步', notices.length===0 && stepNow()==='2', JSON.stringify(notices)+' '+stepNow());

  d.getElementById('profileName').value=''; w.state.nickname=''; w.state.gender='';
  w.wizSkip();
  chk('「匿名港人 · 跳過」→ 直接第 5 步', stepNow()==='5', stepNow());
  chk('跳過後第 5 步有「正式開始」掣', !!d.querySelector('#wizStep5 .btn-gold'));
  chk('步驟指示寫「共 5 步」', d.getElementById('profileStep').textContent.indexOf('共 5 步')>=0, d.getElementById('profileStep').textContent);
  chk('進度圓點有 5 粒', d.querySelectorAll('.wiz-dot').length===5, 'dots='+d.querySelectorAll('.wiz-dot').length);
  console.log('');
  console.log('===== '+(ok===total?'全部通過':'有失敗')+'（'+ok+'/'+total+'） =====');
  process.exit(ok===total?0:1);
}, 1200);
