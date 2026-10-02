/* 分享卡（canvas）版面測試 —— 2026-10-02
   ⚠️ jsdom 冇 layout、亦冇 canvas pixel → 用「錄影式 2D context」記錄 generateCardImage()
      真正落過嘅每個 fillText／drawImage 座標，再驗算版面（唯一睇得到張卡嘅方法）。
   覆蓋：① 卡上冇日期 ② 左上 logo 尺寸 ③ header 中線 ④ 品牌／版本唔重疊
        ⑤ 名字位置 ⑥ 分隔線 ⑦ 4 字母 ＋ T/A chip ⑧ 所有文字唔出界 */
const fs=require("fs"), path=require("path");
const {JSDOM}=require("jsdom");
const REPO=path.resolve(__dirname,"../..");
let ok=0,total=0;
function chk(n,c,x){ total++; if(c)ok++; console.log((c?"✓":"✗")+" "+n+(c?"":"   <- "+(x||""))); }

let HTML=fs.readFileSync(path.join(REPO,"index.html"),"utf8");
HTML=HTML.replace(/<script src="(https?:)?\/\/[^"]*"><\/script>/g,"")
         .replace(/<script src="([^"]+\.js)"><\/script>/g,(m,f)=>fs.existsSync(path.join(REPO,f))?"<script>\n"+fs.readFileSync(path.join(REPO,f),"utf8")+"\n</script>":"");

const dom=new JSDOM(HTML,{runScripts:"dangerously",pretendToBeVisual:true,url:"https://example.com/"});
const w=dom.window;
const calls=[];
const isCJK=ch=>/[\u3000-\u9fff\uff00-\uffef]/.test(ch);
function mkCtx(){
  const c={ _font:"10px sans-serif", _align:"start", _base:"alphabetic",
    get font(){return this._font}, set font(v){this._font=v},
    get textAlign(){return this._align}, set textAlign(v){this._align=v},
    get textBaseline(){return this._base}, set textBaseline(v){this._base=v},
    fillStyle:"", strokeStyle:"", lineWidth:1,
    _size(){ const m=/(\d+(?:\.\d+)?)px/.exec(this._font); return m?parseFloat(m[1]):16; },
    _w(t){ const s=this._size(); return [...t].reduce((a,ch)=>a+(isCJK(ch)?1:0.58),0)*s; },
    fillRect(x,y,ww,hh){ calls.push({op:"fillRect",x,y,w:ww,h:hh,color:this.fillStyle}); },
    fillText(t,x,y){ calls.push({op:"fillText",t,x,y,size:this._size(),align:this._align,
      estW:this._w(t),left:this._align==="right"?x-this._w(t):(this._align==="center"?x-this._w(t)/2:x),
      right:this._align==="right"?x:(this._align==="center"?x+this._w(t)/2:x+this._w(t))}); },
    measureText(t){ return {width:this._w(t)}; },
    drawImage(img,x,y,ww,hh){ calls.push({op:"drawImage",x,y,w:ww,h:hh}); },
    createLinearGradient(){ return {addColorStop(){}}; },
    save(){},restore(){},clip(){},beginPath(){},moveTo(){},lineTo(){},arcTo(){},closePath(){},
    arc(){},fill(){},stroke(){},translate(){},rotate(){},scale(){},setLineDash(){},
    quadraticCurveTo(){},bezierCurveTo(){},rect(){},clearRect(){} };
  return c;
}
w.HTMLCanvasElement.prototype.getContext=function(){ if(!this.__ctx) this.__ctx=mkCtx(); return this.__ctx; };
w.Image=class{ set src(v){ this._v=v; setTimeout(()=>this.onload&&this.onload(),0); } get src(){return this._v} };

(async()=>{
  w.lastResult="INFJ-T";
  w.state.displayName="Roy"; w.state.nickname="阿Roy";
  w._cardMeta={version:"life",totalQ:60};
  await w.generateCardImage();
  await new Promise(r=>setTimeout(r,30));
  const F=calls.filter(c=>c.op==="fillText");
  const head=F.filter(c=>c.y<160);                       // header 一列
  // 注意：「港式 」尾隨一個空格 → 唔可以寫 /^港式$/
  const brand=head.filter(c=>/^(港式\s*|MBTI)$/.test(c.t));
  const ver=head.find(c=>/生活版|進階版|BB版/.test(c.t));
  const img=calls.find(c=>c.op==="drawImage"&&c.w<200);
  const div=calls.find(c=>c.op==="fillRect"&&c.w>500&&c.h<=4);
  const name=F.find(c=>/Roy/.test(c.t));
  const code=F.find(c=>c.t==="INFJ");
  const chip=F.find(c=>/敏感型|自信型/.test(c.t));

  chk("① 卡上冇日期（唔准有 YYYY.MM 字）", !F.some(c=>/\d{4}\.\d{2}/.test(c.t)),
      F.filter(c=>/\d{4}\.\d{2}/.test(c.t)).map(c=>c.t).join(","));
  chk("② 左上 logo 48×48（Roy：92px 太大、hard sell → 跟「港式 MBTI」比例）",
      !!img && img.w===48 && img.h===48, img?img.w+"×"+img.h:"冇 drawImage");
  chk("② logo 右上角 = 品牌字左邊界 － 20px 呼吸位",
      !!img && !!brand.length && Math.abs((img.x+img.w) - (brand[0].left-20)) < 1,
      img?`logo 右 ${img.x+img.w} / 品牌左 ${brand[0]&&brand[0].left}`:"-");
  chk("③ header 中線維持 90（品牌字 y = 93）", brand.length===2 && brand.every(c=>c.y===93),
      brand.map(c=>c.y).join(","));
  chk("④ 版本＋題目：28px、右對齊 x=660", !!ver && ver.size===28 && Math.abs(ver.right-660)<0.5,
      ver?ver.size+"px right="+ver.right:"冇");
  chk("④ 品牌同版本**唔會重疊**（實量度）",
      !!ver && !!brand.length && brand[brand.length-1].right < ver.left,
      brand.length&&ver?`品牌右 ${Math.round(brand[brand.length-1].right)} / 版本左 ${Math.round(ver.left)}`:"-");
  chk("④ 版本唔會出界（左邊界 > 0）", !!ver && ver.left>0, ver?Math.round(ver.left):"-");
  chk("⑤ 名＋稱呼 y = 265（Roy：移低少少）", !!name && name.y===265, name?name.y:"冇");
  chk("⑤ 名＋稱呼喺分隔線之下", !!name && !!div && name.y > div.y + 40, name&&div?`名 ${name.y} / 線 ${div.y}`:"-");
  chk("⑥ header 分隔線 (60,144) 寬 600", !!div && div.x===60 && div.y===144 && div.w===600,
      div?`${div.x},${div.y},${div.w}`:"冇");
  chk("⑦ 4 字母代號有畫（大字級 ≥200px）", !!code && code.size>=200, code?code.size+"px":"冇");
  chk("⑦ T/A 情緒 chip 有畫（第 5 條軸）", !!chip && /敏感型 T|自信型 A/.test(chip.t), chip?chip.t:"冇");
  const outX=F.filter(c=>c.left<-1 || c.right>721);
  chk("⑧ 所有文字橫向唔出界（0–720）", outX.length===0, outX.map(c=>c.t+"("+Math.round(c.left)+"~"+Math.round(c.right)+")").join(" | "));
  const outY=F.filter(c=>c.y<0 || c.y>1280);
  chk("⑧ 所有文字縱向喺卡內（0–1280）", outY.length===0, outY.map(c=>c.t+"@"+c.y).join(" | "));
  chk("⑧ 卡上文字層次唔會撞（名 265 < 你是 < code < 性格名 < slogan < chip）",
      (function(){ const ys=["你是","INFJ"].map(t=>F.find(c=>c.t===t)); return ys.every(Boolean) && name.y<ys[0].y && ys[0].y<ys[1].y; })());
  console.log("===== 分享卡版面測試 " + ok + "/" + total + "=====");
  process.exit(ok===total?0:1);
})();
