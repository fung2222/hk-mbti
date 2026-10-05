#!/usr/bin/env python3
"""靜態守門 A —— tools/gate_refs.py

唔使 Chrome／jsdom，毫秒級。防止「index.html 刪走函數／section，工具腳本仍然引用 → 靜靜死」。
（2026-10-05 事故：mobile_zero_impact.py 引用已刪嘅 openSpectrum()，一跑即 crash，但唔喺閘內冇人知。）

檢查：
  1. 所有 tools/**/*.py 過 py_compile；所有 tools/**/*.js 過 node --check
  2. tools 內字串引用嘅 UI 函數（open*／go*／start*）必須喺 index.html 有定義
  3. tools 內字串呼叫嘅 show('<section>') 必須對應真實 <section id>
"""
import os, re, subprocess, sys

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
fails = []
def fail(msg):
    fails.append(msg); print("✗ " + msg)

def walk(sub):
    for root, dirs, files in os.walk(os.path.join(REPO, sub)):
        dirs[:] = [d for d in dirs if d not in ("node_modules", ".git", "browsers", "__pycache__")]
        for f in files:
            yield os.path.join(root, f)

# 1. 語法
for p in walk("tools"):
    rel = os.path.relpath(p, REPO)
    if p.endswith(".py"):
        r = subprocess.run([sys.executable, "-m", "py_compile", p], capture_output=True, text=True)
        if r.returncode:
            fail("py_compile %s：%s" % (rel, (r.stderr.strip().splitlines() or [""])[-1]))
    elif p.endswith(".js"):
        r = subprocess.run(["node", "--check", p], capture_output=True, text=True)
        if r.returncode:
            fail("node --check %s：%s" % (rel, (r.stderr.strip().splitlines() or [""])[-1]))

html = open(os.path.join(REPO, "index.html"), encoding="utf-8").read()
defined = set(re.findall(r"window\.([A-Za-z_$][\w$]*)\s*=", html))
defined |= set(re.findall(r"function\s+([A-Za-z_$][\w$]*)\s*\(", html))
sections = set(re.findall(r'<section id="([A-Za-z][\w-]*)"', html))

FNCALL = re.compile(r"""["']\s*((?:open|go|start)[A-Za-z0-9_]*)\s*\(""")
SHOWCALL = re.compile(r"""show\(\s*["']([A-Za-z][\w-]*)["']\s*\)""")
for p in walk("tools"):
    if not (p.endswith(".py") or p.endswith(".js")):
        continue
    rel = os.path.relpath(p, REPO)
    src = open(p, encoding="utf-8", errors="replace").read()
    for m in FNCALL.finditer(src):
        if m.group(1) not in defined:
            fail("%s:%d 引用 UI 函數 %s()，index.html 冇定義" % (rel, src[:m.start()].count("\n") + 1, m.group(1)))
    for m in SHOWCALL.finditer(src):
        if m.group(1) not in sections:
            fail("%s:%d show('%s')，index.html 冇 <section id=\"%s\">" % (rel, src[:m.start()].count("\n") + 1, m.group(1), m.group(1)))

print("✓ 靜態守門 A 通過（%d 個問題）" % len(fails) if not fails else "✗ 靜態守門 A：%d 個問題" % len(fails))
sys.exit(1 if fails else 0)
