#!/usr/bin/env python3
"""靜態守門 B —— tools/gate_design.py

檢查桌面層 CSS 講嘅 selector 同 index.html 實際元素一致（捉死代碼／假綠斷言）。
（2026-10-05 事故：index.html 有 html.dt .home-acc-item[data-acc="deep"]{display:none}，
 但 HTML 冇任何 data-acc="deep" 元素；desktop_layout_test.js 只 regex 呢句 CSS 就當守門 → 假綠。）

檢查：style#desktop-layer 內每個 [data-*="值"] 屬性 selector，都要揾到對應元素（或同檔 CSS 以外嘅實際 HTML）。
"""
import os, re, sys

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
html = open(os.path.join(REPO, "index.html"), encoding="utf-8").read()
m = re.search(r'<style id="desktop-layer">([\s\S]*?)</style>', html)
if not m:
    print("✗ 揾唔到 <style id=\"desktop-layer\">")
    sys.exit(1)
layer = m.group(1)
body = re.sub(r"<style[\s\S]*?</style>", "", html)

fails = []
# 風琴格嘅排版唔准用 nth-child —— #homeAccordion 第一個 child 係 label，
# nth-child(5)/(6) 會打中 label 偏移（2026-10-05 審計發現；已改用 nth-last-child）
for m in re.finditer(r'\.home-acc-item:nth-child\(', layer):
    fails.append("桌面層用 .home-acc-item:nth-child(...) —— label 係第一個 child，會偏移；請用 nth-last-child")
    print("✗ .home-acc-item:nth-child 偏移陷阱")
# 每個 data-* 屬性 selector，HTML 內必須有實際元素帶住該屬性值
for attr, val in sorted(set(re.findall(r'\[(data-[a-z-]+)="([^"]+)"\]', layer))):
    if not re.search(r'%s="%s"' % (re.escape(attr), re.escape(val)), body):
        fails.append('桌面層 CSS 有 [%s="%s"] selector，但 HTML 冇任何元素帶住呢個屬性值（死規則）' % (attr, val))
        print("✗ [%s=\"%s\"] 死 selector" % (attr, val))

print("✓ 靜態守門 B 通過（0 個死 selector）" if not fails else "✗ 靜態守門 B：%d 個問題" % len(fails))
sys.exit(1 if fails else 0)
