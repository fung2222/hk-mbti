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
def check(name, ok, extra=""):
    global passed, total
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
        # Roy 2026-10-05：「睇下面內容」▼ 原本喺 .home-hero-copy 之外（reel-wrap 之後），
        # 被 copy 嘅 flex:1 推到畫面最底 → 手機一入 app 睇唔到，用戶唔知下面仲有內容。
        # 修法＝移入 copy（描述文字下面）。呢條守住佢，唔准再搬出去。
        dd = await pg.evaluate("""() => { const e = document.querySelector('.home-more-down');
          if(!e) return null; const r = e.getBoundingClientRect();
          return {top: Math.round(r.top), bottom: Math.round(r.bottom), vh: window.innerHeight,
                  inCopy: !!e.closest('.home-hero-copy')}; }""")
        check("390: 「睇下面內容」▼ 喺首屏見到（唔可以再被推到畫面底）",
              bool(dd) and dd["inCopy"] and dd["bottom"] < dd["vh"] - 20, str(dd))
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
        # Roy 2026-10-05：撳 ▼ 要捲到「16 式輪盤貼螢幕最頂」，下面緊接版本卡
        #（原本直接跳去版本卡，輪盤被跳過）
        _c3, _p3, _e3 = await page(390, 844, 390, 844, True)
        await _p3.evaluate("() => document.querySelector('.home-more-down').click()")
        await _p3.wait_for_timeout(1500)
        dv = await _p3.evaluate("""() => { const rw = document.getElementById('homeTypeReelWrap');
          const vl = document.getElementById('versionList');
          return {reelTop: Math.round(rw.getBoundingClientRect().top),
                  reelBottom: Math.round(rw.getBoundingClientRect().bottom),
                  verTop: Math.round(vl.getBoundingClientRect().top)}; }""")
        check("390: 撳 ▼ 之後 16 型輪盤貼螢幕最頂（0 ≤ y ≤ 40）",
              bool(dv) and 0 <= dv["reelTop"] <= 40, str(dv))
        check("390: 撳 ▼ 之後版本卡喺輪盤下面（y > 輪盤底）",
              bool(dv) and dv["verTop"] > dv["reelBottom"], str(dv))
        await _c3.close()
        await b.close()
    srv.shutdown()
    print("\n" + ("✓ 全部通過（%d 項）" % passed if passed == total else "✗ %d / %d 項失敗" % (total - passed, total)))
    sys.exit(0 if passed == total else 1)

asyncio.run(run())
