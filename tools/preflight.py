#!/usr/bin/env python3
"""Push 前體檢（Preflight）— 港式 MBTI
檢查：
  1. 每個 HTML 檔嘅 inline <script> 逐個 block 語法檢查（node --check）
  2. 版本號一致：VERSION / manifest.json / sw.js cache / index.html chrome 文字
  3. 每個 onclick="fn(...)" 都有對應 window.fn 或 function fn 定義
  4. emoji 殘留：HTML ＋ 獨立 .js（只准 ✓ ✗ ▼ ▲ → · …）
  5. manifest.json 係有效 JSON
用法：python3 tools/preflight.py        （exit 0 = 全部過，exit 1 = 有問題）
"""
import json
import os
import re
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ALLOWED_SYMBOLS = set("✓✗▼▲→·—–‘’“”「」《》…％")
fails, warns, notes = [], [], []


def read(p):
    with open(os.path.join(ROOT, p), encoding="utf-8") as f:
        return f.read()


def html_files():
    return sorted(f for f in os.listdir(ROOT) if f.endswith(".html"))


def js_files():
    # 獨立 .js（data.js／pair-data.js／social.js／voice-data.js…）一樣要守「冇 emoji」；
    # 2026-10-05：之前只掃 HTML → JS 註解嘅 ⚠️ 係空閘。
    return sorted(f for f in os.listdir(ROOT)
                  if f.endswith(".js") and os.path.isfile(os.path.join(ROOT, f)))


# ---------- 1. inline script 語法 ----------
for f in html_files():
    src = read(f)
    blocks = re.findall(r"<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)</script>", src)
    for i, b in enumerate(blocks):
        if not b.strip():
            continue
        with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as t:
            t.write(b)
            tmp = t.name
        r = subprocess.run(["node", "--check", tmp], capture_output=True, text=True)
        os.unlink(tmp)
        if r.returncode != 0:
            err = [l for l in r.stderr.splitlines() if "SyntaxError" in l or "Error:" in l]
            fails.append("%s inline script #%d 語法錯誤：%s" % (f, i, err[0] if err else r.stderr.strip()[:80]))
        else:
            notes.append("%s script#%d ok (%d chars)" % (f, i, len(b)))

# ---------- 2. 版本一致 ----------
ver = read("VERSION").strip()
man = json.loads(read("manifest.json"))
sw = read("sw.js")
cache = re.search(r'const CACHE = "hk-mbti-v([0-9.]+)"', sw)
idx = read("index.html")
chrome = re.search(r"版本\s*v([0-9]+\.[0-9]+)", idx)
if man.get("version") != ver:
    fails.append("manifest.json version=%s ≠ VERSION %s" % (man.get("version"), ver))
if not cache or cache.group(1) != ver:
    fails.append("sw.js CACHE=%s ≠ VERSION %s" % (cache.group(1) if cache else "冇", ver))
if not chrome or chrome.group(1) != ".".join(ver.split(".")[:2]):
    fails.append("index.html chrome 文字「版本 v%s」≠ VERSION %s（應該 v%s）" % (
        chrome.group(1) if chrome else "?", ver, ".".join(ver.split(".")[:2])))
notes.append("版本 %s（manifest/sw/chrome 一致）" % ver)

# ---------- 3. onclick 有冇定義 ----------
for f in html_files():
    src = read(f)
    defined = set(re.findall(r"window\.([A-Za-z_$][\w$]*)\s*=", src)) | set(re.findall(r"function\s+([A-Za-z_$][\w$]*)\s*\(", src))
    used = set(re.findall(r'onclick="([A-Za-z_$][\w$]*)\s*\(', src)) | set(re.findall(r'onchange="([A-Za-z_$][\w$]*)\s*\(', src))
    missing = sorted(used - defined)
    if missing:
        fails.append("%s onclick 冇對應函數：%s" % (f, ", ".join(missing)))
    else:
        notes.append("%s onclick %d 個全部有定義" % (f, len(used)))

# ---------- 4. emoji 殘留（HTML ＋ 獨立 .js）----------
EMOJI = re.compile("[\U0001F000-\U0001FAFF\u2600-\u27BF\u2190-\u21FF\u2B00-\u2BFF\uFE0F]")
for f in html_files() + js_files():
    src = read(f)
    bad = sorted({c for c in EMOJI.findall(src) if c not in ALLOWED_SYMBOLS})
    if bad:
        # 2026-10-02：由 warns 改為 fails。原因：全站「唔准 emoji」係硬規則，
        # 但用 warns 時 summary 照樣印「全部通過」＋exit 0 → 前後已經走漏 4 次
        # （5373a96／4f03b11／4849d73／4809518），每次都係註解入面嘅 ⚠️。
        fails.append("%s 有 emoji／符號殘留：%s" % (f, " ".join("%s(U+%04X)" % (c, ord(c)) for c in bad)))

# ---------- 5. JSON 有效 ----------
for f in ("manifest.json",):
    try:
        json.loads(read(f))
    except Exception as e:
        fails.append("%s 唔係有效 JSON：%s" % (f, e))

print("===== Preflight（港式 MBTI）=====")
for n in notes:
    print("  ✓", n)
for w in warns:
    print("  ⚠", w)
for x in fails:
    print("  ✗", x)
print("===== %s =====" % ("全部通過（%d 項）" % len(notes) if not fails else "%d 項有問題" % len(fails)))
sys.exit(1 if fails else 0)
