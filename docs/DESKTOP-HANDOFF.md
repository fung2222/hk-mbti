# 桌面版 — 交接文件（Handoff for incoming AI/dev）

> 更新於 2026-11-22 · 桌面層 **v3.1（hero 重做＋衛星頁頂 bar 統一）** · branch `main`
> 2026-11-22：hero 大字同轉盤卡加級、轉盤箭咀改 hover 先現身、版本卡詳情長開＋stretch 等高、
> 「探索更多」段距放寬、`record.html`／`stats.html`／`privacy.html` 頂 bar 統一主站款式。
> 目的：接手嘅人睇完呢份，就明白**現況、鐵律、點驗證**。

Live：<https://fung2222.github.io/hk-mbti/>

---

## 0 · 一句話現況

2026-09-28 用**真 Chrome 截圖**審計之後，將舊桌面層（① 大站導覽型）**成段換走**，重做 v3。
舊版「排序錯亂、錯位」嘅根因唔係美感，而係 3 個 CSS bug（詳見 §5）：
1. `html.dt #home{display:grid}` 蓋過 Tailwind `.hidden` → **主頁永遠收唔埋**，測試／結果／百科全部同主頁疊埋（測試頁跌咗落主頁下面 ~2400px）
2. hero 子元素用 `grid-row:2`，但版本卡冇指定行 → 被 auto-place 去**第 1 行（hero 上面）**
3. `.scenes-grid`／`.home-acc` 只寫 `grid-template-columns`、**冇寫 `display:grid`** → 多欄規則從來冇生效

---

## 1 · 目標同美學標準（Roy）

- **「app 感」，唔係「文件感／功課紙」**；對標 16Personalities 等 minimalist 風
- 少卡框、少金標、大字、留空、視覺主角；**首頁主角 = 16 型色牌**
- **唔准加 emoji** ✗（只保留 `▼ ▲ → ✓ ✗` 呢類符號）
- 字型：PingFang HK／Noto Sans HK；拉丁字母 Archivo Black
- 唔准將 app 名改成淨「16型人格測試」

---

## 2 · 鐵律（犯咗就整壞手機版）

1. **手機版任何情況都唔可以受影響** ✗
   `<style id="desktop-layer">` 入面每條規則都要**同時**：① 包喺 `@media (min-width:…)` ② selector 以 `html.dt` 開頭。
   **唯一例外**：`#dtNav,#dtHeroCta,#dtTypeRows,#dtFoot{display:none}`（4 個新增元素預設隱藏）。
2. **會被 JS 用 `.hidden` 收埋嘅元素（`#home`、所有 section）唔准覆寫 `display`**；
   真係要覆寫，selector 一定要帶 `:not(.hidden)`（例：`html.dt #home:not(.hidden){…}`）。
   原因：`show(id)` 靠 Tailwind `.hidden{display:none}`（specificity 0,1,0），任何 `html.dt #xxx{display:…}` 都會贏佢。
   v3 做法：`#home` 保持 block，唔覆寫；hero 自己做 grid。`tools/desktop_layout_test.js` 有守。
3. **永久禁止：無條件 zoom／`.dm` 補償** ✗（`.dm` 只喺極窄條件生效，唔好郁 `desktop-mode-fix`）
4. **永久禁止：`calc(50% - 50vw)` 全闊色帶** ✗
   v3 根本唔使 vw：桌面 `#app` 本身全闊（`max-width:none;padding:0`），每段內容用 `width:var(--dt-w);margin:0 auto` 置中，色帶自然貼邊。
   （`--sbw` 仍由 gate script 寫入，但 v3 冇用到。）
5. 改之前先 audit 舊 commit；改完必須跑齊 §6 測試 **＋ 真瀏覽器截圖**（1920／1440／1280／1024／768／390）。
6. 未得 Roy confirm 唔准 tag／backup。

---

## 3 · 檔案同位置

| 位置 | 內容 |
|---|---|
| `index.html` line **~968** | `<style id="desktop-layer">` ← **桌面／平板排版全部喺呢度** |
| `index.html` line **~1276** | `<head>` gate script（加 `html.dt`、寫 `--sbw`、`.dm` 還原）—— **5 個 html 一致，唔好改** |
| `index.html` line **~1324** | `<style id="desktop-mode-fix">`（`.dm` 專用，唔好改）|
| `index.html` line **~1332** | `<style id="dark-layer">`（黑夜覆蓋；淺底新規則要喺度加對應 dk 版）|
| `index.html` line **~1480** | `<nav id="dtNav">` 桌面導覽；6 個入口帶 `data-nav`（about／hub／method／privacy／stats／record）|
| `index.html` line **~2493** | `<div id="dtHeroCta">` hero 兩粒 CTA（喺 `.home-hero-copy` 內）|
| `index.html` line **~2504** | `<div id="dtTypeRows">` 16 型左邊 4 個組別標籤（分析家／外交家／守護者／探索者）|
| `index.html` line **~2905** | `<footer id="dtFoot">` 桌面頁尾（`#app` 後面）|
| `tools/desktop_render_test.py` | **真 Chrome 幾何測試**（項數由腳本自己印；「意圖斷言」式）|
| `tools/mobile_zero_impact.py` | **手機零影響像素測試**（7 畫面 × 360/390/430；唔入 push 閘，改桌面層要手動跑；Windows 有 1–8px 渲染雜訊屬正常）|
| `tools/desktop_layout_test.js` | 靜態鐵律 + DOM 假設（jsdom，項數由腳本自己印）|
| `tools/desktop_gate_test.js` | gate 開關（項數由腳本自己印）|
| `tools/audit_shots.py` | 快速截首頁三段圖（1920/1440/1280/1024/768/390），要先起 `python3 -m http.server 8765`；CHROME 可用環境變數覆寫 |
| `tools/build_desktop_demo.py` | （按需）重建 standalone demo；**`demo/desktop-full.html` 已於 2026-10-04 刪除**（Roy 話唔再用）|

> 組別標籤用「探索者」而唔係「探險家」：因為 ISFP 嘅中文名已經係「探險家」，同一個畫面兩個「探險家」會混淆。

---

## 4 · 桌面層 v3 做緊咩

### 斷點
| 闊度（且有 `html.dt`）| 版式 |
|---|---|
| < 768 或冇 `.dt` | **手機版（完全冇郁）** |
| 768–1023（平板）| 乾淨單欄：`#app` 全闊、內容 920px 置中；hero／跑馬燈／情景帶貼邊；hero 高度上限 880px、光暈改 `closest-side`（冇硬邊）；版本卡 2×2；情景 2 欄；探索更多 3+2 置中；香港分佈 Top3 單欄；**有**導覽／頁尾（2026-10-04 起平板另一套）|
| ≥ 1024（桌面）| 下面嘅完整版式；內容闊 `--dt-w = min(1120px, 100% − 80px)` |
| ≥ 1280 | 版本卡一行 4 張；16 型左邊顯示組別標籤；hero 欄距 72px |
| ≥ 1440 | `--dt-w = min(1360px, 100% − 96px)` |
| ≥ 1680 | `--dt-w = min(1440px, 100% − 112px)`；轉盤卡 220px |

### 桌面主頁（由上至下）
1. **導覽 `#dtNav`**：sticky 64px、毛玻璃；品牌 + 6 入口 + 金色「開始測試」（`goPickVersion` → 捲去版本段，`scroll-margin-top:88px` 避開導覽）。
   現時畫面高亮用 CSS `:has()`（例：`html.dt:has(#hub:not(.hidden)) #dtNav [data-nav="hub"]`），**冇加 JS**。
2. **Hero**：`.home-hero` 自己做 grid `5fr / 7fr`（唔再用 `display:contents`）。
   左：大字 MBTI（2026-11-22 加級：`clamp(96px,9vw,148px)`，≥1440 再上 164px）+ 原文案 + 兩粒 CTA；右：**16 型橫向滑輪（主角，32 張＝前 16 唯一 + 後 16 複本）**。
   - 卡 **9/16 直角**（`border-radius:0`、`aspect-ratio:9/16`）；**分級放大 168 / 188 / 208 / 220px**（≥1024／≥1280／≥1440／≥1680；字用 em／clamp 跟卡放大）；橫向可滑（`overflow-x:auto`）；hover 上浮 + 顯示「進入」pill；**撳一下揀（is-on）照舊**
   - 32 張（前 16 唯一 + 後 16 複本）做無縫循環；自動轉 + 左右箭嘴；**唔可以再隱藏複本**（隱藏 = 無縫循環做唔到）
   - **箭咀 2026-11-22 起 hover／focus-within 先現身**（原本常駐黑圓冚住第一／最後一張卡嘅字）
   - `#dtTypeRows` 組別標籤 2026-11-22 起 `justify-content:space-between`（對齊 4 組卡嘅位置）
   - 光暈：`::before` + `radial-gradient(closest-side, …)` → 邊緣淡到 0，冇硬邊；`#home{overflow-x:clip}` 防止光暈撐出橫向 scroll
3. **測試版本 `#homeBelow`**：獨立一段、去咗白卡外框；細金字 kicker 改做 26px 大字標題；4 張卡 **stretch 等高**（`#versionList > *{margin:0 !important}` 抵銷 Tailwind `space-y` 造成嘅錯位）。
   **2026-11-22 起桌面 `.ver-more` 詳情長期顯示**（之前撳開先見，會推鬱下面內容令畫面跳）；舊規矩「`#versionList` 必須 `align-items:start`」已廢（嗰陣係為咗展開唔拉高其他卡；長開之後冇呢個問題），`desktop_layout_test.js` 同 `tools/ui/version_card_test.js` 嘅斷言已反轉做「必須 stretch」。
4. **港式日常情景**：`.scenes-bleed` 真全闊 `var(--soft)` 色帶；標題 + 副題；4 欄白色方塊（icon 喺上）。
5. **探索更多**：`.home-acc` 桌面 `repeat(5)` 一行 5 格（平板 `repeat(6)` + span 2 做 3+2 置中）；每格白色圓角方塊、等高、連結 `margin-top:auto` 貼底；桌面唔摺疊（`pointer-events:none`），手機風琴 JS 保留。2026-11-22 起段距放寬（上 80px／下 48px，唔再貼住上段同頁尾）。
6. ▼／▲ Top 按鈕桌面隱藏；**頁尾 `#dtFoot`**：版本 + 私隱聲明／香港統計／我的紀錄；`body` 桌面變 flex column，頁尾永遠貼底。

### 衛星頁（`record.html`／`stats.html`／`privacy.html`）頂 bar（2026-11-22 統一）
三頁桌面頂 bar 同主站同一款：品牌左置（icon + 「港式 MBTI」，撳返主頁）、中間 6 入口 popover 連結（同主站同序：百科→關於→比例→紀錄→計分→私隱；**當前頁加 `aria-current="page"`**，金下線用 `::after`）、右端金 CTA「立即測試」返主頁。
做法：HTML 喺 `.hero-row` 最前加 `<a class="dt-brand">`、`.hero-popover` 後加 `<a class="dt-cta-link">`；CSS 寫喺各頁**最尾無 id `<style>`**（唔係 `desktop-layer`，閘唔掃）：`.dt-brand,.dt-cta-link{display:none}` 預設隱藏；html.dt 下品牌左置、`.back-nav` 收埋、**`.hero-row` 個 h1／`.hero-title` 一定要 `position:static`**（base 係 absolute 置中，唔改會疊埋品牌）、popover 用 `order:1-6` 排序、主頁連結 `display:none`；768–1279 收埋頁面標題、768–1023 再收埋品牌字同 CTA、≥1280 連結升 15px。record.html 獨有 `.sep`（order:7）同「全部清除紀錄」button（order:8），`.sep` 淺底嘅 dk 覆蓋喺 record.html 嘅 `dark-layer`。三頁 `--dt-w` 分級已拉齊主站（1120／1200／1360／1440）。手機 hero 原樣（深藍漸變）。

### 其他畫面（桌面）
`#app > section:not(#home)`：720px 置中欄、左右 16px padding → 深藍頁頭（`margin:-24px -16px`）剛好同欄一樣闊，底部圓角 18px。

---

## 5 · 版本史

| Commit | 做咗咩 | 結果 |
|---|---|---|
| `70313a0` … `a9369c2` | 第 1–4 版桌面層（放寬、砌積木、① 大站導覽型…）| 用戶回報「排序錯亂、錯位」|
| `9e3f562` | 緊急修復：拆走手機桌面模式補償 | — |
| `55eaae8` `b5eae42` | `.dm` 窄條件還原 | 保留 |
| `84b4d4e` `dcdcaa0` | 註解整理 + 舊交接文件 | — |
| **v3（2026-09-28）** | **真 Chrome 審計後全面重做**（本文件）| 修正 §0 三個根因 |
| `cfec840`（2026-11-22）| 平板「香港分佈」Top3 卡單欄化＋Windows 工具鏈修復＋`.gitattributes`（鎖 LF）| 出貨 |
| `c4cfab5`（2026-11-22）| 桌面 ≥1024「香港分佈」段改單欄（修三欄字重疊）| 出貨 |
| `8846954`（2026-11-22）| **桌面 hero 重做**：MBTI 加級、轉盤卡 168–220px 分級、新增 ≥1680 斷點、組別標籤 space-between、轉盤箭咀 hover 先現身 | 出貨 |
| `5f71037`（2026-11-22）| 桌面版本卡詳情長開＋stretch 等高；「探索更多」段距放寬；record／stats 頂 bar 對齊主站 | 出貨 |
| `7209ecc`（2026-11-22）| privacy.html 頂 bar 統一（補返 sticky nav 塊）＋三衛星頁 `--dt-w` 拉齊主站 | 出貨 |

### 2026-09-28 審計發現（舊 ① 版）
- 主頁永遠收唔埋（`.hidden` 被蓋）→ 撳「開始測試」／揀版本之後，畫面頂部冇變，內容喺主頁下面
- 版本卡跑咗去 hero 上面，而且同 16 型卡 0px 貼住；第 1 張 97px 高、其餘 87px 兼低 10px
- 16 型卡仍然係手機 `width:6rem`（96px）→ 喺 154px 欄入面靠左、欄距唔均
- 情景 4 張卡擠喺 416px 單欄（`display:grid` 漏咗 + `max-width:26rem` 冇解除）
- 探索更多單欄 1360px 闊、字貼住白卡左邊
- hero 光暈畫喺成個 `#home` 上，中心被裁 → 米色硬邊長方形
- 舊 `desktop_layout_test.js`（41 項）全部用 regex 睇 CSS 文字 → 上面所有問題都「全部通過」

### 舊交接文件嘅錯誤講法（已更正）
- ✗「剝走桌面層 ＝ v2.0.0」：錯。v2.0.0 之後 `index.html` 有 ~700 行同桌面無關嘅改動（深層連結、語音、`#qDimension` 收埋、題庫計分、history seed…），文字 diff 永遠唔會等於 v2.0.0。
- ✓ **正確基準＝「現行 `index.html` 剝走桌面層」**，而且要**真 render 比 pixel**（`tools/mobile_zero_impact.py`）。
  （2026-09-28 另外核實：390px 主頁同 v2.0.0 render 出嚟都係 0 pixel 差異。）

---

## 6 · 點驗證（改完必做）

**出貨一律用出貨閘（唔准自己 `git push`）**：
```bash
sh tools/ship.sh "commit message"   # 11 套閘任何一個紅就拒絕 commit + push；閘數同斷言數一律由腳本自己印
SHIP_DRY=1 sh tools/ship.sh x        # 乾跑：只跑閘、唔 commit／push
```
閘入面嘅個別測試（debug／想單獨跑）：
```bash
cd <repo>
# jsdom（Windows：export NODE_PATH="$PWD/tools/ui/node_modules"）
node tools/desktop_layout_test.js   # 鐵律 + DOM 假設 + 開關
node tools/desktop_gate_test.js     # 開關情境
node tools/deeplink_test.js && node tools/record_view_test.js && node tools/voice_test.js
python3 tools/preflight.py          # 禁字／語法（pre-push hook 會連 gate_refs／gate_design 一齊跑）

# 真 Chrome（pip install playwright pillow numpy）
#   Windows：CHROME="C:\Program Files\Google\Chrome\Application\chrome.exe" PWPY=python3
python3 tools/desktop_render_test.py    # 真實位置（1440/1024 版式、冇橫向 scroll、#home 收得埋）
python3 tools/mobile_zero_impact.py     # 手機零影響：42 張截圖對基準；Windows 有 1–8px 渲染雜訊屬正常
# python3 tools/build_desktop_demo.py   # 只在需要 standalone demo 先跑（demo/ 已刪）
```

之後**親眼睇截圖**（`python3 tools/audit_shots.py`，要先起 `python3 -m http.server 8765`）：1920／1440／1280／1024／768／390，主頁 + 百科／類型／測試／結果／資料頁。

---

## 7 · 結構假設（改 DOM 就會壞，測試有守）

- `#home > .home-hero`；`.home-hero` 第一個子女係 logo 列（桌面隱藏）；hero 入面有 `.home-hero-copy`（含 `#dtHeroCta`）同 `#homeTypeReelWrap`（含 `#homeTypeReel` + `#dtTypeRows`）
- `#home` 直系：`#homeBelow`、`#resumeBanner`、`.scenes-bleed`、`div.mb-4 > #homeAccordion`、`.home-more-up-wrap`
- 16 型跑馬燈 32 張卡（前 16 真、後 16 重複），次序 NT／NF／SJ／SP → 對應 4 個組別標籤
- `#dtNav`、`#dtFoot` 係 `body` 直系子女；`#dtFoot` 喺 `#app` 後面
- 手機摺疊 JS `toggleHomeAcc` 必須保留

---

## 8 · 唔准做嘅事（Roy 已決定）

- ❌ 唔好郁**手機版**任何排版
- ❌ 唔好加 emoji、唔好返「白卡堆疊 + 金標」功課紙風
- ❌ 唔好改 app 名做淨「16型人格測試」
- ❌ 唔好加返廣告
- ❌ 未經 confirm 唔好 tag／backup

---

## 9 · 之後可以做（未做）

- 結果頁／類型頁桌面兩欄（而家係 `--dt-read` 單欄）
- 百科頁 16 型格（`.hub-type-grid`）桌面放大（而家同手機一樣 416px）
- 平板（768–1023）如有需要先考慮兩欄；而家刻意保持單欄
- Play Billing 真收費（B2，上架後嘅賺錢設計）；Apple Store（C3 全部未做）

---

## 10 · 流程（同 Roy 合作方式）

- 佢喺 **live** 睇（Windows，~1920px），睇完口頭／截圖回報
- **一次改一版**；改任何嘢之前先 audit 舊 commit 為何 work
- 回報格式：改咗咩檔、commit、live 有冇更新、仲要佢 confirm 咩
