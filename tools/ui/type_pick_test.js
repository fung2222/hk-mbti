/* 型格卡「兩段式撳卡」狀態回歸測試（Roy 2026-10-02 報 bug）
   症狀：撳入 16 型其中一種、遊走完返百科 → 全部 16 張卡半透明淡化（opacity .6）
   根因：.hub-type-grid.is-picking .hub-type-card{opacity:.6} 呢個「選中其他變淡」狀態
        只有 openType() 清主頁跑馬燈（#homeTypeReel），百科格 #hubTypeGrid 冇人清；
        而 #hubTypeGrid 只喺開機 render 一次 → 一掛就成個 session 都淡。
   鐵律：任何頁面切換（show()）都必須清走 .is-picking ／ .is-on。 */
const fs=require("fs"), path=require("path");
const {JSDOM}=require("jsdom");
const REPO=path.resolve(__dirname,"../..");
let HTML=fs.readFileSync(path.join(REPO,"index.html"),"utf8");
HTML=HTML.replace(/<script src="(https?:)?\/\/[^"]*"><\/script>/g,"")
         .replace(/<script src="([^"]+\.js)"><\/script>/g,(m,f)=>fs.existsSync(path.join(REPO,f))?"<script>\n"+fs.readFileSync(path.join(REPO,f),"utf8")+"\n</script>":"");
const SRC=HTML;
let ok=0,total=0;
function chk(n,c,x){ total++; if(c)ok++; console.log((c?"✓":"✗")+" "+n+(c?"":"   <- "+(x||""))); }
const wait=ms=>new Promise(r=>setTimeout(r,ms));

// ───────── 一、靜態：唔可以再只清跑馬燈 ─────────
chk("★ 有集中清狀態嘅 clearTypePick()", /window\.clearTypePick = function/.test(SRC));
chk("★ clearTypePick 清 .is-picking（唔止 .hub-type-card.is-on）",
    /querySelectorAll\("\.is-picking"\)[\s\S]{0,120}classList\.remove\("is-picking"\)/.test(SRC));
chk("★ clearTypePick 喺 show() 有安全網（任何頁面切換都清）",
    /window\.clearTypePick && window\.clearTypePick\(\)/.test(SRC));
chk("★ openType() 唔可以只清 #homeTypeReel（舊 bug 寫法已清走）",
    !/reel\.classList\.remove\("is-picking"\)/.test(SRC));
chk("★ 撳卡 CSS 仲喺度（唔可以為咗修 bug 拆走選中效果）",
    // 選擇器係兩行（.hub-type-grid ＋ .home-type-reel）共用同一組宣告
    /\.hub-type-grid\.is-picking \.hub-type-card[\s\S]{0,90}\{[\s\S]{0,60}opacity:\.6/.test(SRC));

// ───────── 二、真跑 ─────────
(async()=>{
const dom=new JSDOM(HTML,{runScripts:"dangerously",pretendToBeVisual:true,url:"https://example.com/"});
const w=dom.window,d=w.document;
w.openHub(); await wait(30);
const grid=d.getElementById("hubTypeGrid");
const cards=grid.querySelectorAll(".hub-type-card");
chk("★ 百科格 render 咗 16 張卡", cards.length===16, "得 "+cards.length);

// ① 第一下：選中
cards[3].dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
chk("★ 撳一下 → 格掛 is-picking、嗰張卡 is-on（選中效果保留）",
    grid.classList.contains("is-picking") && cards[3].classList.contains("is-on"));

// ② 撳「進入」→ 去型格頁
cards[3].querySelector(".hub-type-go").dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
await wait(30);
chk("★ 撳「進入」真係去咗型格頁", w._showing==="type", w._showing);
chk("★ ★ 離開嗰刻格已經清乾淨（原本 bug：仲掛住 is-picking）",
    !grid.classList.contains("is-picking") && grid.querySelectorAll(".is-on").length===0);

// ③ 遊走：型格頁 → 深入分析 → 返回 → 返百科
w.openHub(); await wait(30);
chk("★ ★ 返百科後全部卡都唔會半透明（is-picking 已清）",
    !grid.classList.contains("is-picking") && grid.querySelectorAll(".is-on").length===0);

// ④ 主頁跑馬燈同一行為
w.show("home"); await wait(30);
const reel=d.getElementById("homeTypeReel");
const rc=reel.querySelectorAll(".hub-type-card");
if(rc.length){
  rc[0].dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  chk("★ 主頁跑馬燈撳一下都係選中", reel.classList.contains("is-picking") && rc[0].classList.contains("is-on"));
  rc[0].querySelector(".hub-type-go").dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
  await wait(30);
  chk("★ 主頁跑馬燈離開時都清乾淨", !reel.classList.contains("is-picking") && reel.querySelectorAll(".is-on").length===0);
  chk("★ _homeReelHold 已復位（唔會鎖住跑馬燈）", w._homeReelHold===false);
}

// ⑤ 再撳同一張卡：第二下應該取消選中（原本行為唔可以壞）
w.openHub(); await wait(30);
const c5=grid.querySelectorAll(".hub-type-card")[5];
c5.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
c5.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
chk("★ 同一張卡撳兩下 = 取消選中（原行為保留）",
    !grid.classList.contains("is-picking") && !c5.classList.contains("is-on"));

// ⑥ 換另一張卡：舊嘅要甩 is-on
const a=grid.querySelectorAll(".hub-type-card")[1], b=grid.querySelectorAll(".hub-type-card")[2];
a.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
b.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
chk("★ 換卡選中：同時只可以有一張 is-on",
    !a.classList.contains("is-on") && b.classList.contains("is-on"));

console.log("\n===== 型格卡狀態 "+ok+"/"+total+" =====");
process.exit(ok===total?0:1);
})();
