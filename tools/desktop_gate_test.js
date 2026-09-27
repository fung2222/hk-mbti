const fs=require("fs"); const {JSDOM}=require("jsdom");
const html=fs.readFileSync("/opt/data/repos/hk-mbti/index.html","utf8");
const gate=html.match(/<script>([\s\S]*?classList\.add\("dt"\)[\s\S]*?)<\/script>/)[1];
console.log("門檻 script 長度:", gate.length, "chars\n");
const SCEN=[
 {n:"手機（正常模式）",           iw:412,  sw:412,  sh:915,  scale:1,    want:false},
 {n:"手機（桌面版網站模式）",     iw:980,  sw:412,  sh:915,  scale:0.42, want:false},
 {n:"手機（桌面模式＋screen吹水）",iw:980, sw:980,  sh:1743, scale:0.42, want:false},
 {n:"平板 iPad 直向",             iw:810,  sw:810,  sh:1080, scale:1,    want:true},
 {n:"平板 iPad 橫向",             iw:1080, sw:1080, sh:810,  scale:1,    want:true},
 {n:"電腦 1440",                  iw:1440, sw:1920, sh:1080, scale:1,    want:true},
 {n:"電腦窗口縮到 700（窄）",      iw:700,  sw:1920, sh:1080, scale:1,    want:false},
 {n:"電腦窗口 1024（平板臨界）",   iw:1024, sw:1920, sh:1080, scale:1,    want:true},
];
let pass=0;
for(const s of SCEN){
  const dom=new JSDOM("<!doctype html><html><head></head><body></body></html>",{url:"https://x/",runScripts:"dangerously",pretendToBeVisual:true,
    beforeParse(w){
      Object.defineProperty(w,"innerWidth",{value:s.iw,configurable:true});
      Object.defineProperty(w,"screen",{value:{width:s.sw,height:s.sh},configurable:true});
      w.visualViewport={scale:s.scale,width:s.iw,height:s.iw*0.6};
    }});
  dom.window.eval(gate);
  const got=dom.window.document.documentElement.classList.contains("dt");
  const ok=got===s.want;
  if(ok) pass++;
  console.log((ok?"✓":"✗")+" "+s.n.padEnd(24)+" → 桌面層 "+(got?"開":"關")+(ok?"":"（預期 "+(s.want?"開":"關")+"）"));
  // 即場 resize 測試
  if(s.n==="電腦 1440"){
    Object.defineProperty(dom.window,"innerWidth",{value:700,configurable:true});
    dom.window.dispatchEvent(new dom.window.Event("resize"));
    const after=dom.window.document.documentElement.classList.contains("dt");
    console.log((after===false?"✓":"✗")+" 同一部電腦拖窄窗口 → 桌面層 "+(after?"開":"關")+"（應該關）");
    if(after===false) pass++;
  }
  dom.window.close();
}
console.log("\n"+(pass===SCEN.length+1?"✓ 全部 "+pass+" 個情境正確":"✗ 有問題"));
