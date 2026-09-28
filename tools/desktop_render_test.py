#!/usr/bin/env python3
"""
桌面排版「真實位置」測試 —— tools/desktop_render_test.py（真 Chrome + Playwright）

量度真正 render 出嚟嘅位置（jsdom 做唔到）：
  • 1440 / 1024：hero 喺版本卡上面、16 張卡 4 欄等闊而且填滿格仔、版本卡等高、
    情景 4 欄、探索更多 4×2 等高、show('test') / show('hub') 之後 #home 真係收埋
  • 1024 / 1280 / 1440 / 1920：冇橫向 scrollbar（主頁、百科、測試頁）
  • 768 平板：冇導覽、#home 收得埋、情景 2 欄；390 手機：完全冇 .dt
需要：pip install playwright；Chrome（預設 /usr/bin/google-chrome，可用 CHROME=… 改）
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

GEOM = """()=>{const R=e=>{if(!e)return null;const r=e.getBoundingClientRect();return {x:r.left,y:r.top+scrollY,w:r.width,h:r.height,r:r.right,b:r.bottom+scrollY}};
const vis=e=>e&&getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().height>0;
const q=s=>document.querySelector(s), qa=s=>[...document.querySelectorAll(s)];
return {dt:document.documentElement.classList.contains('dt'),
 sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,
 nav:vis(q('#dtNav')),foot:vis(q('#dtFoot')),rows:vis(q('#dtTypeRows')),
 hero:R(q('.home-hero')),copy:R(q('.home-hero-copy')),reel:R(q('#homeTypeReel')),below:R(q('#homeBelow')),
 cards:qa('#homeTypeReel .hub-type-card').filter(vis).map(R),
 vers:qa('#versionList > .ver-btn').map(R),
 scenes:qa('.scenes-grid .scene-cell').map(R),
 acc:qa('#homeAccordion .home-acc-item').map(R),
 go:qa('#homeAccordion .home-acc-go').map(R)}}"""
AFTER = """(id)=>{show(id);const h=document.getElementById('home'),t=document.getElementById(id);
return {homeDisp:getComputedStyle(h).display,homeH:h.getBoundingClientRect().height,
 top:t.getBoundingClientRect().top+scrollY,sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}}"""

def near(a, b, tol=1.5): return abs(a - b) <= tol

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
            c = g["cards"]
            check("%d: 桌面只顯示 16 張卡（複本收埋）" % W, len(c) == 16, len(c))
            xs = sorted(set(round(k["x"]) for k in c)); ys = sorted(set(round(k["y"]) for k in c))
            check("%d: 16 張卡排成 4 欄 × 4 行" % W, len(xs) == 4 and len(ys) == 4, (xs, ys))
            check("%d: 16 張卡等闊等高" % W, max(k["w"] for k in c) - min(k["w"] for k in c) < 1 and max(k["h"] for k in c) - min(k["h"] for k in c) < 1)
            check("%d: 卡填滿 grid（最左 = grid 左、最右 = grid 右）" % W,
                  near(min(k["x"] for k in c), g["reel"]["x"]) and near(max(k["r"] for k in c), g["reel"]["r"]),
                  (min(k["x"] for k in c), g["reel"]["x"], max(k["r"] for k in c), g["reel"]["r"]))
            check("%d: 卡寬 ≥ 100px（唔再係手機 96px 細卡）" % W, c[0]["w"] >= 100, c[0]["w"])
            check("%d: 組別標籤 %s" % (W, "顯示" if W >= 1280 else "收埋（<1280）"), g["rows"] == (W >= 1280))
            v = g["vers"]
            check("%d: 版本卡 4 張等高" % W, len(v) == 4 and max(k["h"] for k in v) - min(k["h"] for k in v) < 1, [k["h"] for k in v])
            vrows = len(set(round(k["y"]) for k in v))
            check("%d: 版本卡 %s" % (W, "一行 4 張" if W >= 1280 else "2×2"), vrows == (1 if W >= 1280 else 2), vrows)
            s = g["scenes"]
            check("%d: 情景 4 欄（同一行）" % W, len(s) == 4 and len(set(round(k["y"]) for k in s)) == 1 and len(set(round(k["x"]) for k in s)) == 4)
            a = g["acc"]
            check("%d: 探索更多 4×2" % W, len(a) == 8 and len(set(round(k["x"]) for k in a)) == 4 and len(set(round(k["y"]) for k in a)) == 2)
            check("%d: 探索更多方塊等高" % W, max(k["h"] for k in a) - min(k["h"] for k in a) < 1, [round(k["h"]) for k in a])
            gb = [round(k["b"]) for k in g["go"]]
            check("%d: 探索更多連結貼底（每行連結底部對齊）" % W, len(set(gb[:4])) == 1 and len(set(gb[4:])) == 1, gb)
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
        check("768: 平板開 .dt 但冇桌面導覽／頁尾", g["dt"] and not g["nav"] and not g["foot"])
        check("768: 情景 2 欄", len(set(round(k["x"]) for k in g["scenes"])) == 2)
        check("768: 冇橫向 scroll", g["sw"] <= g["cw"], (g["sw"], g["cw"]))
        r = await pg.evaluate(AFTER, "test")
        check("768: show('test') 之後 #home 收埋", r["homeDisp"] == "none", r)
        await ctx.close()
        ctx, pg, errs = await page(390, 844, 390, 844, True)
        g = await pg.evaluate(GEOM)
        check("390: 手機冇 .dt；導覽／頁尾／組別標籤全部 display:none", not g["dt"] and not g["nav"] and not g["foot"] and not g["rows"])
        await ctx.close()
        await b.close()
    srv.shutdown()
    print("\n" + ("✓ 全部通過（%d 項）" % passed if passed == total else "✗ %d / %d 項失敗" % (total - passed, total)))
    sys.exit(0 if passed == total else 1)

asyncio.run(run())
