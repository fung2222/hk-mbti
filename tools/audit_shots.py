"""tools/audit_shots.py — 設計審計截圖（唔入出貨閘）

用法：先起本地 server（python3 -m http.server 8765 --bind 127.0.0.1），再跑呢個。
截首頁 1920／1440 嘅頂／中／底三段去 shots/（shots/ 已入 .gitignore）。
CHROME 路徑係 Roy 部 Windows 機；其他機用 CHROME 環境變數覆寫。
"""
import asyncio, os, sys
from playwright.async_api import async_playwright

CHROME = os.environ.get("CHROME", r"C:\Program Files\Google\Chrome\Application\chrome.exe")
OUT = os.path.abspath("shots")
os.makedirs(OUT, exist_ok=True)

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=CHROME, headless=True)
        for w, h, tag in [(1920, 1000, "1920"), (1440, 900, "1440")]:
            pg = await browser.new_page(viewport={"width": w, "height": h})
            await pg.goto("http://127.0.0.1:8765/index.html", wait_until="networkidle")
            await pg.wait_for_timeout(1200)
            await pg.screenshot(path=os.path.join(OUT, "home_%s_top.png" % tag))
            await pg.evaluate("window.scrollTo(0, 1000)")
            await pg.wait_for_timeout(400)
            await pg.screenshot(path=os.path.join(OUT, "home_%s_mid.png" % tag))
            await pg.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await pg.wait_for_timeout(400)
            await pg.screenshot(path=os.path.join(OUT, "home_%s_bot.png" % tag))
            await pg.close()
        await browser.close()
    print("done")

asyncio.run(main())
