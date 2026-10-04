/* Tailwind 靜態 CSS ＋ og:image ＋ SW precache 回歸測試（2026-10-04）
   背景：原本用 cdn.tailwindcss.com（runtime JIT，407KB 每次開 app 下載＋即時生成）
        → 改為預 build 嘅 static tailwind.css；另加 og:image 分享預覽圖 */
const fs=require("fs"), path=require("path"), zlib=require("zlib");
const {JSDOM}=require("jsdom");
const REPO=path.resolve(__dirname,"../..");
const PAGES=["index.html","record.html","stats.html","tee.html","privacy.html"];
let ok=0,total=0;
function chk(n,c,x){ total++; if(c)ok++; console.log((c?"✓":"✗")+" "+n+(c?"":"   <- "+(x===undefined?"":String(x).slice(0,180)))); }
const R=f=>fs.readFileSync(path.join(REPO,f),encoding==="utf8"?f:undefined);
const read=f=>fs.readFileSync(path.join(REPO,f),"utf8");

// ───────── 一、CDN 已完全換走 ─────────
PAGES.concat(["offline.html"]).forEach(f=>{
  chk("★ "+f+" 冇再引用 cdn.tailwindcss.com", !read(f).includes("cdn.tailwindcss.com"));
});
PAGES.forEach(f=>{
  const t=read(f);
  chk("★ "+f+" 有 <link rel=\"stylesheet\" href=\"tailwind.css\"> 且喺 </head> 之前",
      t.includes('href="tailwind.css"') && t.indexOf('href="tailwind.css"')<t.indexOf("</head>"));
});
chk("★ offline.html 唔加 tailwind.css（本身自帶樣式，加咗會被 preflight reset 影響）", !read("offline.html").includes('href="tailwind.css"'));

// ───────── 二、tailwind.css 內容正確 ─────────
const css=read("tailwind.css"), gz=zlib.gzipSync(Buffer.from(css),{level:9}).length;
chk("★ tailwind.css 存在且大細合理（>8KB ，壓縮後 <12KB）", css.length>8000 && gz<12000, `${css.length} bytes / gzip ${gz}`);
chk("★ 有 Tailwind preflight（box-sizing reset）", css.includes("box-sizing:border-box"));
chk("★ 有 .hidden ／ .flex 基礎 utility", css.includes(".hidden{") && css.includes(".flex{"));
chk("★ 比 CDN 少好多（CDN 407,279 bytes JS）", css.length < 60000, css.length);

// ───────── 三、覆蓋率：凡用到嘅 Tailwind class 一定要有 rule ─────────
const siteCSS=["index.html","record.html","stats.html","tee.html","privacy.html","offline.html"]
  .map(f=>(read(f).match(/<style[^>]*>[\s\S]*?<\/style>/g)||[]).join("\n")).join("\n");
const esc=t=>t.replace(/[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~]/g,"\\$&");
const TOKRE=/^[A-Za-z0-9:_\-\[\]\/\.%#!]+$/;
const TWRE=/^(?:[a-z]+:)?(?:-)?(?:flex|grid|hidden|block|inline|relative|absolute|fixed|sticky|text-|bg-|border|rounded|p[xytrbl]?-|m[xytrbl]?-|w-|h-|min-|max-|gap-|space-|items-|justify-|self-|font-|leading-|tracking-|opacity-|overflow-|z-|top-|left-|right-|bottom-|inset-|shadow|ring|col-|row-|order-|truncate|uppercase|lowercase|capitalize|whitespace-|break-|cursor-|select-|pointer-events|transition|duration-|ease-|animate-|scale-|translate-|rotate-|aspect-|object-|align-|list-|underline|line-|decoration-|antialiased|sr-only|grid-cols|grid-rows)/;
const toks=new Set();
["index.html","record.html","stats.html","tee.html","privacy.html","offline.html"].forEach(f=>{
  const t=read(f);
  (t.match(/class="[^"]*"/g)||[]).forEach(m=>m.slice(7,-1).split(/\s+/).forEach(x=>TOKRE.test(x)&&toks.add(x)));
  (t.match(/class='[^']*'/g)||[]).forEach(m=>m.slice(7,-1).split(/\s+/).forEach(x=>TOKRE.test(x)&&toks.add(x)));
});
["index.html","data.js","social.js","premium-data.js","pair-data.js","voice-data.js","type-icons.js"].forEach(f=>{
  const src=read(f);
  (src.match(/["'`][^"'`\n]{2,300}["'`]/g)||[]).forEach(m=>{
    const v=m.slice(1,-1).replace(/^[{}() '\"]+|[{}() '\"]+$/g,"");
    if(!v.includes(" ")) return;
    const parts=v.split(/\s+/).filter(x=>TOKRE.test(x));
    if(!parts.length||parts.length>18) return;
    if(!parts.some(p=>TWRE.test(p.replace(/^!/,"")))) return;
    parts.forEach(p=>toks.add(p));
  });
});
const isDefined=t=>css.includes("."+esc(t)) || siteCSS.includes("."+t);
// 已知歷來死 class（CDN 年代一樣冇生效 → 唔准當成今次改動嘅漏網；亦唔准有新增）
const KNOWN_DEAD=new Set(["focus:border-gold","hover:bg-soft"]);
const missAll=[...toks].filter(t=>TWRE.test(t.replace(/^!/,"")) && !isDefined(t) && !/[:]/.test(t) && !KNOWN_DEAD.has(t));
chk("★ 凡用到嘅 Tailwind class 都有對應 rule（唔准有漏）", missAll.length===0, missAll.join(" , "));
const deadNow=[...toks].filter(t=>TWRE.test(t.replace(/^!/,"")) && !isDefined(t) && !/[:]/.test(t));
chk("★ 死 class 名單冇增長（現時已知："+[...KNOWN_DEAD].join("／")+"）",
    deadNow.every(t=>KNOWN_DEAD.has(t)), deadNow.filter(t=>!KNOWN_DEAD.has(t)).join(" , "));
// text-ink：2026-10-04 Roy 批准修正 —— 加一句 .text-ink{color:var(--ink)}（27 處本來就繼承 body 嘅 --ink → 零視覺變化；
// 用 var(--ink) 係關鍵：黑夜層 html.dk 會 redefine --ink，所以一個 rule 兩個主題都啱）
const idxCSS=(read("index.html").match(/<style[^>]*>[\s\S]*?<\/style>/g)||[]).join("\n");
chk("★ index.html 有 .text-ink{color:var(--ink)}（27 處唔再係死 class）", idxCSS.includes(".text-ink{color:var(--ink)}"));
chk("★ 唔准用硬編碼色（黑夜會唔跟）", !/\.text-ink\{[^}]*#[0-9a-fA-F]/.test(idxCSS));
chk("★ focus:border-gold／hover:bg-soft 依然冇 rule（同上，歷來死 class）",
    ["focus:border-gold","hover:bg-soft"].every(t=>!css.includes("."+esc(t)) && !siteCSS.includes("."+t)));

// ───────── 四、SW precache ─────────
const sw=read("sw.js");
chk("★ sw.js precache 有 pair-data.js（配對深入離線都睇到）", sw.includes('"/hk-mbti/pair-data.js"'));
chk("★ sw.js precache 有 tailwind.css（離線樣式唔會消失）", sw.includes('"/hk-mbti/tailwind.css"'));
const assetsArr=(sw.split("const ASSETS = [")[1]||"").split("];")[0];
const assets=(assetsArr.match(/"[^"]+"/g)||[]);
chk("★ SW ASSETS 冇重複", assets.length===new Set(assets).size, assets.join(","));
chk("★ SW 用 allSettled 逐個 precache（唔會一個 404 拖死全部）", sw.includes("allSettled"));
chk("★ SW cache 名仍然係 hk-mbti-v2.0.0（四處版本一致，冇 bump）", sw.includes('hk-mbti-v2.0.0'));

// ───────── 五、og:image／分享預覽 ─────────
const BASE="https://fung2222.github.io/hk-mbti";
PAGES.forEach(f=>{
  const t=read(f);
  chk("★ "+f+" 有 og:image 絕對網址", t.includes(`<meta property="og:image" content="${BASE}/og-image.png">`));
});
chk("★ index.html 有 og:image:width/height（1200×630）", read("index.html").includes('og:image:width" content="1200') && read("index.html").includes('og:image:height" content="630'));
chk("★ 五頁都有 twitter:card=summary_large_image ＋ twitter:image", PAGES.every(f=>read(f).includes('name="twitter:card" content="summary_large_image"') && read(f).includes('name="twitter:image"')));
const png=fs.readFileSync(path.join(REPO,"og-image.png"));
const w=png.readUInt32BE(16), h=png.readUInt32BE(20);
chk("★ og-image.png 真係 1200×630 PNG", png.slice(1,4).toString()==="PNG" && w===1200 && h===630, `${png.slice(1,4)} ${w}x${h}`);
chk("★ og-image.png 大細合理（<400KB）", png.length<400000, png.length);

// ───────── 六、真跑：app 冇壞 ─────────
const RAW=read("index.html");
const HTML=RAW.replace(/<script src="(https?:)?\/\/[^"]*"><\/script>/g,"")
  .replace(/<link rel="stylesheet" href="(https?:)?\/\/[^"]*">/g,"")
  .replace(/<script src="([^"]+\.js)"><\/script>/g,(m,f)=>fs.existsSync(path.join(REPO,f))?"<script>\n"+fs.readFileSync(path.join(REPO,f),"utf8")+"\n</script>":"");
const dom=new JSDOM(HTML,{runScripts:"dangerously",pretendToBeVisual:true,url:"https://example.com/"});
const w2=dom.window;
chk("★ 真跑：app boot 得起（renderResult 有定義）", typeof w2.renderResult==="function");
chk("★ 真跑：QUESTIONS 載入（>0 題）", (w2.QUESTIONS||[]).length>0, (w2.QUESTIONS||[]).length);
chk("★ 真跑：PAIRS 載入（≥16 篇）", Object.keys(w2.PAIRS||{}).length>=16, Object.keys(w2.PAIRS||{}).length);
w2.openPair("INFP","ENFP");
chk("★ 真跑：配對文章開得到", /最容易撞嘅 3 個位/.test(w2.document.getElementById("pairBody").innerHTML));

console.log("\n===== " + (ok===total?"全部通過":"有失敗") + " " + ok + "/" + total + " =====");
process.exit(ok===total?0:1);
