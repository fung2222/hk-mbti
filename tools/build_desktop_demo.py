#!/usr/bin/env python3
"""由 index.html 生成 demo/desktop-full.html（真身示範：noindex、停 SW、去 GoatCounter、加 <base>）。
改完桌面層之後跑一次：python3 tools/build_desktop_demo.py"""
import os, sys
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
s = open(os.path.join(REPO, "index.html"), encoding="utf-8").read()
def rep(a, b):
    global s
    if s.count(a) != 1: sys.exit("搵唔到（或者多過一個）：" + a[:60])
    s = s.replace(a, b)
rep('<meta charset="UTF-8">\n', '<meta charset="UTF-8">\n<base href="/hk-mbti/">\n<meta name="robots" content="noindex,nofollow">\n')
rep('<title>港式 MBTI · 你喺邊種港人？</title>', '<title>示範 · 桌面／平板版式 ① · 港式 MBTI</title>')
rep('<script data-goatcounter="https://fung2222.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>\n\n', '')
rep('if("serviceWorker" in navigator){', 'if(false && "serviceWorker" in navigator){')
open(os.path.join(REPO, "demo", "desktop-full.html"), "w", encoding="utf-8").write(s)
print("✓ demo/desktop-full.html 已由 index.html 重建")
