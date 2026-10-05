# 獨立審計報告 — hk-mbti 驗證流程（唯讀）

- 審計員：independent auditor（provider=`deepseek`，model=`deepseek-v4-pro`）
- 日期：2026-10-05
- 範圍：`/opt/data/repos/hk-mbti`，HEAD `7dc1dc3`，branch `main`
- 鐵律遵守：**冇改 repo 任何檔、冇 git commit/push/tag、冇改版本**。全程唯讀。
- 方法：親手跑測試、親手讀原檔、親手量度。每條結論標 [事實]/[推論]/[猜測]。

---

## 1. 已驗證事實（命令＋真實輸出）

### 1.1 出貨 5 套閘全綠（母代理「健康」判斷正確）
[事實] 逐條親跑，exit code 全部 0：

```
$ sh tools/ui/run.sh                        → rc 0  「===== 全部 UI 測試通過 =====」
$ node tools/desktop_layout_test.js          → rc 0  「✓ 全部通過（56 項）」
$ node tools/desktop_gate_test.js            → rc 0  「✓ 全部 34 項正確」
$ node tools/deeplink_test.js                → rc 0  「✓ 全部深層連結都開到對應畫面」
$ python3 tools/preflight.py                 → rc 0  「===== 全部通過（32 項） =====」
```

### 1.2 `desktop_render_test.py` 10/45 失敗（母代理「stale」判斷正確）
[事實] 親跑，輸出 `✗ 10 / 45 項失敗`，rc=1。10 條失敗原文：

```
✗ 1440: 桌面只顯示 16 張卡（複本收埋）   ← 32        ← 實況 32 張（無縫滑輪）
✗ 1440: 16 張卡排成 4 欄 × 4 行          ← 32 個 x 座標（橫向滑輪，非 grid）
✗ 1440: 卡填滿 grid（最左=grid左…）       ← reel 非 grid
✗ 1440: 探索更多 4×2                     ← 空（現 5 欄）
✗ 1024: 桌面只顯示 16 張卡                ← 32
✗ 1024: 16 張卡排成 4 欄 × 4 行           ← 32 個 x
✗ 1024: 卡填滿 grid                       ← reel
✗ 1024: 組別標籤 收埋（<1280）            ← 現 1024 已顯示
✗ 1024: 探索更多 4×2                      ← 空
✗ 768: 平板開 .dt 但冇桌面導覽／頁尾       ← 現平板有導覽
```
[事實] 斷言寫死 2026-09-28「v3 4×4 grid」舊設計（第 75/77/78/91/117 行），而設計已喺 `a257129`（2026-10-04）改成橫向滑輪。

### 1.3 `mobile_zero_impact.py` 一跑即 crash（母代理判斷正確）
[事實] 親跑 rc=1，Traceback 尾行：
```
playwright._impl._errors.Error: Page.evaluate: ReferenceError: openSpectrum is not defined
```
[事實] `openSpectrum`、`openSocial` 喺 index.html **0 個定義**（`grep -c` = 0），已喺 `3c149dc`（2026-10-01）拆走。`mobile_zero_impact.py:71` 仍硬編碼 `("spectrum", "openSpectrum()"), ("social", "openSocial()")`。

### 1.4 根因：兩個 script 唔喺 ship.sh
[事實] `tools/ship.sh` 只 gate 5 條：`run.sh`、`desktop_layout_test`、`desktop_gate_test`、`deeplink_test`、`preflight`。`grep desktop_render/mobile_zero/record_view/voice_test ship.sh` → 全冇。所以呢兩個真 Chrome script 出貨時唔會跑 → 過期冇人知。

### 1.5 額外發現（母代理冇提）：斷言總數漂移，3 個數字打架
[事實] 現時 `sh tools/ui/run.sh` 24 檔，逐檔相加**實數 = 971 斷言**：
- `boot_reload_test.js` = **29**（母代理記憶/文件寫 25）
- `pair_test.js` = **31**（A1 寫 28→29）
- `mobile_debug_fixes_test.js` = **28 項**（印「（28 項）」，唔印「28/28」）
[事實] 交接簡報寫「943 斷言」＝只加咗印 `N/N` 格式嗰 23 檔，**漏數** mobile_debug_fixes 嘅 28（971−28=943）。A1 報告寫 964（`ea257fb` 舊值）。memory 寫 964。→ 同一斷言總數，現存 **943／964／971** 三個版本，冇單一真相。

### 1.6 文件脫節（母代理判斷正確，已核）
[事實] `AGENTS.md`：L20「21 檔 jsdom」（實 24）、L8「探索更多 6 欄」（桌面實 5 欄）；`DESKTOP-HANDOFF.md`：L61「37 項」（實 56）、通篇「v3 4×4 grid」（實滑輪）。

### 1.7 計時（供 Q3 分層決策）
[事實] `desktop_render_test.py` 全程 **26 秒**（`time` 輸出 real 0m25.855s）。`mobile_zero_impact.py --widths 390` 喺「spectrum」畫面 crash，用咗 **8.4 秒**（跑到 1 闊 × 1 版本 × 3 畫面）；[推論] 完整跑（3 闊 × 2 版本 × 9 畫面 × full+viewport = 108 張截圖）估計 2–4 分鐘。

---

## 2. 客觀 bug（分級）

| 級 | 檔 | 問題 | 證據 |
|---|---|---|---|
| 高 | `mobile_zero_impact.py` | **「手機零影響」#1 鐵律嘅唯一 pixel 級守門死亡**（引用已刪 `openSpectrum/openSocial`） | §1.3 |
| 高 | `desktop_render_test.py` | 真 Chrome 排版唯一守門 10/45 紅，且**唔喺任何閘內** | §1.2/1.4 |
| 中 | `ship.sh` | 閘清單（5 條）≠ AGENTS.md「改完一定要跑」（8 條），漏 record_view/voice_test/兩個 Chrome script | §1.4 |
| 中 | 斷言總數 | 無單一真相（943/964/971），連交接簡報都數錯 | §1.5 |
| 低 | `AGENTS.md`/`DESKTOP-HANDOFF.md` | 數字同實況脫節（21 檔/6 欄/37 項/4×4） | §1.6 |

**冇發現 app 本體 bug**：app 碼（`index.html` 等）相對上一次 Grok 審計（A1–A4）冇功能性退化，5 套閘全綠，live 6 檔 md5 一致、真 Chrome 零 console error。問題全部喺**測試資產同流程**，唔係產品。

---

## 3. Q1–Q5

### Q1 `desktop_render_test.py` 應該點修？

**答：重寫，唔係逐條更新。** 唔止 10 條數字過期，連「斷言哲學」都過期（由 grid 假設 → reel 假設）。斷言要由「設計意圖」量關係/性質，唔好黐死絕對數：

| 舊斷言（寫死數） | 新斷言（設計意圖，穩） |
|---|---|
| `len(c) == 16`（複本收埋） | `cards[0..15].code == cards[16..31].code`（前16==後16）＋ `len(c) >= 17`（有複本先可無縫循環） |
| `4 欄 × 4 行`（grid） | `reel.scrollWidth > reel.clientWidth`（橫向可滾＝滑輪）＋ 全部卡 `y` 相同（同一行，非多行 grid） |
| `卡填滿 grid（最左=grid左）` | 卡等闊 `max(w)-min(w)<1`（保留，係意圖）+ 卡 `h/w ≈ 9/16`（直角 9/16 係 Roy 明確話好，穩定） |
| `探索更多 4×2`／`5 欄` | 「無孤兒格」：卡按 `y` 分組後，尾行卡數 == 首行卡數（剩一格就紅）。欄數本身由 jsdom 守 CSS 文字，真 Chrome 只守視覺結果 |
| `組別標籤 收埋 <1280` | 「組別標籤數 == 4 且首卡同第一張卡左對齊」，唔寫死 1280 閾值 |
| `768 冇導覽/頁尾` | 「768 有 .dt 但導覽 sticky 唔遮 hero 頂」或直接照實況 assert 有導覽 |

[推論] 關鍵原則：**數字（16/32/5 欄/4×4/1280）係設計快照會變；設計意圖（reel 可滾、卡等闊 9/16 直角、無縫複本、無孤兒格、互斥收埋）穩定。** 斷言量「關係」同「性質」，唔量「絕對數」。

### Q2 `mobile_zero_impact.py` 點修最穩？

**答：開頭加「函數存在性守門」，缺一即大聲失敗（fail-closed），唔好等 evaluate 先 crash。** 具體：

```python
# render() 之前，第 1 行就做：
NEEDED = ["openHub","openType","goVersion","openAbout","goHome",
          "startTestWithVersion","openSocialArticle","openRomanceArticle"]
html = open(REPO+"/index.html").read()
missing = [f for f in NEEDED if not re.search(r"window\." + f + r"\s*=", html)]
if missing:
    raise SystemExit("缺函數，停止（唔准靜靜死）：" + ", ".join(missing))
```

[事實] 呢個守門一開就會捉到 `openSpectrum/openSocial` 已刪。更根本：**唔好手寫導覽函數清單**——由 index.html 嘅 deep-link `MAP`（L1298–1304）或 `restoreNav` 分支動態抽，或者保留手寫清單但強制「每個都必須 `window.X` 存在」。「引用已刪函數」之所以能靜靜死，就係因為冇呢個 fail-closed 前置檢查。

### Q3 ship.sh 要唔要加呢兩個真 Chrome script？（重點）

**答：分層，唔好一齊塞入 push 閘。** 理由用實測計時：

- `desktop_render_test.py` = **26s**，係真排版唯一守門，風險高、成本低 → **修好後入 push 閘（L2）**。
- `mobile_zero_impact.py` = **108 張截圖、估 2–4 分鐘**，而且 pixel 級對比易 flaky（字型抗鋸齒、動畫時序）→ **唔入 push 閘，入慢閘（L3）**。

分層設計：

| 層 | 觸發時機 | 內容 | 成本 |
|---|---|---|---|
| L0 | pre-commit/pre-push hook | `preflight.py`（靜態） | <5s |
| L1 | push 前（ship.sh 現有） | run.sh + layout + gate + deeplink（jsdom） | <60s |
| L2 | push 前（ship.sh 新增） | `desktop_render_test.py`（真 Chrome 位置，輕） | ~26s |
| L3 | 慢閘（定期/桌面大改） | `mobile_zero_impact.py`（pixel 對比，重） | ~3min |

**點樣確保「分層」唔變「永遠冇人跑」**（呢個先係核心，唔係分層本身）：

1. [事實] 今次兩個 script 死嘅根因係「唔喺閘內 → 唔跑 → 唔知死」。所以 L3 必須有一個**「上次綠」時間戳守門**入 ship.sh：ship.sh 開頭檢查 L3 script 上次成功時間戳（寫落 `.last_green` 檔），超過 N 日（例如 7）未綠 → 大聲警告甚至 refuse。咁 L3 就算唔喺 push 閘，都會喺每次 push 時「被迫現身」。
2. **按改動觸發**：ship.sh 檢查 `git diff --name-only` 有冇掂到 `index.html` 嘅 `#desktop-layer`／`#dtNav`／`#dtFoot` → 有就**強制**跑 L3（就算慢），冇就只跑 L2。桌面層改動係手機零影響嘅唯一風險來源，改咗先跑最合理。
3. 加一條 `tools/test_health.py`（Q5 守門 1）入 ship.sh 最前，佢 ~1s，負責「所有 Playwright script 引用嘅函數都存在＋唔 crash」，確保 L3 就算唔跑，起碼唔會係「死咗都唔知」。

### Q4 仲有咩結構性漏洞？（具體指檔/行/機制）（重點）

1. **[事實] 閘清單 vs「一定要跑」清單唔同步**：`AGENTS.md`「改完一定要跑」列 8 條；`ship.sh` 只 gate 5 條（漏 `record_view_test.js`、`voice_test.js`、`desktop_render_test.py`、`mobile_zero_impact.py`）。兩個清單冇共享來源 → 有 script 以為有人跑，其實冇人跑。
2. **[事實] 測試資產會漂移，冇守門**：`desktop_layout_test.js` 跟住設計走（`a257129`→`d139440`→`e95d8f2`），但 `desktop_render_test.py`／`mobile_zero_impact.py` 自 `191327f`（2026-09-28）之後**從未更新**，期間經兩次大改（`3c149dc` 刪函數、`a257129` 改設計）都冇人知。同一個設計，兩個測試檔各自為政，一個跟一個唔跟。
3. **[事實] 引用已刪函數 = silent fail**：`mobile_zero_impact.py:71` 硬編碼 `openSpectrum()/openSocial()`，冇任何前置檢查。script 本身 crash 唔係問題，問題係佢唔喺閘內，crash 冇人見。
4. **[事實] 斷言黐死會變嘅數**：`desktop_render_test.py:75/77/78/91/117` 寫死 16/4×4/4×2/768 冇導覽。呢啲係「設計快照」唔係「設計意圖」，設計一改就紅，而紅又冇人見。
5. **[事實] 斷言總數冇單一真相**：943（簡報）/964（A1）/971（實數）三個版本。連交接簡報作者都踩返 A3 報告自己警告過嘅陷阱（mobile_debug_fixes 印「28 項」唔印「28/28」，用 grep `N/N` 就漏數）。
6. **[事實] 文件同實況脫節**：`AGENTS.md`「21 檔/6 欄」、`DESKTOP-HANDOFF.md`「37 項/4×4」全過期。文件數字冇守門，靠人手同步。
7. **[事實] preflight 重複跑、真 Chrome 完全冇 hook**：`.githooks/pre-push` 只跑 `preflight.py`（同 ship.sh L1 重複），但兩個真 Chrome script 唔喺任何 hook/閘。
8. **[事實] 最重要鐵律零保護**：`mobile_zero_impact.py` 係「手機版任何情況都唔可以受影響」(#1 鐵律) 嘅**唯一 pixel 級**驗證。佢死咗 → 呢條鐵律而家只有 `desktop_layout_test.js` 嘅靜態 CSS 文字守門頂住（守「寫錯規則」，唔守「規則生效後像素點樣」）。即係話，有人寫咗一條會喺手機版改 1 pixel 嘅桌面規則，**全部 5 套閘都會綠**。

### Q5 最少 3 個可即時實作守門（寫得落 code）

**守門 1 — 測試資產健康守門（`tools/test_health.py`，入 ship.sh 最前，~1s）**
```python
# 對每個 tools/*.py：python -m py_compile 唔 crash
# 對每個 Playwright script：regex 抽晒 evaluate("...()") 入面嘅 window 函數，
#   再 grep index.html 有冇「window.X =」，缺一即 fail + print 缺邊個。
```
呢條一條就捉到 `openSpectrum` 呢類「引用已刪函數」。[事實] 佢會令而家呢個 repo 即刻紅（因為 mobile_zero_impact.py 引用緊唔存在嘅 openSpectrum），即係 fail-closed。

**守門 2 — 閘清單由單一來源生成（改 `ship.sh`）**
ship.sh 唔好手寫 5 條 gate，改讀一個清單陣列，而且喺 ship.sh 內 assert「呢份清單 == AGENTS.md 嘅『改完一定要跑』清單」。同時把 `record_view_test.js`、`voice_test.js`、`desktop_render_test.py` 加返入閘（`mobile_zero_impact.py` 入慢閘 + 時間戳守門，見 Q3）。一個清單，兩邊讀，就唔會再「閘 5 條、文件 8 條」。

**守門 3 — 斷言改由設計意圖計（重寫 `desktop_render_test.py` 時一併做）**
加 3 條取代寫死數：
```python
check("滑輪可橫向滾", reel.scrollWidth > reel.clientWidth)      # 取代「4欄×4行」
check("無縫複本", codes[0:16] == codes[16:32])                   # 取代「16張」
check("卡 9/16 直角", all(abs(c.h/c.w - 9/16) < 0.02 for c in cards))  # 取代「填滿grid」
```
再加「L3 上次綠時間戳」守門入 ship.sh（見 Q3）：超過 7 日未綠 → refuse。咁「分層」唔會變「永遠冇人跑」。

（附加）**斷言總數由 run.sh 自己印**：改 `run.sh` 尾句印「共 24 檔 / 971 斷言」做 canonical 數字，唔好靠人手加，直接消滅 943/964/971 漂移。

---

## 4. 摘要（≤400 字，供母代理直接轉述）

hk-mbti 呢次審計：app 本體冇 bug，5 套出貨閘全綠、live 健康。問題 100% 喺測試資產同流程。

兩個真 Chrome script 已死，且唔喺任何閘內：`desktop_render_test.py` 10/45 紅（斷言寫死 2026-09-28「4×4 grid」，設計已改橫向滑輪）；`mobile_zero_impact.py` 一跑即 crash（引用已刪 `openSpectrum`）。後者係「手機零影響」#1 鐵律唯一 pixel 級守門，佢死咗 = 呢條最重要鐵律而家零 pixel 保護。

根因係結構性：① ship.sh 閘 5 條 ≠ AGENTS.md「一定要跑」8 條，冇共享來源；② 測試資產會漂移（jsdom 測試跟到設計，真 Chrome 測試自 191327f 從未更新）；③ 斷言黐死會變嘅數；④ 引用已刪函數 fail-open 靜靜死；⑤ 斷言總數冇單一真相（簡報 943 / A1 964 / 實數 971，連簡報都漏數 28）。

修法（照做）：Q1 重寫 desktop_render_test.py，斷言由「設計意圖」量（reel 可滾、前16==後16、卡 9/16 直角、無孤兒格）取代寫死數；Q2 mobile_zero_impact.py 開頭加「函數存在性守門」fail-closed；Q3 分層——desktop_render 26s 入 push 閘，mobile_zero_impact（估 2–4 分鐘）入慢閘＋「上次綠時間戳」守門＋桌面層改動時強制跑；Q5 三個守門：① test_health.py 檢查所有 Playwright 引用函數存在 ② ship.sh 閘清單由單一來源生成 ③ 斷言改設計意圖＋run.sh 自己印 canonical 斷言總數。
