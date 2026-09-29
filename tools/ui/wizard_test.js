
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
  const stepNow=()=>[1,2,3,4].filter(vis).join()||'none';
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
  chk('揀咗性別 → 唔彈 + 跳第 4 步', notices.length===0 && stepNow()==='4', JSON.stringify(notices)+' '+stepNow());

  w.wizGo(1); d.getElementById('profileName').value=''; reset();
  click(nextBtn(1));
  chk('未填姓名 → 有提示 + 留喺第 1 步', notices.length===1 && /姓名/.test(notices[0]) && stepNow()==='1', JSON.stringify(notices)+' '+stepNow());
  d.getElementById('profileName').value='Roy'; reset();
  click(nextBtn(1));
  chk('填咗姓名 → 唔彈 + 跳第 2 步', notices.length===0 && stepNow()==='2', JSON.stringify(notices)+' '+stepNow());

  d.getElementById('profileName').value=''; w.state.nickname=''; w.state.gender='';
  w.wizSkip();
  chk('「匿名港人 · 跳過」→ 直接第 4 步', stepNow()==='4', stepNow());
  chk('跳過後第 4 步有「正式開始」掣', !!d.querySelector('#wizStep4 .btn-gold'));
  console.log('');
  console.log('===== '+(ok===total?'全部通過':'有失敗')+'（'+ok+'/'+total+'） =====');
  process.exit(ok===total?0:1);
}, 1200);
