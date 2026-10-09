#!/usr/bin/env python3
"""
桌面排版「真實位置」測試 —— tools/desktop_render_test.py（真 Chrome + Playwright）

量度真正 render 出嚟嘅位置（jsdom 做唔到）。**斷言設計意圖，唔黐死會變嘅數字**：
  · 滑輪：可橫滑（scrollWidth > clientWidth）、單行、等闊、無縫複本（前半 == 後半）、卡 9:16 直角
  · 探索更多：可見格數 == 當下 CSS repeat(N)（由 computed gridTemplateColumns 讀，唔寫死 5／8）
  · 導覽：由 computed style 讀（唔抄文件、唔寫死 1280）

  • 1440 / 1024：hero 喺版本卡上面、文案左／滑輪右、版本卡等高、情景 4 欄、
    show('test') / show('hub') 之後 #home 真係收埋
  • 1024 / 1280 / 1440 / 1920：冇橫向 scrollbar（主頁、百科、測試頁、結果頁、類型頁）
  • 768 平板：有導覽／頁尾、探索更多 3+2 置中、冇橫向 scroll；390 手機：完全冇 .dt
需要：playwright；Chrome（預設 /usr/bin/google-chrome，可用 CHROME=… 改）
執行：python3 tools/desktop_render_test.py
"""
import asyncio, functools, http.server, os, sys, threading
from playwright.async_api import async_playwright

REPO = os.environ.get("HKMBTI_REPO") or os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CHROME = os.environ.get("CHROME", "/usr/bin/google-chrome")
BLOCK = ("goatcounter", "gc.zgo.at", "googlesyndication", "googletagmanager", "google-analytics")
passed = total = 0
# ONLY=<關鍵字> 只跑名含該關鍵字嘅斷言（快速迭代用；唔相關嘅唔計入 total，唔影響 exit code）
# 例：ONLY=弱項 python3 tools/desktop_render_test.py
ONLY = os.environ.get("ONLY", "").strip()
def check(name, ok, extra=""):
    global passed, total
    if ONLY and ONLY not in name:
        return
    total += 1; passed += bool(ok)
    print(("✓ " if ok else "✗ ") + name + ("" if ok else "   ← " + str(extra)))

def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=REPO))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % srv.server_address[1]

GEOM = r"""()=>{const R=e=>{if(!e)return null;const r=e.getBoundingClientRect();return {x:r.left,y:r.top+scrollY,w:r.width,h:r.height,r:r.right,b:r.bottom+scrollY}};
const vis=e=>e&&getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().height>0;
const q=s=>document.querySelector(s), qa=s=>[...document.querySelectorAll(s)];
const cs=e=>e?getComputedStyle(e):null;
const reel=q('#homeTypeReel');
const cards=qa('#homeTypeReel .hub-type-card').filter(vis);
const acc=qa('#homeAccordion .home-acc-item');
const accBox=q('#homeAccordion');
const gtc=accBox?(cs(accBox).gridTemplateColumns||''):'';
return {dt:document.documentElement.classList.contains('dt'),
 sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,
 nav:vis(q('#dtNav')),foot:vis(q('#dtFoot')),rows:vis(q('#dtTypeRows')),
 navDisp:q('#dtNav')?cs(q('#dtNav')).display:null,footDisp:q('#dtFoot')?cs(q('#dtFoot')).display:null,
 rowsDisp:q('#dtTypeRows')?cs(q('#dtTypeRows')).display:null,
 hero:R(q('.home-hero')),copy:R(q('.home-hero-copy')),reel:R(reel),below:R(q('#homeBelow')),
 reelSW:reel?reel.scrollWidth:0,reelCW:reel?reel.clientWidth:0,reelOX:reel?cs(reel).overflowX:null,
 cards:cards.map(R),
 codes:cards.map(c=>{const e=c.querySelector('.hub-type-code');return e?e.textContent.trim():''}),
 aspects:cards.map(c=>{const r=c.getBoundingClientRect();return r.width?r.height/r.width:0}),
 radius:cards.length?cs(cards[0]).borderTopLeftRadius:null,
 vers:qa('#versionList > .ver-btn').map(R),
 scenes:qa('.scenes-grid .scene-cell').map(R),
 accItems:acc.map(R), accCols:gtc.trim()?gtc.trim().split(/\s+/).length:0,
 go:qa('#homeAccordion .home-acc-go').map(R)}}"""
AFTER = """(id)=>{show(id);const h=document.getElementById('home'),t=document.getElementById(id);
return {homeDisp:getComputedStyle(h).display,homeH:h.getBoundingClientRect().height,
 top:t.getBoundingClientRect().top+scrollY,sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}}"""

def near(a, b, tol=1.5): return abs(a - b) <= tol

def rows_by_y(items):
    ys = sorted(set(round(k["y"]) for k in items))
    return [[k for k in items if round(k["y"]) == y] for y in ys]

async def run():
    srv, url = serve()
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME)
        async def page(w, h, sw, sh, mobile=False):
            ctx = await b.new_context(viewport={"width": w, "height": h}, screen={"width": sw, "height": sh},
                                      is_mobile=mobile, has_touch=mobile, service_workers="block")
            async def rt(route):
                if any(k in route.request.url for k in BLOCK): await route.abort()
                else: await route.continue_()
            await ctx.route("**/*", rt)
            pg = await ctx.new_page(); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(url, wait_until="networkidle"); await pg.wait_for_timeout(900)
            return ctx, pg, errs

        for W, H in ((1440, 900), (1024, 768)):
            print("\n=== %dpx ===" % W)
            ctx, pg, errs = await page(W, H, 1920, 1080)
            g = await pg.evaluate(GEOM)
            check("%d: html.dt 開咗、導覽同頁尾顯示" % W, g["dt"] and g["nav"] and g["foot"])
            hb = max(g["copy"]["b"], g["reel"]["b"])
            check("%d: hero（文案 + 16 型）喺版本卡上面" % W, hb <= g["below"]["y"] + 1, (hb, g["below"]["y"]))
            check("%d: 文案喺左、16 型喺右" % W, g["copy"]["r"] <= g["reel"]["x"])
            c, codes = g["cards"], g["codes"]
            n = len(c); half = n // 2
            check("%d: 滑輪有複本（≥17 張先可無縫循環）" % W, n >= 17, n)
            check("%d: 無縫複本（前半 == 後半、前半無重複）" % W,
                  half > 0 and codes[:half] == codes[half:] and len(set(codes[:half])) == half, (half, codes[:8]))
            check("%d: 滑輪可橫滑（scrollWidth > clientWidth）" % W, g["reelSW"] > g["reelCW"], (g["reelSW"], g["reelCW"]))
            check("%d: 滑輪 overflow-x 可滾" % W, g["reelOX"] in ("auto", "scroll"), g["reelOX"])
            check("%d: 卡排成單行（同一 y）" % W, len(set(round(k["y"]) for k in c)) == 1,
                  sorted(set(round(k["y"]) for k in c))[:6])
            check("%d: 卡等闊" % W, max(k["w"] for k in c) - min(k["w"] for k in c) < 1,
                  sorted(set(round(k["w"]) for k in c))[:6])
            check("%d: 卡 9:16（h/w ≈ 16/9，容差 0.03）" % W,
                  all(abs(a - 16 / 9) < 0.03 for a in g["aspects"]), g["aspects"][:4])
            check("%d: 卡直角（border-radius 0）" % W, g["radius"] in ("0px", "0"), g["radius"])
            v = g["vers"]
            check("%d: 版本卡 4 張等高" % W, len(v) == 4 and max(k["h"] for k in v) - min(k["h"] for k in v) < 1, [k["h"] for k in v])
            s = g["scenes"]
            check("%d: 情景 4 欄（同一行）" % W, len(s) == 4 and len(set(round(k["y"]) for k in s)) == 1 and len(set(round(k["x"]) for k in s)) == 4)
            a = g["accItems"]
            check("%d: 探索更多可見格數 == CSS repeat(N)（%d 欄）" % (W, g["accCols"]),
                  g["accCols"] > 0 and len(a) == g["accCols"] and len(set(round(k["y"]) for k in a)) == 1,
                  (len(a), g["accCols"], sorted(set(round(k["y"]) for k in a))))
            check("%d: 探索更多方塊等高" % W, max(k["h"] for k in a) - min(k["h"] for k in a) < 1, [round(k["h"]) for k in a])
            gb = rows_by_y(g["go"])
            check("%d: 探索更多連結貼底（每行連結底部對齊）" % W,
                  all(len(set(round(k["b"]) for k in row)) == 1 for row in gb) and len(gb) == len(set(round(k["y"]) for k in a)), [round(k["b"]) for k in g["go"]])
            for sid in ("test", "hub"):
                r = await pg.evaluate(AFTER, sid)
                check("%d: show('%s') 之後 #home 收埋、%s 喺頂部" % (W, sid, sid), r["homeDisp"] == "none" and r["top"] < 200, r)
            await pg.evaluate("goHome()")
            check("%d: 零 JS error" % W, not errs, errs[:1])
            await ctx.close()

        print("\n=== 冇橫向 scrollbar ===")
        for W in (1024, 1280, 1440, 1920):
            ctx, pg, errs = await page(W, 900, 1920, 1080)
            bad = []
            g = await pg.evaluate(GEOM)
            if g["sw"] > g["cw"]: bad.append(("home", g["sw"], g["cw"]))
            for sid in ("hub", "test", "result", "type"):
                r = await pg.evaluate(AFTER, sid)
                if r["sw"] > r["cw"]: bad.append((sid, r["sw"], r["cw"]))
            check("%d: 主頁／百科／測試／結果／類型頁都冇橫向 scroll" % W, not bad, bad)
            await ctx.close()

        print("\n=== 平板 768 / 手機 390 ===")
        ctx, pg, errs = await page(768, 1024, 768, 1024, True)
        g = await pg.evaluate(GEOM)
        check("768: 平板開 .dt、導覽同頁尾都顯示（2026-10-04 起平板另一套）",
              g["dt"] and g["nav"] and g["foot"], (g["dt"], g["navDisp"], g["footDisp"]))
        check("768: 情景 2 欄", len(set(round(k["x"]) for k in g["scenes"])) == 2)
        check("768: 冇橫向 scroll", g["sw"] <= g["cw"], (g["sw"], g["cw"]))
        rows = rows_by_y(g["accItems"])
        check("768: 探索更多 3+2（上排多過下排、下排置中）",
              len(rows) == 2 and len(rows[0]) > len(rows[1]) and len(rows[1]) > 0, [len(r) for r in rows])
        if len(rows) == 2:
            insetL = min(k["x"] for k in rows[1]) - min(k["x"] for k in rows[0])
            insetR = max(k["r"] for k in rows[0]) - max(k["r"] for k in rows[1])
            check("768: 下排左右內縮對稱（< 8px）", abs(insetL - insetR) < 8 and insetL > 0, (insetL, insetR))
        r = await pg.evaluate(AFTER, "test")
        check("768: show('test') 之後 #home 收埋", r["homeDisp"] == "none", r)
        await ctx.close()
        ctx, pg, errs = await page(390, 844, 390, 844, True)
        g = await pg.evaluate(GEOM)
        check("390: 手機冇 .dt；導覽／頁尾／組別標籤全部 display:none",
              not g["dt"] and not g["nav"] and not g["foot"] and not g["rows"],
              (g["dt"], g["navDisp"], g["footDisp"], g["rowsDisp"]))
        # Roy 2026-10-07：hero 個 ▼ 改成「立即測試」金掣（跟桌面 .dt-cta-gold 一致）。
        # 守門：① 要喺 hero copy 入面、首屏見得到（唔准再被推到畫面底）
        #       ② 文字係「立即測試」 ③ 真係金底深字（對比 >= 4.5），唔准變返三角／透明
        dd = await pg.evaluate("""() => { const e = document.querySelector('.home-cta-test');
          if(!e) return null; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
          const lum = t => { const m=(t||'').match(/[0-9]+/g); if(!m) return null;
            const q=[+m[0],+m[1],+m[2]].map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});
            return 0.2126*q[0]+0.7152*q[1]+0.0722*q[2]; };
          const L1=lum(cs.backgroundColor), L2=lum(cs.color);
          return {text:e.textContent.trim(), bottom:Math.round(r.bottom), vh:window.innerHeight,
                  inCopy:!!e.closest('.home-hero-copy'), bg:cs.backgroundColor, color:cs.color,
                  cr:(L1!=null&&L2!=null)?Math.round(((Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05))*100)/100:null}; }""")
        check("390: 「立即測試」掣喺 hero 首屏見到（唔可以被推到畫面底）",
              bool(dd) and dd["inCopy"] and dd["bottom"] < dd["vh"] - 20, str(dd))
        check("390: hero 掣文字 = 「立即測試」", bool(dd) and dd["text"] == "立即測試", str(dd and dd["text"]))
        check("390: 「立即測試」掣係金底深字（對比 >= 4.5）",
              bool(dd) and dd["cr"] is not None and dd["cr"] >= 4.5, str(dd))
        # 2026-10-07：桌面金掣喺黑夜模式原本用 var(--ink)（淺色）→ 對比 1.62 睇唔到。
        # 涵蓋 hero「立即測試」（.dt-cta-gold）同 sticky 導覽嗰粒（.dt-nav-cta）。
        _c5, _p5, _e5 = await page(1440, 900, 1440, 900)
        await _p5.evaluate("() => document.documentElement.classList.add('dk')")
        await _p5.wait_for_timeout(300)
        gb = await _p5.evaluate("""() => {
          const lum=t=>{const m=(t||'').match(/[0-9]+/g); if(!m) return null;
            const q=[+m[0],+m[1],+m[2]].map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});
            return 0.2126*q[0]+0.7152*q[1]+0.0722*q[2];};
          const one=s=>{const e=document.querySelector(s); if(!e) return null; const cs=getComputedStyle(e);
            const L1=lum(cs.backgroundColor), L2=lum(cs.color);
            return {bg:cs.backgroundColor, color:cs.color,
                    cr:(L1!=null&&L2!=null)?Math.round(((Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05))*100)/100:null};};
          return {hero: one('.dt-cta-gold'), nav: one('.dt-nav-cta')}; }""")
        check("黑夜桌面: hero 金掣文字對比 >= 4.5（原本 1.62，睇唔到）",
              bool(gb) and bool(gb["hero"]) and gb["hero"]["cr"] >= 4.5, str(gb and gb.get("hero")))
        check("黑夜桌面: 導覽金掣文字對比 >= 4.5（原本 1.62，睇唔到）",
              bool(gb) and bool(gb["nav"]) and gb["nav"]["cr"] >= 4.5, str(gb and gb.get("nav")))
        await _c5.close()
        await ctx.close()
        # Roy 2026-10-05：一開 app 就要見到「成個」16 型輪盤（唔可以被推出螢幕底）。
        # 靠 .home-hero 底部 padding（輪盤底離螢幕底 52px）＋ copy flex:1 吸收剩餘空間。
        for _w, _h in [(390, 844), (390, 700), (360, 600)]:
            _c, _p, _e = await page(_w, _h, _w, _h, True)
            rr = await _p.evaluate("""() => { const e = document.getElementById('homeTypeReelWrap');
              if(!e) return null; const r = e.getBoundingClientRect();
              return {bottom: Math.round(r.bottom), vh: window.innerHeight, h: Math.round(r.height)}; }""")
            check("%d×%d: 16 型輪盤首屏完整（唔可以被推出螢幕）" % (_w, _h),
                  bool(rr) and rr["bottom"] <= rr["vh"], str(rr))
            await _c.close()
        # Roy 2026-10-05（桌面兩報）：① 輪盤完全唔自動轉（scrollLeft 被 round 成整數
        #   → reel.scrollLeft += 0.441 等於 += 0）② 桌面卡片間距要收窄一半（12 → 6px）。
        # 呢條係唯一真正驗「會轉」嘅測試（jsdom 冇 scroll 行為）。
        _c2, _p2, _e2 = await page(1440, 900, 1440, 900)
        g0 = await _p2.evaluate("""() => { const r = document.getElementById('homeTypeReel');
          return {sl: r.scrollLeft, gap: getComputedStyle(r).columnGap}; }""")
        await _p2.wait_for_timeout(2000)
        sl1 = await _p2.evaluate("() => document.getElementById('homeTypeReel').scrollLeft")
        check("1440: 桌面輪盤會自動轉（唔可以被 scrollLeft rounding 卡死）",
              abs(sl1 - g0["sl"]) > 20, "%s → %s" % (g0["sl"], sl1))
        check("1440: 桌面卡片間距 = 6px（Roy：收窄一半）", g0["gap"] == "6px", g0["gap"])
        await _c2.close()
        # Roy 2026-10-07（改返 10-05 個決定）：撳「立即測試」→ 捲到「測試版本卡貼螢幕最頂」，
        # 16 型輪盤要捲到畫面上面（唔再停留喺頂）。守門用生效幾何值，唔靠 class。
        _c3, _p3, _e3 = await page(390, 844, 390, 844, True)
        await _p3.evaluate("() => document.querySelector('.home-cta-test').click()")
        await _p3.wait_for_timeout(1500)
        dv = await _p3.evaluate("""() => { const hb = document.getElementById('homeBelow');
          const rw = document.getElementById('homeTypeReelWrap');
          const fv = document.querySelector('#versionList .ver-btn');
          return {cardTop: Math.round(hb.getBoundingClientRect().top),
                  reelBottom: Math.round(rw.getBoundingClientRect().bottom),
                  firstVerTop: Math.round(fv.getBoundingClientRect().top)}; }""")
        check("390: 撳「立即測試」之後 測試版本卡貼螢幕最頂（-8 ≤ y ≤ 40）",
              bool(dv) and -8 <= dv["cardTop"] <= 40, str(dv))
        check("390: 撳「立即測試」之後 16 型輪盤已捲到畫面上面（唔再係最頂）",
              bool(dv) and dv["reelBottom"] <= 40, str(dv))
        check("390: 撳「立即測試」之後 第一張版本卡喺螢幕內（即刻揀到）",
              bool(dv) and 0 <= dv["firstVerTop"] <= 420, str(dv))
        await _c3.close()
        # Roy 2026-10-05：第二個 ▼ —— 放喺版本卡最底（正常位置，唔係浮動），
        # 睇落似螢幕最底；撳 → 捲到「多種港式日常情景」。
        _c4, _p4, _e4 = await page(390, 844, 390, 844, True)
        await _p4.evaluate("() => document.querySelector('.home-cta-test').click()")
        await _p4.wait_for_timeout(1400)
        nd1 = await _p4.evaluate("""() => { const nd = document.querySelector('.home-next-down');
          const nb = nd.getBoundingClientRect(); const vb = document.getElementById('homeBelow').getBoundingClientRect();
          return {pos: getComputedStyle(nd).position, ndTop: Math.round(nb.top),
                  verBottom: Math.round(vb.bottom), below: Math.round(nb.top) >= Math.round(vb.bottom),
                  visible: Math.round(nb.bottom) <= window.innerHeight}; }""")
        check("390: 第二個 ▼ 喺版本卡最底（正常位置 static，唔係浮動）",
              bool(nd1) and nd1["pos"] == "static" and nd1["below"], str(nd1))
        check("390: 撳主頁 ▼ 之後，第二個 ▼ 喺螢幕內見到", bool(nd1) and nd1["visible"], str(nd1))
        await _p4.evaluate("() => document.querySelector('.home-next-down').click()")
        await _p4.wait_for_timeout(1500)
        nd2 = await _p4.evaluate("() => Math.round(document.querySelector('#home .scenes-bleed').getBoundingClientRect().top)")
        check("390: 撳第二個 ▼ → 捲到「多種港式日常情景」貼頂", abs(nd2) <= 30, str(nd2))
        # Roy 2026-10-07：「上次未完成」卡同版本卡黐得太貼（原本 6px）→ 28px；
        # 測試區下面個 ▼ 上下空間加大（上 20 / 下 32）。全部量生效值（唔靠 class 在唔在）。
        await _p4.evaluate("""() => { try{ localStorage.setItem('hkmbti_test_progress',
            JSON.stringify({version:'life', idx:5, answers:[0,0,0,0,0,0], deck:['a','b','c','d','e','f'], savedAt:Date.now()})); }catch(e){}
          if(window.refreshResumeBanner) window.refreshResumeBanner(); }""")
        await _p4.wait_for_timeout(300)
        gp = await _p4.evaluate("""() => {
          const card = document.getElementById('homeBelow').getBoundingClientRect();
          const rb = document.getElementById('resumeBanner');
          const nd = document.querySelector('.home-next-down');
          if(rb.classList.contains('hidden')) return {err:'未完成卡冇顯示'};
          const cs = getComputedStyle(nd);
          return {gap: Math.round(rb.getBoundingClientRect().top - card.bottom),
                  ndMt: cs.marginTop, ndMb: cs.marginBottom}; }""")
        check("390: 「上次未完成」卡同版本卡之間 >= 24px（Roy：原本太貼唔好睇）",
              bool(gp) and gp.get("gap", 0) >= 24, str(gp))
        check("390: 測試區下面個 ▼ 上下空間 = 20px / 32px",
              bool(gp) and gp.get("ndMt") == "20px" and gp.get("ndMb") == "32px", str(gp))
        # 2026-10-06 Roy：強項／弱項 下面要有留白（原本同下面「個人化報告」黐實 0px）
        # 量度意圖（留白 >= 16px），唔黐死某個實作（margin 出邊度做都得）
        RESULT_FIX = {"mbti":"INFP-A","pct":{"EI":[40,60],"SN":[35,65],"TF":[70,30],"JP":[80,20],"TA":[62,38]},
                      "closeAxes":[],"score":{},"version":"life","totalQ":60,"name":"Roy"}
        await _p4.evaluate("(r)=>{ window.renderResult(r); window.show('result'); }", RESULT_FIX)
        await _p4.wait_for_timeout(400)
        sp = await _p4.evaluate("""() => {
          const boxes=[...document.querySelectorAll('#personalityDetail .pros-box')];
          const last=boxes[boxes.length-1], pr=document.getElementById('personalReport');
          if(!last||!pr) return null;
          const gr=last.closest('.pros-grid');
          return {gap:Math.round(pr.getBoundingClientRect().top-last.getBoundingClientRect().bottom),
                  marB:gr?getComputedStyle(gr).marginBottom:null, n:boxes.length};
        }""")
        check("390: 強項／弱項 下面有 >=16px 留白（唔同下面張卡黐實）",
              bool(sp) and sp["gap"] >= 16, str(sp))
        # 2026-10-06 Roy：黑夜模式「弱項」欄原本睇落冇底（inline 3% 深藍喺深底上 = 0）
        # 意圖：兩個框都要同頁面底有可見差別（唔綁死某個顏色值）
        for _mode, _need in (("dark", 0.003), ("light", 0.003)):
            await _p4.evaluate("(m)=>{ document.documentElement.classList.toggle('dk', m==='dark'); }", _mode)
            await _p4.evaluate("(r)=>{ window.renderResult(r); window.show('result'); }", RESULT_FIX)
            await _p4.wait_for_timeout(350)
            _pb = await _p4.evaluate("""() => {
          const lum=c=>{const q=c.map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});return 0.2126*q[0]+0.7152*q[1]+0.0722*q[2];};
          const parse=s=>{const m=(s||'').match(/rgba?[(]([^)]+)[)]/);if(!m)return null;const p=m[1].split(',').map(Number);return {c:[p[0],p[1],p[2]],a:p.length>3?p[3]:1};};
          const blend=(f,b,a)=>f.map((v,i)=>v*a+b[i]*(1-a));
          const pb=parse(getComputedStyle(document.body).backgroundColor); const page=pb?pb.c:[255,255,255];
          const one=k=>{const el=document.querySelector('#personalityDetail .pros-box.is-'+k); if(!el) return null;
            const o=parse(getComputedStyle(el).backgroundColor); const vis=o?blend(o.c,page,o.a):page;
            return Math.round(Math.abs(lum(vis)-lum(page))*10000)/10000;};
          return {str:one('str'), wk:one('wk')};
        }""")
            check("%s: 強項欄有可見底色框（同頁面底有差別）" % _mode,
                  bool(_pb) and _pb["str"] is not None and _pb["str"] >= _need, str(_pb))
            check("%s: 弱項欄有可見底色框（唔可以其中一欄消失）" % _mode,
                  bool(_pb) and _pb["wk"] is not None and _pb["wk"] >= _need, str(_pb))
        await _c4.close()

        # 桌面層最容易自己 override 間距 -> 同一條意圖喺 1440 再驗一次
        _c5, _p5, _e5 = await page(1440, 900, 1920, 1080)
        await _p5.evaluate("(r)=>{ window.renderResult(r); window.show('result'); }", RESULT_FIX)
        await _p5.wait_for_timeout(400)
        sp5 = await _p5.evaluate("""() => {
          const boxes=[...document.querySelectorAll('#personalityDetail .pros-box')];
          const last=boxes[boxes.length-1], pr=document.getElementById('personalReport');
          if(!last||!pr) return null;
          const gr=last.closest('.pros-grid');
          return {gap:Math.round(pr.getBoundingClientRect().top-last.getBoundingClientRect().bottom),
                  marB:gr?getComputedStyle(gr).marginBottom:null, n:boxes.length};
        }""")
        check("1440: 強項／弱項 下面有 >=16px 留白（桌面層冇 override 走）",
              bool(sp5) and sp5["gap"] >= 16, str(sp5))
        await _c5.close()

        # 2026-10-06 Roy 報「色調太淺好難睇」：關於頁「本站廣東話版」卡唔係 .card，
        # 黑夜模式蓋唔到佢個淺忌廉漸變 -> 卡內文字變淺 = 淺字淺底（實測對比 1.2）。
        _c6, _p6, _e6 = await page(390, 844, 390, 844, True)
        dk_res = {}
        for _mode in ("dark", "light"):
            await _p6.evaluate("(m)=>{ document.documentElement.classList.toggle('dk', m==='dark'); try{window.openAbout();}catch(e){} }", _mode)
            await _p6.wait_for_timeout(300)
            dk_res[_mode] = await _p6.evaluate("""() => {
          const card=document.querySelector('#about .about-cmp-card');
          if(!card) return null;
          const cs=getComputedStyle(card);
          const cols=(cs.backgroundImage.match(/rgba?[(][^)]+[)]/g)||[]).map(c=>c.match(/[0-9.]+/g).map(Number).slice(0,3));
          if(!cols.length) return {noGradient:true};
          const lum=p=>{const q=p.map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});return 0.2126*q[0]+0.7152*q[1]+0.0722*q[2];};
          const cr=(a,b)=>{const x=lum(a),y=lum(b);const hi=Math.max(x,y),lo=Math.min(x,y);return (hi+0.05)/(lo+0.05);};
          const rgb=el=>(getComputedStyle(el).color.match(/[0-9.]+/g)||[]).map(Number).slice(0,3);
          const worst=el=>Math.min(...cols.map(c=>cr(rgb(el),c)));
          return {stops:cols.map(c=>c.map(Math.round)), mean:Math.round(cols.map(c=>(c[0]+c[1]+c[2])/3).reduce((a,b)=>a+b,0)/cols.length),
                  titleCr:Math.round(worst(card.querySelector('.font-bold'))*100)/100,
                  liCr:Math.round(worst(card.querySelector('li'))*100)/100};
        }""")
        check("黑夜：關於頁「本站廣東話版」卡係深底（唔可以淺底留喺黑夜）",
              bool(dk_res["dark"]) and dk_res["dark"].get("mean") is not None and dk_res["dark"]["mean"] < 120,
              str(dk_res["dark"]))
        check("黑夜：卡內標題對比 >= 4.5（金標喺深底讀得到）",
              bool(dk_res["dark"]) and dk_res["dark"].get("titleCr", 0) >= 4.5, str(dk_res["dark"]))
        check("黑夜：卡內文對比 >= 4.5",
              bool(dk_res["dark"]) and dk_res["dark"].get("liCr", 0) >= 4.5, str(dk_res["dark"]))
        check("日光：卡底仍然係原本淺忌廉漸變（唔准改走日光設計）",
              bool(dk_res["light"]) and dk_res["light"].get("mean") is not None and dk_res["light"]["mean"] > 200,
              str(dk_res["light"]))
        # 2026-10-07 日光模式金標加深：日光要 >= 4.5；黑夜要保持原本淺金（唔准被日光規則漏入）
        _GOLDJS = """() => {
          const parse=s=>{const m=(s||'').match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);if(!m)return null;const p=[+m[1],+m[2],+m[3]];return {c:p,a:m[4]===undefined?1:+m[4]};};
          const lum=c=>{const q=c.map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});return 0.2126*q[0]+0.7152*q[1]+0.0722*q[2];};
          const cr=(a,b)=>{const x=lum(a),y=lum(b),hi=Math.max(x,y),lo=Math.min(x,y);return (hi+0.05)/(lo+0.05);};
          const stops=g=>{if(!g||g==='none')return null;const m=g.match(/rgba?\([^)]+\)/g)||[];return m.map(parse).filter(x=>x&&x.a>0.05).map(x=>x.c);};
          const bgs=el=>{const out=[];let n=el;
            while(n&&n.nodeType===1){const st=stops(getComputedStyle(n).backgroundImage); if(st)st.forEach(c=>out.push(c));
              const b=parse(getComputedStyle(n).backgroundColor); if(b&&b.a>0.9){out.push(b.c);break;} n=n.parentElement;}
            if(!out.length)out.push([255,255,255]); return out;};
          const els=[...document.querySelectorAll('#about .brand-gold')];
          let min=99,n=0,col=null;
          els.forEach(el=>{const cs=getComputedStyle(el); const c=parse(cs.color); if(!c)return; n++;
            if(!col)col=cs.color;
            bgs(el).forEach(b=>{const k=cr(c.c,b); if(k<min)min=k;});});
          return {n:n, min:Math.round(min*100)/100, color:col};
        }"""
        await _p6.evaluate("()=>{document.documentElement.classList.remove('dk');}")
        await _p6.wait_for_timeout(200)
        _gl = await _p6.evaluate(_GOLDJS)
        check("日光：關於頁金色標籤對比 >= 4.5（以前 2.11，淺金落米底睇唔到）",
              bool(_gl) and _gl.get("n", 0) > 0 and _gl.get("min", 0) >= 4.5, str(_gl))
        await _p6.evaluate("()=>{document.documentElement.classList.add('dk');}")
        await _p6.wait_for_timeout(200)
        _gd = await _p6.evaluate(_GOLDJS)
        check("黑夜：金色標籤仍然係原本淺金 #D9B26A（唔准被日光加深規則漏入）",
              bool(_gd) and "217, 178, 106" in str(_gd.get("color")), str(_gd))
        check("黑夜：金色標籤對比 >= 4.5", bool(_gd) and _gd.get("min", 0) >= 4.5, str(_gd))
        await _c6.close()
        await b.close()
    srv.shutdown()
    _scope = ("（ONLY=%s 局部）" % ONLY) if ONLY else ""
    print("\n" + ("✓ 全部通過（%d 項）%s" % (passed, _scope) if passed == total else "✗ %d / %d 項失敗%s" % (total - passed, total, _scope)))
    sys.exit(0 if passed == total else 1)

asyncio.run(run())
