"""審計桌面內頁：百科 / 類型頁 / 結果頁（1920、1280、1024）
用法：先起 python3 -m http.server 8765，再跑 python3 tools/audit_inner.py
"""
import os, sys, json, time
from playwright.sync_api import sync_playwright

CHROME = os.environ.get("CHROME", r"C:\Program Files\Google\Chrome\Application\chrome.exe")
BASE = "http://127.0.0.1:8765/index.html"
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "shots", "inner")
os.makedirs(OUT, exist_ok=True)

REC = [{
    "id": "audit1", "mbti": "INTJ", "name": "", "nickname": "",
    "version": "life", "timestamp": 1763300000000,
    "score": {"E": 8, "I": 22, "S": 9, "N": 21, "T": 20, "F": 10, "J": 19, "P": 11},
    "pct": {"EI": 73, "SN": 70, "TF": 67, "JP": 63},
    "closeAxes": []
}]

PAGES = [
    ("hub",    BASE, "openHub()"),
    ("type",   BASE + "#type=INTJ", None),
    ("result", BASE + "#view=0", None),
]
WIDTHS = [1920, 1280, 1024]

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME)
    for w in WIDTHS:
        pg = b.new_page(viewport={"width": w, "height": 1000})
        pg.add_init_script("localStorage.setItem('hkmbti_history', '%s')" % json.dumps(REC).replace("'", "\\'"))
        for name, url, js in PAGES:
            pg.goto(url)
            pg.wait_for_timeout(1800)
            if js:
                pg.evaluate(js)
                pg.wait_for_timeout(900)
            pg.screenshot(path=os.path.join(OUT, f"{name}-{w}.png"))
            # 橫向溢出檢查
            overflow = pg.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
            print(f"{name} @ {w}: overflow={overflow}px")
        pg.close()
    b.close()
print("done ->", OUT)
