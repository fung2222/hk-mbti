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

# ---------- 6. 上架前紅線（2026-10-13 加）----------
# 背景：Play 審核員會撳入 app 睇。
#   ① 升級頁寫「HK$18／付款會經 Google Play 完成」，但一撳就出「示範版本：即刻解鎖」
#      ＝ 自己承認未接付款系統 → 欺騙行為政策風險。上架前改 soft pitch，第 1 章照免費。
#   ② 商店文案「準確度有保證」同 app 內「MBTI 係性格參考，唔係心理診斷」矛盾 → 誤導聲明風險。
#   ③ 子頁字型 URL 載入 weight 500（全站禁令），index 已係 400;600;700;900。
# 呢三條係「唔准再靜靜返轉頭」嘅硬規則，所以入 preflight（唔係只寫落文件）。
LANDING_BANNED = ["HK$18", "示範版本", "付款會經 Google Play"]
for kw in LANDING_BANNED:
    if kw in idx:
        fails.append("index.html 仍有上架前紅線字串：%s" % kw)
# 6b. Play Billing 接線（2026-10-17）
# 網頁版冇 Digital Goods API 必須保持 soft pitch，價錢唔准寫死（HK$18 已在上面禁止）。
# 一次解鎖唔准 consume：消耗咗 Google 會當用完，換機還原唔到。
# 唔 acknowledge，三日後 Google 自動退款。
if "getDigitalGoodsService" not in idx or "hkmbti_full_analysis_unlocked" not in idx:
    fails.append("index.html 未接 Play Billing（要有 getDigitalGoodsService + hkmbti_full_analysis_unlocked）")
if "listPurchases" not in idx or "acknowledge" not in idx:
    fails.append("index.html 未有還原購買／acknowledge（唔 ack 三日後退款）")
if ".consume(" in idx:
    fails.append("index.html 唔准 consume 一次解鎖（消耗品會失去資格）")
for f in ("store-listing/full-desc-play.txt", "store-listing/full-desc.md"):
    if os.path.exists(os.path.join(ROOT, f)) and "準確度有保證" in read(f):
        fails.append("%s 仍有「準確度有保證」（同 app 內免責句矛盾）" % f)
for f in html_files():
    for m in re.finditer(r"fonts\.googleapis\.com/css2\?family=([^'\"]+)", read(f)):
        if re.search(r"(?:^|;)500(?:;|$)", m.group(1)):
            fails.append("%s 字型 URL 載入 weight 500（全站禁令，用 600）" % f)

for f in ("store-listing/full-desc-play.txt",
          "store-listing/short-desc.txt", "store-listing/app-name.txt"):
    if os.path.exists(os.path.join(ROOT, f)):
        _bad = sorted({c for c in EMOJI.findall(read(f)) if c not in ALLOWED_SYMBOLS})
        if _bad:
            fails.append("%s 有 emoji（Play 文案要同 app 一致，唔准有）：%s"
                         % (f, " ".join("%s(U+%04X)" % (c, ord(c)) for c in _bad)))

# ---------- 8. 計分方法頁統計數字（2026-10-13 加）----------
# 血例：文案寫死「112 條題目全部左右對稱」，但題庫改過（實際 109 條）→ 用戶見到錯數字。
# 規則：呢類由資料決定嘅數字一定要有 id、由 JS 填；唔准寫死。
if "mthSymN" not in idx:
    fails.append("index.html 計分方法頁唔見 id=mthSymN（題目數要由 QUESTIONS 動態填）")
if re.search(r'class="mth-n">\s*\d+\s*</span><span class="mth-l">條題目', idx):
    fails.append("index.html 計分方法頁「條題目」數量仍然寫死（要用 id=mthSymN）")

# ---------- 7. manifest 圖示（2026-10-13 加）----------
# 血例：manifest 寫住一個唔存在嘅 icon 檔（或 maskable 標錯），上架／安裝時會靜靜降級。
# 檢查：① 每個 icon src 真係存在於 repo root ② 至少要有一個 maskable（Android 自適應圖示）
try:
    _man = json.loads(read("manifest.json"))
    _icons = _man.get("icons", [])
    if not _icons:
        fails.append("manifest.json 冇 icons")
    _mask = 0
    for _i in _icons:
        _src = str(_i.get("src", ""))
        if not os.path.exists(os.path.join(ROOT, _src)):
            fails.append("manifest.json 指向唔存在嘅圖示：%s" % _src)
        if "maskable" in str(_i.get("purpose", "")):
            _mask += 1
    if _mask == 0:
        fails.append("manifest.json 冇任何 maskable icon（Android 安裝會用白底方圖）")
except Exception as e:
    fails.append("manifest.json icons 檢查失敗：%s" % e)

# ---------- 9. 首頁文案一致性（2026-10-13 加）----------
# 血例：ChatGPT 審計捉到 —— 頁面用「完整版內容」做標題，但第 2–9 章其實未開放；
#       又寫「最準確」「結果越穩定」，但計分頁自己承認未做真人重測研究；
#       首頁寫「5–10 分鐘」同版本卡「60 題 · 5 分鐘」對唔上。呢啲係上架文案風險
#       （審核員撳入見到會當誤導）。註：等級名「完整版」（deep-tag／tierLabel）係產品名，
#       唔喺禁令範圍，唔准當佢係過時文案。
_BANNED_COPY = [
    ("完整版內容", "第 2–9 章未開放，唔應該用「完整版內容」做頁面標題 → 用「深入分析」"),
    ("最準確", "未做真人重測研究，唔應該寫「最準確」 → 用「題目最多」"),
    ("結果越穩定", "未經研究，唔應該寫「結果越穩定」 → 用「涵蓋嘅生活情境越廣」"),
    ("5–10 分鐘", "要同版本卡（60 題 · 5 分鐘）一致 → 用「約 5 分鐘」"),
]
try:
    _idx = read("index.html")
    for _bad, _why in _BANNED_COPY:
        if _bad in _idx:
            fails.append("index.html 有過時／矛盾文案「%s」：%s" % (_bad, _why))
except Exception as e:
    fails.append("文案一致性檢查失敗：%s" % e)

# ---------- 10. PWA 標準做法（2026-10-13 加，血例：離線彈窗查咗 5 輮）----------
# 根因：SW cache 曾經部分失敗／殘留舊 HTML，而 activate 只刪「唔同 cache 名」→ 同名 cache
# 永遠唔清 → 用戶「收到咗修復但仍然壞」（業界經典：I Shipped a Fix. My Service Worker Kept Serving the Bug.）。
# 以下每一項都係業界標準做法；改 sw.js 時唔准倒退。
try:
    _sw = read("sw.js")
    # 去註釋先檢查（否則註釋提到舊寫法就會假警報 —— 2026-10-13 血例）
    _sw_code = "\n".join(l.split("//")[0] for l in _sw.split("\n"))
    _checks = [
        ('fetch(e.request, { cache: "reload" })', "HTML 導航一定要 network-first ＋ cache:'reload'（唔可以俾 HTTP cache 餵舊 HTML）"),
        ("self.skipWaiting()", "要有 skipWaiting()"),
        ("self.clients.claim()", "要有 clients.claim()"),
        ("keys.map(k => caches.delete(k))", "activate 要全量 cache 重置（唔可以只刪「唔同 cache 名」）"),
        ("Response.error()", "cache-first 分支要封死 respondWith(undefined)"),
        ("hkmbti_selfheal", "要有自癒哨兵（偵測 tailwind.css 冇生效 → 清壞 cache ＋ 更新 SW）"),
    ]
    for _needle, _why in _checks:
        _ok = (_needle in _sw_code) if _needle != "hkmbti_selfheal" else (_needle in read("index.html"))
        if not _ok:
            fails.append("PWA 標準倒退：%s（%s）" % (_needle, _why))
    if "c.add(" in _sw_code:
        fails.append("sw.js 用返 c.add()（會食 GitHub 嘅 max-age=600 → cache 殘留舊檔），要用 fetch({cache:'reload'})+put")
    if "/hk-mbti/offline.html" not in _sw:
        fails.append("sw.js ASSETS 要保留 offline.html（離線兜底頁）")
    _tw_pages = [f for f in os.listdir(ROOT)
                 if f.endswith(".html") and "tailwind.css" in read(f)]
    for _f in _tw_pages:
        if "\n.hidden{display:none}\n" not in read(_f):
            fails.append("PWA 標準倒退：%s 冇自帶 .hidden{display:none}（tailwind.css 一失，隱藏元素會走出嚟）" % _f)
except Exception as e:
    fails.append("PWA 標準檢查失敗：%s" % e)

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


# ===== 11. 分享圖（og:image）一致性 =====
def _png_size(path):
    import struct as _s
    with open(path, "rb") as f:
        head = f.read(33)
    if head[:8] != b"\x89PNG\r\n\x1a\n":
        return (0, 0)
    w, h = _s.unpack(">II", head[16:24])
    return (w, h)


_og_problems = []
_og_path = "og-image.png"
if not os.path.exists(_og_path):
    _og_problems.append("og-image.png 唔存在")
else:
    _ow, _oh = _png_size(_og_path)
    _html = open("index.html", encoding="utf-8").read()
    _w = re.search(r'og:image:width" content="(\d+)"', _html)
    _h = re.search(r'og:image:height" content="(\d+)"', _html)
    if not _w or not _h:
        _og_problems.append("index.html 冇 og:image:width / height")
    else:
        if int(_w.group(1)) != _ow or int(_h.group(1)) != _oh:
            _og_problems.append("og:image 標示 %sx%s 同實際檔案 %dx%d 唔一致（WhatsApp／FB 會裁錯）" % (_w.group(1), _h.group(1), _ow, _oh))
    if _ow != _oh:
        _og_problems.append("og-image.png 唔係正方形（%dx%d）—— 聊天 app 預覽會裁切" % (_ow, _oh))
    if "og-image.png" not in _html:
        _og_problems.append("index.html 冇引用 og-image.png")
    if 'name="twitter:card" content="summary"' not in _html:
        _og_problems.append("twitter:card 應該係 summary（正方形圖唔好用 summary_large_image）")

print("\n===== 11. 分享圖（og:image）一致性 =====")
if _og_problems:
    for _p in _og_problems:
        print("  FAIL " + _p)
    FAILED.append("分享圖一致性")
else:
    print("  OK   og-image.png %dx%d（正方形）＋ meta 一致 ＋ twitter:card=summary" % (_ow, _oh))
    notes.append("分享圖 og-image.png 正方形 ＋ meta 一致")



# ===== 12. 意見／評分入口（2026-10-15 Roy 批准）=====
_e_problems = []
_e_html = open("index.html", encoding="utf-8").read()
if "mailto:fung2222" not in _e_html and "mailto:fung22222@gmail.com" not in _e_html:
    _e_problems.append("關於頁冇問題回報 email 入口")
if "play.google.com/store/apps/details?id=com.fung2222.hkmbti" not in _e_html:
    _e_problems.append("關於頁冇去 Google Play 評分嘅入口")
for _w in ["五星好評", "5星好評", "獎勵評分", "好評送禮", "評分送"]:
    if _w in _e_html:
        _e_problems.append("評分引導唔可以有獎勵字眼（違反 Play 政策）：" + _w)


# 每段文案唔准太長（中文會喺任何位斷行 → 會劈開詞語／出孤行）
_e_card = _e_html[_e_html.find("意見同支援"): _e_html.find("意見同支援") + 1600]
for _line in re.findall(r'leading-relaxed">([^<]+)</div>', _e_card):
    _cjk = len([c for c in _line if "\u4e00" <= c <= "\u9fff"])
    if _cjk > 18:
        _e_problems.append("意見卡文案太長（%d 個中文字）會斷錯行：" % _cjk + _line)


# 私隱聯絡方式：2026-10-15 Roy 拍板 A —— 一定要 email（普通用戶唔識用 GitHub Issues）
for _f in ("index.html", "privacy.html"):
    _c = open(_f, encoding="utf-8").read()
    if "mailto:fung22222@gmail.com" not in _c:
        _e_problems.append(_f + " 私隱聯絡唔係 email（mailto:fung22222@gmail.com）")
    if "GitHub Issues" in _c:
        _e_problems.append(_f + " 仲有舊嘅 GitHub Issues 聯絡字眼（已改用 email）")

print("\n===== 12. 意見／評分入口 =====")
if _e_problems:
    for _p2 in _e_problems:
        print("  FAIL " + _p2)
    FAILED.append("意見／評分入口")
else:
    print("  OK   關於頁有意見回報 email ＋ Play 評分入口（冇獎勵字眼）")
    notes.append("意見／評分入口齊全")

print("===== %s =====" % ("全部通過（%d 項）" % len(notes) if not fails else "%d 項有問題" % len(fails)))
sys.exit(1 if fails else 0)
