#!/usr/bin/env python3
"""
手機零影響（mobile zero-impact）像素驗證 —— tools/mobile_zero_impact.py

做法：
  1. 由 index.html 剝走桌面層（style#desktop-layer、style#desktop-mode-fix、gate script、
     nav#dtNav、div#dtHeroCta、div#dtTypeRows、footer#dtFoot）→ 「基準版」（放喺臨時資料夾）
  2. 真 Chrome（Playwright）分別開「現行版」同「基準版」，
     9 個畫面 × 手機闊度（預設 360 / 390 / 430），隨機數固定（每次操作前 reseed）
  3. 逐 pixel 比較，任何一格唔同都當失敗

注意：正確基準係「現行版剝走桌面層」，唔係 git tag v2.0.0 —— v2.0.0 之後有好多同桌面無關嘅
內容／邏輯改動（深層連結、語音、題庫計分…），文字 diff 一定唔會等於 v2.0.0。

需要：pip install playwright pillow numpy；Chrome（預設 /usr/bin/google-chrome，可用 CHROME=… 改）
執行：python3 tools/mobile_zero_impact.py [--widths 360,390,430] [--keep DIR]
"""
import argparse, asyncio, functools, http.server, os, re, shutil, sys, tempfile, threading

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CHROME = os.environ.get("CHROME", "/usr/bin/google-chrome")

def strip_desktop(html):
    pats = [r'<style id="desktop-layer">.*?</style>', r'<style id="desktop-mode-fix">.*?</style>',
            r'<script>\s*\(function\(\)\{\s*var root = document\.documentElement;.*?</script>',
            r'<nav id="dtNav".*?</nav>', r'<div id="dtHeroCta">.*?</div>',
            r'<div id="dtTypeRows"[^>]*>.*?</div>', r'<footer id="dtFoot".*?</footer>']
    for p in pats:
        html, n = re.subn(p, "", html, count=1, flags=re.S)
        if n != 1: raise SystemExit("剝唔到：" + p)
    return html

def serve(root):
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    h = functools.partial(Quiet, directory=root)
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), h)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/" % srv.server_address[1]

SEED = """(()=>{let s=12345;Math.random=function(){s=(s*1103515245+12345)&0x7fffffff;return s/0x7fffffff};
window.__reseed=()=>{s=12345};const t0=1790000000000;Date.now=()=>t0;})()"""
FREEZE = """()=>{window._homeReelHold=true;const r=document.getElementById('homeTypeReel');if(r){r.classList.remove('is-auto');r.scrollLeft=0;}
if(!document.getElementById('__frz')){const s=document.createElement('style');s.id='__frz';s.textContent='*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}.fade-up,.q-enter,#qOptions .option{opacity:1!important;transform:none!important}';document.head.appendChild(s);}window.scrollTo(0,0)}"""
BLOCK = ("goatcounter", "gc.zgo.at", "googlesyndication", "googletagmanager", "google-analytics")

async def render(base, out, tag, widths):
    from playwright.async_api import async_playwright
    shots = []
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME)
        for w in widths:
            h = {360: 780, 390: 844, 430: 932}.get(w, 844)
            ctx = await b.new_context(viewport={"width": w, "height": h}, screen={"width": w, "height": h},
                                      device_scale_factor=1, is_mobile=True, has_touch=True,
                                      service_workers="block", locale="zh-HK")
            await ctx.add_init_script(SEED)
            async def rt(route):
                if any(k in route.request.url for k in BLOCK): await route.abort()
                else: await route.continue_()
            await ctx.route("**/*", rt)
            pg = await ctx.new_page()
            pg.on("dialog", lambda d: asyncio.ensure_future(d.dismiss()))
            async def snap(name):
                await pg.evaluate(FREEZE); await pg.wait_for_timeout(350)
                for kind, full in (("full", True), ("viewport", False)):
                    f = os.path.join(out, "%s_%s_%d_%s.png" % (tag, name, w, kind))
                    await pg.screenshot(path=f, full_page=full); shots.append(os.path.basename(f))
            await pg.goto(base + "index.html", wait_until="networkidle"); await pg.wait_for_timeout(1200)
            await snap("home")
            for name, js in [("hub", "openHub()"), ("type-INFJ", "openType('INFJ','hub')"), ("spectrum", "openSpectrum()"),
                             ("social", "openSocial()"), ("about", "openAbout()"), ("profile", "goVersion('bb')")]:
                await pg.evaluate(js); await pg.wait_for_timeout(600); await snap(name)
                await pg.evaluate("goHome()"); await pg.wait_for_timeout(300)
            await pg.evaluate("__reseed();startTestWithVersion('bb')"); await pg.wait_for_timeout(1000)
            await snap("test-q1")
            for i in range(40):
                if await pg.evaluate("!document.getElementById('result').classList.contains('hidden')"): break
                opts = await pg.query_selector_all("#qOptions .option")
                if not opts: await pg.wait_for_timeout(400); continue
                await pg.evaluate("__reseed()")
                await opts[i % len(opts)].click(); await pg.wait_for_timeout(850)
            await pg.wait_for_timeout(1200)
            await snap("result")
            await ctx.close()
        await b.close()
    return shots

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--widths", default="360,390,430")
    ap.add_argument("--keep", default="")
    a = ap.parse_args()
    widths = [int(x) for x in a.widths.split(",")]
    from PIL import Image, ImageChops
    import numpy as np
    tmp = tempfile.mkdtemp(prefix="hkmbti-zero-")
    base_dir = os.path.join(tmp, "baseline"); os.makedirs(base_dir)
    for f in os.listdir(REPO):
        if f in (".git", "index.html"): continue
        os.symlink(os.path.join(REPO, f), os.path.join(base_dir, f))
    with open(os.path.join(REPO, "index.html"), encoding="utf-8") as fh: html = fh.read()
    with open(os.path.join(base_dir, "index.html"), "w", encoding="utf-8") as fh: fh.write(strip_desktop(html))
    out = a.keep or os.path.join(tmp, "shots"); os.makedirs(out, exist_ok=True)
    s1, u1 = serve(REPO); s2, u2 = serve(base_dir)
    cur = asyncio.run(render(u1, out, "current", widths))
    asyncio.run(render(u2, out, "baseline", widths))
    s1.shutdown(); s2.shutdown()
    bad = 0
    for f in cur:
        g = f.replace("current_", "baseline_", 1)
        x = Image.open(os.path.join(out, f)).convert("RGB"); y = Image.open(os.path.join(out, g)).convert("RGB")
        if x.size != y.size:
            bad += 1; print("✗ %s 尺寸唔同 %s vs %s" % (f, x.size, y.size)); continue
        n = int((np.asarray(ImageChops.difference(x, y)).sum(axis=2) > 0).sum())
        if n: bad += 1; print("✗ %s 有 %d 個 pixel 唔同" % (f, n))
    print("比較 %d 張截圖（%d 畫面 × %s px × full/viewport）" % (len(cur), 9, a.widths))
    if not a.keep: shutil.rmtree(tmp, ignore_errors=True)
    print("✓ 手機零影響：全部 0 pixel 差異" if bad == 0 else "✗ %d 張有差異" % bad)
    sys.exit(0 if bad == 0 else 1)

if __name__ == "__main__":
    main()
